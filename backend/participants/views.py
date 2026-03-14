from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone

from events.models import Event
from events.permissions import IsClientUser, IsOrganizerUser
from .models import Registration
from .serializers import RegistrationSerializer, RegistrationCreateSerializer
from .utils import generate_ticket_pdf


class RegisterForEventView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, event_id):
        event = get_object_or_404(Event, pk=event_id, status='approved')
        if Registration.objects.filter(event=event, participant=request.user).exists():
            return Response({'detail': 'Already registered.'}, status=status.HTTP_400_BAD_REQUEST)
        if event.registrations.count() >= event.max_capacity:
            return Response({'detail': 'Event is full.'}, status=status.HTTP_400_BAD_REQUEST)

        reg = Registration.objects.create(event=event, participant=request.user)

        # Send ticket PDF + HTML email
        try:
            pdf_buf = generate_ticket_pdf(reg)
            base_url = getattr(settings, 'BASE_URL', 'http://localhost:8000')
            html_body = render_to_string('emails/ticket_email.html', {
                'event': event,
                'participant': request.user,
                'registration': reg,
                'base_url': base_url,
                'year': timezone.now().year,
            })
            plain_body = (
                f"Hello {request.user.first_name},\n\n"
                f"Your ticket for {event.title} is attached.\n\n"
                f"Date: {event.date.strftime('%B %d, %Y')}\n"
                f"Location: {event.location}\n\n"
                f"See you there!\n\nEventora"
            )
            msg = EmailMultiAlternatives(
                subject=f"Your ticket for {event.title}",
                body=plain_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[request.user.email],
            )
            msg.attach_alternative(html_body, 'text/html')
            msg.attach(f"ticket_{event.slug}.pdf", pdf_buf.read(), 'application/pdf')
            msg.send(fail_silently=True)
            reg.ticket_sent = True
            reg.save(update_fields=['ticket_sent'])
        except Exception:
            pass

        return Response(RegistrationSerializer(reg).data, status=status.HTTP_201_CREATED)


class EventRegistrationsView(generics.ListAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [IsClientUser]

    def get_queryset(self):
        return Registration.objects.filter(event_id=self.kwargs['event_id']).select_related('participant', 'event')


class MyRegistrationsView(generics.ListAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Registration.objects.filter(participant=self.request.user).select_related('event')


class ValidateRegistrationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        reg = get_object_or_404(Registration, pk=pk)
        if request.user.role not in ('organizer', 'admin', 'client'):
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        reg.is_present = True
        reg.save(update_fields=['is_present'])
        return Response(RegistrationSerializer(reg).data)


class ValidateByTokenView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'detail': 'Token required.'}, status=status.HTTP_400_BAD_REQUEST)
        reg = get_object_or_404(Registration, token=token)
        if reg.is_present:
            return Response({'detail': 'Already validated.', 'participant': reg.participant.get_full_name()}, status=status.HTTP_200_OK)
        reg.is_present = True
        reg.save(update_fields=['is_present'])
        return Response({
            'detail': 'Validated successfully.',
            'participant': reg.participant.get_full_name(),
            'event': reg.event.title,
        })
