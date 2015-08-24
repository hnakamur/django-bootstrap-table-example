from django.http import JsonResponse
from django.shortcuts import render

from bookmarks.models import Bookmark

def bookmarks(request):
    bookmarks = Bookmark.objects.all()
    offset = int(request.GET.get('offset') or '0')
    limit = int(request.GET.get('limit') or len(bookmarks) - offset)
    rows = [{
        'id': b.id,
        'url': b.url,
        'title': b.title,
        'bookmarked_at': b.bookmarked_at
    } for b in bookmarks[offset:offset + limit]]
    data = {
        'total': len(bookmarks),
        'rows': rows
    }
    response = JsonResponse(data, safe=False)
    #response['Access-Control-Allow-Origin'] = '*'
    #response['Access-Control-Allow-Headers'] = 'X-Requested-With'
    return response
