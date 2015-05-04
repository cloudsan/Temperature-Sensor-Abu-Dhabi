# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('demo', '0003_node'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='nodedata',
            name='node_id',
        ),
        migrations.AddField(
            model_name='nodedata',
            name='node',
            field=models.ForeignKey(to='demo.Node', default=1),
            preserve_default=False,
        ),
    ]
