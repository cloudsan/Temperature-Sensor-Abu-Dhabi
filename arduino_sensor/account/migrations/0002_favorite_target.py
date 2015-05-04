# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('demo', '0003_node'),
        ('account', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='favorite',
            name='target',
            field=models.ForeignKey(default=1, to='demo.Node'),
            preserve_default=False,
        ),
    ]
