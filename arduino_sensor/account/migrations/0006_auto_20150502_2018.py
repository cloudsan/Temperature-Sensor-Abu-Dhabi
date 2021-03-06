# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0005_auto_20150502_1953'),
    ]

    operations = [
        migrations.AlterField(
            model_name='favorite',
            name='owner',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL, related_name='favorites'),
        ),
    ]
