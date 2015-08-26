from django.db.models import Q
from django.shortcuts import render
from rest_framework.filters import OrderingFilter
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from bookmarks.models import Bookmark
from bookmarks.serializers import BookmarkSerializer

class BookmarkListCreateAPIView(ListCreateAPIView):
    serializer_class = BookmarkSerializer
    filter_backends = (OrderingFilter,)
    ordering_fields = ('id', 'url', 'title', 'bookmarked_at')

    def get_queryset(self):
        queryset = Bookmark.objects.all()
        search_text = self.request.query_params.get('search_text', None)
        if search_text is not None:
            queryset = queryset.filter(Q(title__contains=search_text) | Q(url__contains=search_text))
        return queryset


class BookmarkRetrieveUpdateDestroyAPIView(ListCreateAPIView):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer
    lookup_field = 'bookmark_id'
