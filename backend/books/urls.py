from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, scrape_and_store, ask_question, recommend_books

router = DefaultRouter()
router.register(r'books', BookViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('upload-book/', scrape_and_store, name='scrape-and-store'),
    path('ask/', ask_question, name='ask-question'),
    path('books/recommend/<int:pk>/', recommend_books, name='recommend-books'),
]
