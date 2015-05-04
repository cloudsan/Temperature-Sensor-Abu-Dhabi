from django.contrib import admin
from demo.models import Arduino_data, Setting, nodeData,Node
from account.models import Favorite
# Register your models here.

admin.site.register(Setting)
# admin.site.register(Arduino_data)
admin.site.register(nodeData)
admin.site.register(Node)
admin.site.register(Favorite)


