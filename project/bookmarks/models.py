from django.core.urlresolvers import reverse
from django.db import models

class Bookmark(models.Model):
    url = models.TextField(unique=True)
    title = models.TextField()
    bookmarked_at = models.DateTimeField(auto_now_add=True)

    def get_absolute_url(self):
        return reverse('apiv2:bookmark', kwargs={'bookmark_id': self.id})
