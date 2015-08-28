# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import bookmarks.fields


class Migration(migrations.Migration):

    replaces = [('bookmarks', '0001_initial'), ('bookmarks', '0002_auto_20150828_0954')]

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Bookmark',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', auto_created=True, primary_key=True)),
                ('url', bookmarks.fields.URLTextField(unique=True)),
                ('title', models.TextField()),
                ('bookmarked_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
