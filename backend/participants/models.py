from django.db import models
from django.conf import settings
import uuid
import qrcode
import os
from io import BytesIO
from django.core.files import File


class Registration(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='registrations')
    participant = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='registrations'
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    is_present = models.BooleanField(default=False)
    registered_at = models.DateTimeField(auto_now_add=True)
    ticket_sent = models.BooleanField(default=False)
    payment_receipt = models.FileField(upload_to='receipts/', blank=True, null=True)
    payment_status = models.CharField(
        max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending'
    )

    class Meta:
        unique_together = ('event', 'participant')

    def save(self, *args, **kwargs):
        if not self.qr_code:
            self._generate_qr()
        super().save(*args, **kwargs)

    def _generate_qr(self):
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(str(self.token))
        qr.make(fit=True)
        img = qr.make_image(fill_color='black', back_color='white')
        buf = BytesIO()
        img.save(buf, format='PNG')
        filename = f"qr_{self.token}.png"
        self.qr_code.save(filename, File(buf), save=False)

    def __str__(self):
        return f"{self.participant.username} @ {self.event.title}"


class ExhibitorStand(models.Model):
    STAND_TYPE_CHOICES = [
        ('minimum', 'Minimum'),
        ('standard', 'Standard'),
        ('premium', 'Premium'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    STAND_PRICES = {
        'minimum': 50000,
        'standard': 100000,
        'premium': 150000,
    }

    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='exhibitor_stands')
    exhibitor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='exhibitor_stands'
    )
    stand_type = models.CharField(max_length=20, choices=STAND_TYPE_CHOICES)
    company_name = models.CharField(max_length=200)
    payment_receipt = models.FileField(upload_to='exhibitor_receipts/')
    payment_status = models.CharField(
        max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending'
    )
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('event', 'exhibitor')

    @property
    def price(self):
        return self.STAND_PRICES.get(self.stand_type, 0)

    def __str__(self):
        return f"{self.exhibitor.username} – {self.stand_type} stand @ {self.event.title}"
