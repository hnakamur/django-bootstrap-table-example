from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^v1/bookmarks/$', views.bookmarks, name='bookmarks'),
]
