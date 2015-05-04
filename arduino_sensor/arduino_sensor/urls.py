from django.conf.urls import patterns, include, url
from django.contrib import admin
from rest_framework import routers
from account import views,urls

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)
urlpatterns = patterns('',
                       # Examples:
                       # url(r'^$', 'arduino_sensor.views.home', name='home'),
                       # url(r'^blog/', include('blog.urls')),

                       url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
                       url(r'postdata', 'demo.views.postData'),
                       url(r'getdata/(?P<id>\d+)', 'demo.views.getData'),

                       url(r'getJsonTest', 'demo.views.getJsonTest'),

                       url(r'^admin/', include(admin.site.urls)),
                       url(r'^demo/historical/(?P<id>\d+)/$',
                         'demo.views.historical'),
                       url(r'^demo/mapview',
                         'demo.views.mapview'),
                       url(r'^demo/provideData',
                         'demo.views.provideData'),
                       url(r'^demo/bootstrap',
                         'demo.views.bootstrap'),
                                              url(r'^', include('account.urls')),
                       url(r'^', include(router.urls)),
                       )
