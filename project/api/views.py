from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from logging import getLogger

from bookmarks.models import Bookmark

logger = getLogger(__name__)

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
    return JsonResponse(data)

@csrf_exempt
def bookmark(request, bookmark_id):
    data = {}
    if request.method == 'DELETE':
        try:
            bookmark = Bookmark.objects.get(pk=bookmark_id)
            bookmark.delete()
            return JsonResponse(data, status=204)
        except:
            data = {
                'errors': [{
                    'title': 'ブックマークを削除できませんでした'
                }]
            }
            return JsonResponse(data, status=500)
    return JsonResponse(data)

