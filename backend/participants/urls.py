from django.urls import path
from .views import (
    RegisterForEventView, EventRegistrationsView,
    MyRegistrationsView, ValidateRegistrationView, ValidateByTokenView,
)

urlpatterns = [
    path('events/<int:event_id>/register/', RegisterForEventView.as_view(), name='event-register'),
    path('events/<int:event_id>/registrations/', EventRegistrationsView.as_view(), name='event-registrations'),
    path('my-registrations/', MyRegistrationsView.as_view(), name='my-registrations'),
    path('registrations/<int:pk>/validate/', ValidateRegistrationView.as_view(), name='validate-registration'),
    path('registrations/validate-token/', ValidateByTokenView.as_view(), name='validate-by-token'),
]
