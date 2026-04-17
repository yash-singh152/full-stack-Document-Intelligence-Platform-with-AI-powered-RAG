from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Book, ChatHistory
from .serializers import BookSerializer, ChatHistorySerializer
from .scraper import BookScraper
from .ai_service import AIService
from .rag_service import RAGService

# Global services (initialized lazily or here for simplicity)
ai_service = AIService()
rag_service = RAGService()
scraper = BookScraper()

class BookViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Book.objects.all().order_by('-created_at')
    serializer_class = BookSerializer

@api_view(['POST'])
def scrape_and_store(request):
    """Scrapes books from the source and indexes them."""
    try:
        limit = request.data.get('limit', 10)
        books_data = scraper.scrape_books(limit=limit)
        books = scraper.save_books(books_data)
        
        # Add AI insights and Index for RAG
        for book in books:
            if not book.summary or not book.genre:
                book.summary = ai_service.generate_summary(book.description)
                book.genre = ai_service.predict_genre(book.description)
                book.save()
            
            # Index for RAG
            rag_service.index_book(book)
            
        return Response({"message": f"Successfully scraped and processed {len(books)} books."}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def ask_question(request):
    """Answers a question using the RAG pipeline."""
    question = request.data.get('question')
    if not question:
        return Response({"error": "Question is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Search for context
        search_results = rag_service.search(question)
        context, sources = rag_service.get_context(search_results)
        
        # Generate answer
        answer = ai_service.answer_question(context, question)
        
        # Save to history
        chat = ChatHistory.objects.create(question=question, answer=answer)
        
        return Response({
            "answer": answer,
            "sources": sources,
            "chat_id": chat.id
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def recommend_books(request, pk):
    """Recommends similar books based on the current book's description."""
    try:
        book = Book.objects.get(pk=pk)
        # Search for similar content
        search_results = rag_service.search(book.description, top_k=6)
        
        recommended_ids = []
        for meta in search_results['metadatas'][0]:
            if meta['book_id'] != book.id: # Don't recommend itself
                recommended_ids.append(meta['book_id'])
        
        # Remove duplicates and limit
        recommended_ids = list(dict.fromkeys(recommended_ids))[:4]
        recommended_books = Book.objects.filter(id__in=recommended_ids)
        
        serializer = BookSerializer(recommended_books, many=True)
        return Response(serializer.data)
    except Book.DoesNotExist:
        return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
