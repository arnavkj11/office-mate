from datetime import datetime, time
from app.services.agent_service import get_today_appointments
from app.services.agent_service import list_appointments_for_user
from app.services.agent_service import update_appointment
from app.services.agent_service import search_appointments_by_client_name

# Tool 1
def tool_get_appointments_between_times(user_id, business_id, start_time, end_time):
    all_today = get_today_appointments(user_id, business_id)["appointments"]
    start = datetime.strptime(start_time, "%H:%M").time()
    end = datetime.strptime(end_time, "%H:%M").time()

    filtered = []
    for appt in all_today:
        appt_time = datetime.fromisoformat(appt["startTime"]).time()
        if start <= appt_time <= end:
            filtered.append(appt)

    return filtered


# Tool 2
def tool_get_appointment_by_time(user_id, business_id, target_time):
    all_today = get_today_appointments(user_id, business_id)["appointments"]
    t = datetime.strptime(target_time, "%H:%M").time()
    for appt in all_today:
        appt_time = datetime.fromisoformat(appt["startTime"]).time()
        if appt_time == t:
            return appt
    return None


# Tool 3
def tool_reschedule_appointment(appointment_id, new_datetime):
    return update_appointment(appointment_id, new_datetime)


# Tool 4
def tool_search_appointments_by_name(user_id, business_id, name):
    return search_appointments_by_client_name(user_id, business_id, name)


# Tool 5
def tool_send_email_confirmation(to_email, subject, body):
    # You can plug in SES, MailJet, SendGrid, etc.
    return {"status": "sent", "to": to_email}
