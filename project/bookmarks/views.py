from django.shortcuts import render

def index(request):
    context = {}
    return render(request, 'bookmarks/index.html', context)
