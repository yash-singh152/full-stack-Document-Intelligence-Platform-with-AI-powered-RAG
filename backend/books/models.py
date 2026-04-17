from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=500)
    author = models.CharField(max_length=500, default="Unknown")
    rating = models.CharField(max_length=50, null=True, blank=True)
    description = models.TextField()
    url = models.URLField(max_length=1000, unique=True)
    summary = models.TextField(null=True, blank=True)
    genre = models.CharField(max_length=200, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class ChatHistory(models.Model):
    question = models.TextField()
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Q: {self.question[:50]}..."
