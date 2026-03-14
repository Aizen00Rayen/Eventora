from django.urls import path
from .views import (
    RegisterForEventView, EventRegistrationsView,
    MyRegistrationsView, ValidateRegistrationView, ValidateByTokenView,
    AdminRegistrationsView, ApprovePaymentView, RejectPaymentView,
)

urlpatterns = [
    path('events/<int:event_id>/register/', RegisterForEventView.as_view(), name='event-register'),
    path('events/<int:event_id>/registrations/', EventRegistrationsView.as_view(), name='event-registrations'),
    path('my-registrations/', MyRegistrationsView.as_view(), name='my-registrations'),
    path('registrations/<int:pk>/validate/', ValidateRegistrationView.as_view(), name='validate-registration'),
    path('registrations/validate-token/', ValidateByTokenView.as_view(), name='validate-by-token'),
    # Admin
    path('admin/registrations/', AdminRegistrationsView.as_view(), name='admin-registrations'),
    path('admin/registrations/<int:pk>/approve/', ApprovePaymentView.as_view(), name='approve-payment'),
    path('admin/registrations/<int:pk>/reject/', RejectPaymentView.as_view(), name='reject-payment'),
]
