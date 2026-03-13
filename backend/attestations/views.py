from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from participants.models import Registration
from .utils import generate_attestation_pdf


class AttestationDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, registration_id):
        reg = get_object_or_404(Registration, pk=registration_id)
        # Only participant, client, or admin can download
        user = request.user
        if user.role not in ('admin', 'client') and reg.participant != user:
            return Response({'detail': 'Forbidden.'}, status=403)
        if not reg.is_present:
            return Response({'detail': 'Attestation only available for participants who attended.'}, status=400)

        pdf_buf = generate_attestation_pdf(reg)
        response = HttpResponse(pdf_buf.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="attestation_{registration_id}.pdf"'
        return response
