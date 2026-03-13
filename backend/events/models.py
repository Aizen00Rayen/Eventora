from django.db import models
from django.utils.text import slugify
from django.conf import settings
import uuid


class Event(models.Model):
    THEME_CHOICES = [
        ('modern', 'Modern'),
        ('academic', 'Academic'),
        ('corporate', 'Corporate'),
        ('minimal', 'Minimal'),
        ('vibrant', 'Vibrant'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateTimeField()
    location = models.CharField(max_length=300)
    max_capacity = models.PositiveIntegerField(default=100)
    logo = models.ImageField(upload_to='event_logos/', blank=True, null=True)
    theme = models.CharField(max_length=20, choices=THEME_CHOICES, default='modern')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    slug = models.SlugField(unique=True, blank=True)
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='events'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)
            slug = base
            n = 1
            while Event.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{n}"
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']
