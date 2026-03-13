from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Event
from .serializers import EventSerializer, EventCreateSerializer
from .permissions import IsAdminUser, IsClientUser, IsEventOwner
from speakers.serializers import SpeakerSerializer
from sponsors.serializers import SponsorSerializer
from organizers.serializers import OrganizerSerializer


class EventListCreateView(generics.ListCreateAPIView):
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role == 'admin':
                return Event.objects.all()
            elif user.role == 'client':
                return Event.objects.filter(client=user)
        return Event.objects.filter(status='approved')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventCreateSerializer
        return EventSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsClientUser()]

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    lookup_field = 'slug'

    def get_queryset(self):
        return Event.objects.all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EventCreateSerializer
        return EventSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsEventOwner()]


class EventDetailByIdView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EventCreateSerializer
        return EventSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class ApproveEventView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        event = get_object_or_404(Event, pk=pk)
        event.status = 'approved'
        event.save()
        return Response(EventSerializer(event).data)


class RejectEventView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        event = get_object_or_404(Event, pk=pk)
        event.status = 'rejected'
        event.save()
        return Response(EventSerializer(event).data)


class EventPublicDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        event = get_object_or_404(Event, slug=slug, status='approved')
        data = EventSerializer(event).data
        data['speakers'] = SpeakerSerializer(event.speakers.all(), many=True, context={'request': request}).data
        data['sponsors'] = SponsorSerializer(event.sponsors.all(), many=True, context={'request': request}).data
        return Response(data)
