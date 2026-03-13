from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Organizer


class OrganizerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = Organizer
        fields = ['id', 'event', 'user', 'door_number', 'work_schedule', 'first_name', 'last_name', 'email']
        read_only_fields = ['id', 'event', 'user']
