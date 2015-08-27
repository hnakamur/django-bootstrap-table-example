from django.conf.urls import url

from .viewsets import BookmarkViewSet

bookmark_list = BookmarkViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

bookmark_detail = BookmarkViewSet.as_view({
    'get': 'retrieve',
    'patch': 'update',
    'delete': 'destroy'
})

urlpatterns = [
    url(r'^bookmarks/$', bookmark_list, name='bookmarks'),
    url(r'^bookmarks/(?P<pk>[0-9]+)/$', bookmark_detail, name='bookmark'),
]

