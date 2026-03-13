from django.urls import path
from .views import (
    EventListCreateView, EventDetailView, EventDetailByIdView,
    ApproveEventView, RejectEventView, EventPublicDetailView,
)

urlpatterns = [
    path('events/', EventListCreateView.as_view(), name='event-list-create'),
    path('events/<slug:slug>/', EventDetailView.as_view(), name='event-detail'),
    path('events/<int:pk>/detail/', EventDetailByIdView.as_view(), name='event-detail-by-id'),
    path('events/<int:pk>/approve/', ApproveEventView.as_view(), name='event-approve'),
    path('events/<int:pk>/reject/', RejectEventView.as_view(), name='event-reject'),
    path('public/events/<slug:slug>/', EventPublicDetailView.as_view(), name='event-public-detail'),
]
