# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('account', '0003_favorite_user'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='favorite',
            name='user',
        ),
        migrations.AddField(
            model_name='favorite',
            name='owner',
            field=models.ForeignKey(related_name='favorites', default=1, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
