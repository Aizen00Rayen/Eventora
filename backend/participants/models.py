from django.db import models
from django.conf import settings
import uuid
import qrcode
import os
from io import BytesIO
from django.core.files import File


class Registration(models.Model):
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='registrations')
    participant = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='registrations'
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    is_present = models.BooleanField(default=False)
    registered_at = models.DateTimeField(auto_now_add=True)
    ticket_sent = models.BooleanField(default=False)

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
