from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
import secrets

from events.models import Event
from events.permissions import IsClientUser
from accounts.models import User
from .models import Organizer
from .serializers import OrganizerSerializer


class OrganizerListCreateView(generics.ListCreateAPIView):
    serializer_class = OrganizerSerializer
    permission_classes = [IsClientUser]

    def get_queryset(self):
        return Organizer.objects.filter(event_id=self.kwargs['event_id'])

    def create(self, request, *args, **kwargs):
        event = get_object_or_404(Event, pk=self.kwargs['event_id'])
        data = request.data
        # Auto-create organizer user account
        password = secrets.token_urlsafe(10)
        username = data.get('email', '').split('@')[0] + secrets.token_hex(3)
        user = User.objects.create_user(
            username=username,
            email=data.get('email', ''),
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            password=password,
            role='organizer',
        )
        organizer = Organizer.objects.create(
            event=event,
            user=user,
            door_number=data.get('door_number', ''),
            work_schedule=data.get('work_schedule', ''),
        )
        # Send credentials email
        try:
            send_mail(
                subject=f"Your Eventora organizer credentials for {event.title}",
                message=f"Hello {user.first_name},\n\nYou have been assigned as organizer for '{event.title}'.\n\nUsername: {user.username}\nPassword: {password}\n\nDoor: {organizer.door_number}\nSchedule: {organizer.work_schedule}\n\nBest regards,\nEventora",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception:
            pass
        return Response(OrganizerSerializer(organizer).data, status=status.HTTP_201_CREATED)


class OrganizerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrganizerSerializer
    queryset = Organizer.objects.all()
    permission_classes = [IsClientUser]


class MyOrganizerView(generics.RetrieveAPIView):
    serializer_class = OrganizerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return get_object_or_404(Organizer, user=self.request.user)
