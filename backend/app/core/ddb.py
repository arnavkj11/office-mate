import os
from dotenv import load_dotenv
import boto3
from botocore.exceptions import BotoCoreError, NoCredentialsError
from .config import AWS_REGION, DDB_TABLE_USERS, DDB_TABLE_BUSINESSES, DDB_TABLE_APPOINTMENTS

load_dotenv()

PROFILE = os.getenv("AWS_PROFILE")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_SESSION_TOKEN = os.getenv("AWS_SESSION_TOKEN")

def _make_session():
    if PROFILE:
        return boto3.Session(profile_name=PROFILE, region_name=AWS_REGION)
    if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
        return boto3.Session(
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            aws_session_token=AWS_SESSION_TOKEN,
            region_name=AWS_REGION,
        )
    return boto3.Session(region_name=AWS_REGION)

try:
    _session = _make_session()
    _ddb = _session.resource("dynamodb")
except (BotoCoreError, NoCredentialsError) as e:
    raise RuntimeError(f"{e}")

def users_table():
    return _ddb.Table(DDB_TABLE_USERS)

def businesses_table():
    return _ddb.Table(DDB_TABLE_BUSINESSES)

def appointments_table():
    return _ddb.Table(DDB_TABLE_APPOINTMENTS)
