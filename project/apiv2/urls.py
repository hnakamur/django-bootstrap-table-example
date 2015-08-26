from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^bookmarks/$', views.BookmarkListCreateAPIView.as_view(), name='bookmarks'),
    url(r'^bookmarks/(?P<bookmark_id>\d+)/$', views.BookmarkRetrieveUpdateDestroyAPIView.as_view(), name='bookmark'),
]

