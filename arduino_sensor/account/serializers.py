from django.contrib.auth.models import User, Group
from rest_framework import serializers
from account.models import Favorite
from demo.models import nodeData


class UserSerializer(serializers.HyperlinkedModelSerializer):
    favorites = serializers.PrimaryKeyRelatedField(many=True, queryset=Favorite.objects.all())
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'groups','favorites')

class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('url', 'name')

class FavoriteSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    # test = serializers.ReadOnlyField(source='target')
    class Meta:
        model= Favorite
        fields = ('created','target','id','owner')

class NodeDataSerializer(serializers.ModelSerializer):
    dt = serializers.DateTimeField(format='iso-8601')
    node_name=serializers.ReadOnlyField(source='node.name')
    node_desc=serializers.ReadOnlyField(source='node.description')

    class Meta:

        model= nodeData
        fields = ('t1','t2','h1','h2','lng','lat','dt','node','node_name','node_desc')
