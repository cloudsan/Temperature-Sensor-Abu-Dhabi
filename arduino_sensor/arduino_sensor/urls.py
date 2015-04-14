from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
                       # Examples:
                       # url(r'^$', 'arduino_sensor.views.home', name='home'),
                       # url(r'^blog/', include('blog.urls')),
                       url(r'postdata', 'demo.views.postData'),
                       url(r'getdata', 'demo.views.getData'),
                       url(r'^admin/', include(admin.site.urls)),
                       url(r'^demo/historical/(?P<id>\d+)/$',
                           'demo.views.historical'),
                       url(r'^demo/mapview',
                           'demo.views.mapview'),
                       url(r'^demo/provideData',
                           'demo.views.provideData'),
                       url(r'^demo/bootstrap',
                           'demo.views.bootstrap'),
                       )
