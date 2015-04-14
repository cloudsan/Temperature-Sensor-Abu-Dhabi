from django.contrib import admin
from demo.models import Arduino_data, Setting, nodeData
# Register your models here.

admin.site.register(Setting)
# admin.site.register(Arduino_data)
admin.site.register(nodeData)
