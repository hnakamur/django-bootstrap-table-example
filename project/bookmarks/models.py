from django.db import models

class Bookmark(models.Model):
    url = models.TextField(unique=True)
    title = models.TextField()
    bookmarked_at = models.DateTimeField(auto_now_add=True)
