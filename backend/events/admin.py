from django.contrib import admin
from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'client', 'status', 'date', 'theme']
    list_filter = ['status', 'theme']
    search_fields = ['title', 'client__username']
    prepopulated_fields = {'slug': ('title',)}
