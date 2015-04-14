# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('demo', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='nodeData',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True, serialize=False)),
                ('node_id', models.IntegerField()),
                ('t1', models.FloatField(default=0)),
                ('t2', models.FloatField(default=0)),
                ('h1', models.FloatField(default=0)),
                ('h2', models.FloatField(default=0)),
                ('lng', models.FloatField(default=0)),
                ('lat', models.FloatField(default=0)),
                ('dt', models.DateTimeField()),
            ],
        ),
    ]
