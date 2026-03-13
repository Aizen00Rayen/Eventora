from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT


def generate_attestation_pdf(registration):
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        topMargin=3*cm, bottomMargin=3*cm,
        leftMargin=3*cm, rightMargin=3*cm,
    )
    styles = getSampleStyleSheet()

    brand_style = ParagraphStyle(
        'Brand', parent=styles['Normal'],
        fontSize=14, textColor=colors.HexColor('#6C47FF'),
        fontName='Helvetica-Bold', alignment=TA_RIGHT,
    )
    title_style = ParagraphStyle(
        'Title', parent=styles['Title'],
        fontSize=26, textColor=colors.HexColor('#0F0E17'),
        fontName='Helvetica-Bold', spaceAfter=10, alignment=TA_CENTER,
    )
    sub_style = ParagraphStyle(
        'Sub', parent=styles['Normal'],
        fontSize=13, textColor=colors.HexColor('#555555'), alignment=TA_CENTER, spaceAfter=6,
    )
    name_style = ParagraphStyle(
        'ParticipantName', parent=styles['Heading1'],
        fontSize=22, textColor=colors.HexColor('#6C47FF'),
        fontName='Helvetica-Bold', alignment=TA_CENTER, spaceAfter=8,
    )
    footer_style = ParagraphStyle(
        'Footer', parent=styles['Normal'],
        fontSize=10, textColor=colors.HexColor('#888888'), alignment=TA_CENTER,
    )

    event = registration.event
    participant = registration.participant

    story = []
    story.append(Paragraph("EVENTORA", brand_style))
    story.append(Spacer(1, 1.5*cm))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#6C47FF')))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("Attestation de Participation", title_style))
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph("This is to certify that", sub_style))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph(f"{participant.first_name} {participant.last_name}", name_style))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("has successfully participated in", sub_style))
    story.append(Spacer(1, 0.3*cm))

    event_style = ParagraphStyle(
        'EventName', parent=styles['Heading2'],
        fontSize=18, textColor=colors.HexColor('#00D4AA'),
        fontName='Helvetica-Bold', alignment=TA_CENTER, spaceAfter=8,
    )
    story.append(Paragraph(event.title, event_style))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph(
        f"held on {event.date.strftime('%B %d, %Y')} at {event.location}",
        sub_style,
    ))
    story.append(Spacer(1, 2*cm))
    story.append(HRFlowable(width="50%", thickness=1, color=colors.HexColor('#CCCCCC'), hAlign='CENTER'))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("Authorized Signature", footer_style))
    story.append(Spacer(1, 1*cm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#6C47FF')))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("Eventora – Organize. Connect. Inspire.", footer_style))

    doc.build(story)
    buf.seek(0)
    return buf
