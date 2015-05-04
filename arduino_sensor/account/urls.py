from django.conf.urls import patterns, include, url
from rest_framework.urlpatterns import format_suffix_patterns
from account import views

urlpatterns = [
url(r'^account/favorites/$', views.FavoriteList.as_view()),
url(r'^account/favorites/(?P<pk>[0-9]+)$', views.FavoriteDetail.as_view()),
url(r'^account/nodes/$', views.FavoriteNodeData.as_view()),
url(r'^account/node/(?P<id>[0-9]+)$', views.NodeDataDetail.as_view()),

url(r'^allnodes/$', views.NodeDataList.as_view()),

url(r'^users/$', views.UserList.as_view()),
url(r'^users/(?P<pk>[0-9]+)/$', views.UserDetail.as_view()),
url(r'^api-token/login/(?P<backend>[^/]+)/$', views.ObtainAuthToken.as_view()),
url(r'^api-token/logout/', views.ObtainLogout.as_view()),
url('', include('social.apps.django_app.urls', namespace='social')),
   url('', include('django.contrib.auth.urls', namespace='auth')),
]

from rest_framework.authtoken import views
urlpatterns += [
    url(r'^api-token-auth/', views.obtain_auth_token)
]

urlpatterns = format_suffix_patterns(urlpatterns)
