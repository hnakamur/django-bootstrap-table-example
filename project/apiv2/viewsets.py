from django.db.models import Q
from django.shortcuts import render
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework_json_api.renderers import JSONRenderer
from rest_framework.viewsets import ModelViewSet

from bookmarks.models import Bookmark
from bookmarks.serializers import BookmarkSerializer

class BookmarkViewSet(ModelViewSet):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer
    resource_name = 'bookmark'
    renderer_classes = (JSONRenderer,)
    filter_backends = (SearchFilter, OrderingFilter)
    search_fields = ('url', 'title')
    ordering_fields = ('id', 'url', 'title', 'bookmarked_at')
