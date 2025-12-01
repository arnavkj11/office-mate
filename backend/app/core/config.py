import os
from dotenv import load_dotenv

load_dotenv()

COG_REGION = os.getenv("COG_REGION")
COG_USER_POOL_ID = os.getenv("COG_USER_POOL_ID")
COG_CLIENT_ID = os.getenv("COG_CLIENT_ID")

AWS_REGION = os.getenv("AWS_REGION")

DDB_TABLE_USERS = os.getenv("DDB_TABLE_USERS", "officemate_users")
DDB_TABLE_BUSINESSES = os.getenv("DDB_TABLE_BUSINESSES", "officemate_businesses")
DDB_TABLE_APPOINTMENTS = os.getenv("DDB_TABLE_APPTS", "officemate_appointments")

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

PORT = int(os.getenv("PORT", "8000"))
BACKEND_PORT = int(os.getenv("PORT", "8000"))
