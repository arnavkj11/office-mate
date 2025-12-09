import os
from datetime import datetime
from typing import Dict, Optional

from app.core.email_ses import send_raw_email
from app.services.user_service import get_user_by_id


def _parse_iso(dt: str) -> datetime:
    return datetime.fromisoformat(dt.replace("Z", "+00:00"))


def send_appointment_email(appointment: Dict):
    invitee_email: Optional[str] = appointment.get("inviteeEmail")
    if not invitee_email:
        return

    user_id: str = appointment["userId"]
    user = get_user_by_id(user_id) or {}
    provider_name = user.get("name") or "your provider"

    title = appointment.get("title") or "Appointment"

    start_raw = appointment["startTime"]
    end_raw = appointment["endTime"]

    start_dt = _parse_iso(start_raw)
    end_dt = _parse_iso(end_raw)

    date_str = start_dt.strftime("%A, %B %d, %Y")
    start_str = start_dt.strftime("%I:%M %p").lstrip("0")
    end_str = end_dt.strftime("%I:%M %p").lstrip("0")

    base = os.getenv("APPOINTMENT_RSVP_BASE_URL", "").rstrip("/")
    rsvp_token = appointment.get("rsvpToken")

    accepted_url = ""
    declined_url = ""
    maybe_url = ""

    if base and rsvp_token:
        link_base = base + "/appointments/rsvp"
        common = (
            "businessId={}&appointmentId={}&token={}".format(
                appointment["businessId"],
                appointment["appointmentId"],
                rsvp_token,
            )
        )
        accepted_url = "{}?{}&choice=accepted".format(link_base, common)
        declined_url = "{}?{}&choice=declined".format(link_base, common)
        maybe_url = "{}?{}&choice=maybe".format(link_base, common)

    subject = "Appointment confirmation: {}".format(title)

    body_text_lines = [
        "Hi,",
        "",
        'You have an appointment titled "{}" with {} on {} from {} to {}.'.format(
            title, provider_name, date_str, start_str, end_str
        ),
    ]

    if accepted_url:
        body_text_lines.append("")
        body_text_lines.append("Please confirm your attendance:")
        body_text_lines.append("Accept: {}".format(accepted_url))
        body_text_lines.append("Decline: {}".format(declined_url))
        body_text_lines.append("Maybe: {}".format(maybe_url))

    body_text_lines.append("")
    body_text_lines.append("If you have any questions, please reply to this email.")
    body_text_lines.append("")
    body_text_lines.append("Best,")
    body_text_lines.append("OfficeMate")

    body_text = "\n".join(body_text_lines)

    if accepted_url:
        rsvp_html = (
            '<p>Please confirm your attendance:</p>'
            '<p>'
            '<a href="{a}" style="padding:8px 14px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:6px;margin-right:8px;">Accept</a>'
            '<a href="{d}" style="padding:8px 14px;background:#dc2626;color:#ffffff;text-decoration:none;border-radius:6px;margin-right:8px;">Decline</a>'
            '<a href="{m}" style="padding:8px 14px;background:#eab308;color:#111827;text-decoration:none;border-radius:6px;">Maybe</a>'
            "</p>"
        ).format(a=accepted_url, d=declined_url, m=maybe_url)
    else:
        rsvp_html = ""

    body_html = (
        "<p>Hi,</p>"
        "<p>You have an appointment titled <strong>{title}</strong> with <strong>{provider}</strong>.</p>"
        "<p><strong>Date</strong>: {date}<br>"
        "<strong>Time</strong>: {start} – {end}</p>"
        "{rsvp}"
        "<p>If you have any questions, please reply to this email.</p>"
        "<p>Best,<br>OfficeMate</p>"
    ).format(
        title=title,
        provider=provider_name,
        date=date_str,
        start=start_str,
        end=end_str,
        rsvp=rsvp_html,
    )

    send_raw_email(invitee_email, subject, body_text, body_html)
