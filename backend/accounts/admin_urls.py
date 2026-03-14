from django.urls import path
from .views import AdminUsersView, AdminUserDetailView

urlpatterns = [
    path('admin/users/', AdminUsersView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
]
