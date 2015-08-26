from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^bookmarks/$', views.bookmarks, name='bookmarks'),
    url(r'^bookmarks/(?P<bookmark_id>\d+)/$', views.bookmark, name='bookmark'),
]
