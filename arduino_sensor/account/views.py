from django.contrib.auth.models import User, Group
from django.shortcuts import render
from rest_framework import viewsets
from social.apps.django_app.utils import strategy
from rest_framework import parsers,renderers
# from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework import mixins,generics
from account.serializers import UserSerializer, GroupSerializer,FavoriteSerializer,NodeDataSerializer
from account.models import Favorite
from demo.models import nodeData
from django.contrib.auth.models import User
from rest_framework import permissions as permissions
from account.permissions import IsOwner
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.authtoken.models import Token
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated,IsAuthenticatedOrReadOnly
from social.apps.django_app.utils import load_strategy, load_backend
from rest_framework.authentication import get_authorization_header

# Create your views here.
class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

class FavoriteList(generics.ListCreateAPIView):
    # permission_classes = (permissions.IsAuthenticated,)
    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer
    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous():
            return Favorite.objects.none()
        else:
            return user.favorites.all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class FavoriteNodeData(generics.ListAPIView):
    permission_classes = (IsOwner,)
    queryset = nodeData.objects.all()
    serializer_class = NodeDataSerializer
    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous():
            return nodeData.objects.none()
        else:
            result= nodeData.objects.raw(
        'select  * from (select distinct node_id,max(dt) as maxdt from demo_nodedata group by node_id) x join demo_nodedata d on d.node_id ==x.node_id and d.dt = x.maxdt join account_favorite as a on a.target_id == x.node_id and a.owner_id ='+str(user.id)+' order by maxdt desc')
            # result=result.filter(node_id=1)
            # result= nodeData.ob
            return result

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class NodeDataList(generics.ListAPIView):
    permission_classes = (IsOwner,)
    queryset = nodeData.objects.all()
    serializer_class = NodeDataSerializer
    def get_queryset(self):

        result= nodeData.objects.raw(
    'select * from (select node_id,max(dt) as maxdt from demo_nodedata group by node_id) x join demo_nodedata d on d.node_id ==x.node_id and d.dt = x.maxdt order by maxdt desc;')
        # result=result.filter(node_id=1)
        # result= nodeData.ob
        return result

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class NodeDataDetail(generics.ListAPIView):
    permission_classes = (IsAuthenticatedOrReadOnly,)

    queryset = nodeData.objects.all()
    serializer_class = NodeDataSerializer
    def get_queryset(self):
        node_id = self.kwargs.get("id")
        return nodeData.objects.filter(node_id = node_id).order_by('-dt')[:100][::-1]

class FavoriteDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsOwner,)
    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer

class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDetail(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

@strategy()
def register_by_access_token(request, backend):
    uri=''
    strategy = load_strategy(request)
    backend = load_backend(strategy, backend, uri)
    # Split by spaces and get the array
    auth = get_authorization_header(request).split()

    if not auth or auth[0].lower() != b'bearer':
        msg = 'No token header provided.'
        return msg

    if len(auth) == 1:
        msg = 'Invalid token header. No credentials provided.'
        return msg

    access_token = auth[1].decode(encoding='UTF-8')

    user = backend.do_auth(access_token)

    return user

class ObtainAuthToken(APIView):
    throttle_classes = ()
    permission_classes = ()
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    serializer_class = AuthTokenSerializer
    model = Token

    # Accept backend as a parameter and 'auth' for a login / pass
    def post(self, request, backend):
        serializer = self.serializer_class(data=request.DATA)

        if backend == 'auth':
            if serializer.is_valid():
                token, created = Token.objects.get_or_create(user=serializer.object['user'])
                return Response({'token': token.key})
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        else:
            # Here we call PSA to authenticate like we would if we used PSA on server side.
            user = register_by_access_token(request, backend)
            if isinstance(user, str):
                return Response(user,status=500)
            # If user is active we get or create the REST token and send it back with user data
            if user and user.is_active:
                token, created = Token.objects.get_or_create(user=user)
                return Response({'id': user.id , 'name': user.username, 'userRole': 'user','token': token.key})

class ObtainLogout(APIView):
    throttle_classes = ()
    permission_classes = ()
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    serializer_class = AuthTokenSerializer
    model = Token

    # Logout le user
    def get(self, request):
        return Response({'User': ''})
