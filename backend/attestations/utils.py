from io import BytesIO
from datetime import date
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.pdfgen import canvas as pdf_canvas
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.platypus import Paragraph
from reportlab.lib.utils import ImageReader


def generate_attestation_pdf(registration):
    buf = BytesIO()
    page_w, page_h = A4
    c = pdf_canvas.Canvas(buf, pagesize=A4)

    PRIMARY = colors.HexColor('#6C47FF')
    DARK = colors.HexColor('#111827')
    GRAY = colors.HexColor('#6B7280')
    LIGHT_GRAY = colors.HexColor('#9CA3AF')
    WHITE = colors.white
    BG = colors.HexColor('#F8F7FF')

    event = registration.event
    participant = registration.participant
    full_name = f"{participant.first_name} {participant.last_name}".strip()
    today = date.today()
    reg_id = f"EVT-{today.year}-{str(registration.id).zfill(5)}-AT"

    # ── Background ────────────────────────────────────────────────────────────
    c.setFillColor(BG)
    c.rect(0, 0, page_w, page_h, fill=1, stroke=0)

    # ── Outer purple border (2mm from edge) ───────────────────────────────────
    margin = 10 * mm
    c.setStrokeColor(PRIMARY)
    c.setLineWidth(2)
    c.rect(margin, margin, page_w - 2 * margin, page_h - 2 * margin, fill=0, stroke=1)

    # ── "DOCUMENT OFFICIEL" label (top-right outside border) ─────────────────
    label_x = page_w - margin - 60 * mm
    label_y = page_h - margin + 3 * mm
    c.setFillColor(PRIMARY)
    c.setFont('Helvetica-Bold', 7)
    c.drawString(label_x + 8 * mm, label_y + 2 * mm, 'DOCUMENT OFFICIEL')
    # rounded rect behind label
    c.setStrokeColor(PRIMARY)
    c.setLineWidth(0.5)
    c.roundRect(label_x, label_y, 55 * mm, 7 * mm, 3, fill=0, stroke=1)

    # ── Watermark medallion (large, center background) ────────────────────────
    c.saveState()
    c.setFillColor(colors.HexColor('#E8E3FF'))
    center_x, center_y = page_w / 2, page_h / 2 + 10 * mm
    # outer circle
    c.circle(center_x, center_y, 55 * mm, fill=1, stroke=0)
    # inner circle (slightly lighter)
    c.setFillColor(colors.HexColor('#EDE9FF'))
    c.circle(center_x, center_y, 42 * mm, fill=1, stroke=0)
    # star shape (8-pointed approximation using lines)
    c.setStrokeColor(colors.HexColor('#D4CEFF'))
    c.setFillColor(colors.HexColor('#D4CEFF'))
    c.setLineWidth(0)
    import math
    for i in range(8):
        angle = math.radians(i * 45)
        angle2 = math.radians(i * 45 + 22.5)
        x1 = center_x + 32 * mm * math.cos(angle)
        y1 = center_y + 32 * mm * math.sin(angle)
        x2 = center_x + 22 * mm * math.cos(angle2)
        y2 = center_y + 22 * mm * math.sin(angle2)
        x3 = center_x + 32 * mm * math.cos(math.radians((i + 1) * 45))
        y3 = center_y + 32 * mm * math.sin(math.radians((i + 1) * 45))
        p = c.beginPath()
        p.moveTo(center_x, center_y)
        p.lineTo(x1, y1)
        p.lineTo(x2, y2)
        p.lineTo(x3, y3)
        p.close()
        c.drawPath(p, fill=1, stroke=0)
    c.restoreState()

    # ── Eventora logo top-right (inside border) ───────────────────────────────
    logo_x = page_w - margin - 40 * mm
    logo_y = page_h - margin - 18 * mm
    # Circle icon
    c.setFillColor(PRIMARY)
    c.circle(logo_x + 4 * mm, logo_y + 4 * mm, 4 * mm, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont('Helvetica-Bold', 6)
    c.drawCentredString(logo_x + 4 * mm, logo_y + 2 * mm, 'E')
    c.setFillColor(DARK)
    c.setFont('Helvetica-Bold', 14)
    c.drawString(logo_x + 10 * mm, logo_y + 1 * mm, 'Eventora')

    # ── Shield with checkmark (center, top area) ──────────────────────────────
    shield_cx = page_w / 2
    shield_top = page_h - margin - 28 * mm
    shield_h = 18 * mm
    shield_w = 14 * mm
    # Draw shield shape
    c.setFillColor(PRIMARY)
    p = c.beginPath()
    p.moveTo(shield_cx - shield_w / 2, shield_top)
    p.lineTo(shield_cx + shield_w / 2, shield_top)
    p.lineTo(shield_cx + shield_w / 2, shield_top - shield_h * 0.6)
    p.curveTo(
        shield_cx + shield_w / 2, shield_top - shield_h * 0.6,
        shield_cx + shield_w / 2, shield_top - shield_h,
        shield_cx, shield_top - shield_h,
    )
    p.curveTo(
        shield_cx, shield_top - shield_h,
        shield_cx - shield_w / 2, shield_top - shield_h,
        shield_cx - shield_w / 2, shield_top - shield_h * 0.6,
    )
    p.close()
    c.drawPath(p, fill=1, stroke=0)
    # checkmark
    c.setStrokeColor(WHITE)
    c.setLineWidth(1.8)
    c.line(shield_cx - 3 * mm, shield_top - shield_h * 0.55, shield_cx - 1 * mm, shield_top - shield_h * 0.72)
    c.line(shield_cx - 1 * mm, shield_top - shield_h * 0.72, shield_cx + 3.5 * mm, shield_top - shield_h * 0.3)

    # ── ATTESTATION DE PARTICIPATION heading ──────────────────────────────────
    c.setFillColor(DARK)
    c.setFont('Helvetica-Bold', 18)
    c.drawCentredString(page_w / 2, page_h - margin - 50 * mm, 'ATTESTATION DE PARTICIPATION')

    # ── "Nous attestons que" ──────────────────────────────────────────────────
    c.setFillColor(GRAY)
    c.setFont('Helvetica', 11)
    c.drawCentredString(page_w / 2, page_h - margin - 60 * mm, 'Nous attestons que')

    # ── Participant name (large, purple) ─────────────────────────────────────
    c.setFillColor(PRIMARY)
    c.setFont('Helvetica-Bold', 26)
    c.drawCentredString(page_w / 2, page_h - margin - 72 * mm, full_name)
    # underline
    name_width = c.stringWidth(full_name, 'Helvetica-Bold', 26)
    c.setStrokeColor(PRIMARY)
    c.setLineWidth(1)
    c.line(
        page_w / 2 - name_width / 2 - 5,
        page_h - margin - 74 * mm,
        page_w / 2 + name_width / 2 + 5,
        page_h - margin - 74 * mm,
    )

    # ── "a participé à l'événement" ───────────────────────────────────────────
    c.setFillColor(GRAY)
    c.setFont('Helvetica', 11)
    c.drawCentredString(page_w / 2, page_h - margin - 83 * mm, "a participé à l'événement")

    # ── Event title ───────────────────────────────────────────────────────────
    c.setFillColor(DARK)
    c.setFont('Helvetica-Bold', 16)
    c.drawCentredString(page_w / 2, page_h - margin - 93 * mm, event.title)

    # ── Date + Location ───────────────────────────────────────────────────────
    date_str = event.date.strftime('%d %B %Y')
    info_y = page_h - margin - 103 * mm
    c.setFillColor(GRAY)
    c.setFont('Helvetica', 10)
    info_text = f"  {date_str}     {event.location}"
    c.drawCentredString(page_w / 2, info_y, info_text)

    # ── Description paragraph ─────────────────────────────────────────────────
    desc_y = page_h - margin - 118 * mm
    desc_style = ParagraphStyle(
        'desc', fontName='Helvetica', fontSize=9,
        textColor=GRAY, alignment=TA_CENTER, leading=14,
    )
    desc_text = (
        "Cette attestation est délivrée pour valoir ce que de droit et "
        "témoigne de l'engagement du participant dans les sessions de "
        "formation et de networking durant toute la durée de l'événement."
    )
    para = Paragraph(desc_text, desc_style)
    para.wrapOn(c, 120 * mm, 40 * mm)
    para.drawOn(c, (page_w - 120 * mm) / 2, desc_y - 20 * mm)

    # ── Signature line ────────────────────────────────────────────────────────
    sig_y = page_h - margin - 155 * mm
    sig_x1 = page_w / 2 + 5 * mm
    sig_x2 = page_w - margin - 20 * mm
    c.setStrokeColor(colors.HexColor('#D1D5DB'))
    c.setLineWidth(0.8)
    c.line(sig_x1, sig_y, sig_x2, sig_y)
    c.setFillColor(DARK)
    c.setFont('Helvetica-Bold', 9)
    c.drawCentredString((sig_x1 + sig_x2) / 2, sig_y - 5 * mm, 'SIGNATURE & CACHET')
    c.setFillColor(LIGHT_GRAY)
    c.setFont('Helvetica-Oblique', 8)
    c.drawCentredString((sig_x1 + sig_x2) / 2, sig_y - 11 * mm, 'Scellé numériquement par Eventora')

    # ── Bottom purple line ────────────────────────────────────────────────────
    bottom_line_y = margin + 18 * mm
    c.setStrokeColor(PRIMARY)
    c.setLineWidth(2)
    c.line(margin + 5 * mm, bottom_line_y, page_w - margin - 5 * mm, bottom_line_y)

    # ── Footer: date generated + ID + eventora.com ────────────────────────────
    footer_y = margin + 8 * mm
    c.setFillColor(LIGHT_GRAY)
    c.setFont('Helvetica', 7)
    c.drawString(margin + 5 * mm, footer_y, f"Généré le {today.strftime('%d %B %Y')}")
    c.drawString(margin + 5 * mm, footer_y - 4 * mm, f"ID: {reg_id}")
    c.setFillColor(PRIMARY)
    c.setFont('Helvetica-Bold', 8)
    c.drawRightString(page_w - margin - 5 * mm, footer_y - 1 * mm, 'eventora.com')

    c.save()
    buf.seek(0)
    return buf
