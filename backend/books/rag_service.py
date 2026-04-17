import chromadb
from sentence_transformers import SentenceTransformer
from .models import Book

class RAGService:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        # Persistent storage for ChromaDB
        self.client = chromadb.PersistentClient(path="./chroma_db")
        self.collection = self.client.get_or_create_collection("book_descriptions")

    def chunk_text(self, text, chunk_size=500, overlap=100):
        chunks = []
        for i in range(0, len(text), chunk_size - overlap):
            chunks.append(text[i:i + chunk_size])
        return chunks

    def index_book(self, book: Book):
        chunks = self.chunk_text(book.description)
        embeddings = self.model.encode(chunks).tolist()
        
        ids = [f"{book.id}_{i}" for i in range(len(chunks))]
        metadatas = [{"book_id": book.id, "title": book.title} for _ in range(len(chunks))]
        
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )

    def search(self, query, top_k=3):
        query_embedding = self.model.encode([query]).tolist()
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=top_k
        )
        return results

    def get_context(self, search_results):
        context = ""
        sources = []
        for doc, meta in zip(search_results['documents'][0], search_results['metadatas'][0]):
            context += f"\n--- Source: {meta['title']} ---\n{doc}\n"
            sources.append(meta['title'])
        return context, list(set(sources))
