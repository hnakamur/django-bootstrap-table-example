from datetime import datetime
from html.parser import HTMLParser
from django.core.management.base import BaseCommand, CommandError
from django.db.utils import IntegrityError
from django.utils import timezone

from bookmarks.models import Bookmark

def unixtime2datetime(t):
    dt = datetime.fromtimestamp(int(t))
    return timezone.make_aware(dt)

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super(MyHTMLParser, self).__init__()
        self.in_a = False
        self.attrs = {}

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self.in_a = True
            for (key, value) in attrs:
                self.attrs[key] = value

    def handle_endtag(self, tag):
        if tag == 'a':
            self.in_a = False

    def handle_data(self, data):
        if self.in_a:
            bookmark = Bookmark()
            bookmark.url = self.attrs.get('href')
            bookmark.title = data
            bookmark.bookmarked_at = unixtime2datetime(self.attrs.get('add_date'))
            try:
                bookmark.save()
            except IntegrityError:
                pass


def import_bookmarks(html_file):
    with open(html_file, 'r') as f:
        parser = MyHTMLParser()
        for chunk in f:
            parser.feed(chunk)

class Command(BaseCommand):
    help = 'import delicious format html bookmarks'

    def add_arguments(self, parser):
        parser.add_argument('html_file', nargs=1, type=str)

    def handle(self, *args, **options):
        html_file = options['html_file'][0]
        import_bookmarks(html_file)
