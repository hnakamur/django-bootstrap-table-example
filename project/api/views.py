from django.http import JsonResponse
from django.shortcuts import render

from bookmarks.models import Bookmark

def bookmarks(request):
    bookmarks = Bookmark.objects.all()[:10]
    rows = [{
        'id': b.id,
        'url': b.url,
        'title': b.title,
        'bookmarked_at': b.bookmarked_at
    } for b in bookmarks]
    data = {
        'total': len(bookmarks),
        'rows': rows
    }
    response = JsonResponse(data, safe=False)
    #response['Access-Control-Allow-Origin'] = '*'
    #response['Access-Control-Allow-Headers'] = 'X-Requested-With'
    return response
