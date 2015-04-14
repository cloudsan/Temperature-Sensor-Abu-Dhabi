from django.contrib import admin
from demo.models import Arduino_data, Setting
# Register your models here.

admin.site.register(Setting)
admin.site.register(Arduino_data)
