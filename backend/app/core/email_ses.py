import os
import boto3
from botocore.exceptions import BotoCoreError, ClientError
from typing import Optional


def get_ses_client():
    region = os.getenv("AWS_REGION", "us-east-1")
    return boto3.client("ses", region_name=region)


def send_raw_email(to_email: str, subject: str, body_text: str, body_html: Optional[str] = None):
    client = get_ses_client()
    source = os.environ["SES_FROM_EMAIL"]

    body = {
        "Text": {"Data": body_text, "Charset": "UTF-8"}
    }
    if body_html:
        body["Html"] = {"Data": body_html, "Charset": "UTF-8"}

    try:
        client.send_email(
            Source=source,
            Destination={"ToAddresses": [to_email]},
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": body,
            },
        )
    except (BotoCoreError, ClientError) as e:
        print("SES send_email failed:", repr(e))
