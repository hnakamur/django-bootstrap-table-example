from django.http import JsonResponse
from django.shortcuts import render

from .models import Bookmark

def index(request):
    context = {}
    return render(request, 'bookmarks/index.html', context)
