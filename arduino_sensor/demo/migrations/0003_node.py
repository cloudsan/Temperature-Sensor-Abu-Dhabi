# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('demo', '0002_nodedata'),
    ]

    operations = [
        migrations.CreateModel(
            name='Node',
            fields=[
                ('id', models.IntegerField(serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=30)),
                ('description', models.TextField()),
            ],
            options={
                'verbose_name': 'Node',
                'verbose_name_plural': 'Nodes',
            },
        ),
    ]
