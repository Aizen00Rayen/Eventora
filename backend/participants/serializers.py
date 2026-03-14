from rest_framework import serializers
from accounts.serializers import UserSerializer
from events.serializers import EventSerializer
from .models import Registration


class RegistrationSerializer(serializers.ModelSerializer):
    participant = UserSerializer(read_only=True)
    event = EventSerializer(read_only=True)

    class Meta:
        model = Registration
        fields = [
            'id', 'event', 'participant', 'token', 'qr_code',
            'is_present', 'registered_at', 'ticket_sent',
            'payment_receipt', 'payment_status',
        ]
        read_only_fields = ['id', 'token', 'qr_code', 'registered_at', 'ticket_sent']


class RegistrationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        fields = ['id', 'event', 'token', 'qr_code', 'is_present', 'registered_at', 'payment_receipt', 'payment_status']
        read_only_fields = ['id', 'token', 'qr_code', 'is_present', 'registered_at', 'payment_status']
