from django.core.paginator import Paginator, EmptyPage
from django.http import JsonResponse
from django.shortcuts import render
from django.db.models import Q
from django.views.decorators.csrf import ensure_csrf_cookie
from logging import getLogger

from bookmarks.models import Bookmark

logger = getLogger(__name__)

@ensure_csrf_cookie
def bookmarks(request):
    if request.method == 'GET':
        return _get_bookmarks(request)
    elif request.method == 'POST':
        return _post_bookmarks(request)
    else:
        return JsonResponse({}, status=405)

def _get_bookmarks(request):
    search = request.GET.get('searchText')
    if search:
        bookmarks = Bookmark.objects.filter(Q(title__contains=search) | Q(url__contains=search))
    else:
        bookmarks = Bookmark.objects.all()
    sort = request.GET.get('sortName')
    if sort and sort in ('id', 'url', 'title', 'bookmarked_at'):
        if request.GET.get('sortOrder') == 'desc':
            order = '-{0}'.format(sort)
        else:
            order = sort
        bookmarks = bookmarks.order_by(order)

    page_number = _page_number(request)
    page_size = _page_size(request)
    paginator = Paginator(bookmarks, page_size)
    try:
        page = paginator.page(page_number)
    except EmptyPage:
        page_number = paginator.num_pages
        page = paginator.page(page_number)

    rows = [{
        'id': b.id,
        'url': b.url,
        'title': b.title,
        'bookmarked_at': b.bookmarked_at
    } for b in page]
    data = {
        'total': len(bookmarks),
        'rows': rows
    }
    return JsonResponse(data)

PAGE_SIZES = [10, 25, 50, 1000]
DEFAULT_PAGE_SIZE = PAGE_SIZES[0]

def _page_size(request):
    try:
        page_size = int(request.GET.get('pageSize') or str(DEFAULT_PAGE_SIZE))
    except ValueError:
        page_size = DEFAULT_PAGE_SIZE
    if page_size not in PAGE_SIZES:
        page_size = DEFAULT_PAGE_SIZE
    return page_size

DEFAULT_PAGE_NUMBER = 1

def _page_number(request):
    try:
        page_number = int(request.GET.get('pageNumber') or str(DEFAULT_PAGE_NUMBER))
    except ValueError:
        page_size = DEFAULT_PAGE_NUMBER
    if page_number < 1:
        page_number = 1
    return page_number

def _post_bookmarks(request):
    try:
        url = request.POST['url']
        title = request.POST['title']
        if not url or not title:
            data = {
                'errors': [{
                    'title': 'URLとタイトルは必須項目です'
                }]
            }
            return JsonResponse(data, status=400)

        bookmark = Bookmark()
        bookmark.url = url
        bookmark.title = title
        bookmark.save()
        return JsonResponse({}, status=201)
    except:
        data = {
            'errors': [{
                'title': 'ブックマークを登録できませんでした'
            }]
        }
        return JsonResponse(data, status=500)

@ensure_csrf_cookie
def bookmark(request, bookmark_id):
    if request.method == 'DELETE':
        return _delete_bookmark(request, bookmark_id)
    else:
        return JsonResponse({}, status=405)

def _delete_bookmark(request, bookmark_id):
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
