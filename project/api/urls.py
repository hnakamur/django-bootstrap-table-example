from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^v1/bookmarks/$', views.bookmarks, name='bookmarks'),
    url(r'^v1/bookmarks/(?P<bookmark_id>\d+)/$', views.bookmark, name='bookmark'),
]
