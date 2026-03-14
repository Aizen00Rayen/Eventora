from rest_framework import serializers
from .models import Event
from accounts.serializers import UserSerializer


class EventSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    registrations_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'date', 'location', 'max_capacity',
            'logo', 'theme', 'status', 'slug', 'client', 'created_at', 'updated_at',
            'registrations_count', 'ticket_type', 'price',
        ]
        read_only_fields = ['id', 'slug', 'client', 'status', 'created_at', 'updated_at']

    def get_registrations_count(self, obj):
        return obj.registrations.count()


class EventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'location', 'max_capacity', 'logo', 'theme', 'slug', 'status', 'ticket_type', 'price']
        read_only_fields = ['id', 'slug', 'status']
