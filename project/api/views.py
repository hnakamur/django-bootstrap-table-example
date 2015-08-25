from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from logging import getLogger

from bookmarks.models import Bookmark

logger = getLogger(__name__)

@ensure_csrf_cookie
def bookmarks(request):
    if request.method == 'GET':
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
    elif request.method == 'POST':
        url = request.POST['url']
        title = request.POST['title']
        bookmark = Bookmark()
        bookmark.url = url
        bookmark.title = title
        bookmark.save()
        logger.debug('create bookmark for url={0}, title={1}'.format(url, title))
        data = {}
        return JsonResponse(data, status=201)
    else:
        return JsonResponse({}, status=405)

@ensure_csrf_cookie
def bookmark(request, bookmark_id):
    if request.method == 'DELETE':
        try:
            bookmark = Bookmark.objects.get(pk=bookmark_id)
            bookmark.delete()
            return JsonResponse({}, status=204)
        except:
            data = {
                'errors': [{
                    'title': 'ブックマークを削除できませんでした'
                }]
            }
            return JsonResponse(data, status=500)
    else:
        return JsonResponse({}, status=405)

