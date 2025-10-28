import os

PORT = int(os.getenv("PORT", "8000"))
FRONTEND_ORIGINS = [o.strip() for o in (os.getenv("FRONTEND_ORIGINS") or "http://localhost:5173").split(",")]

COG_REGION = os.getenv("COG_REGION")
COG_USER_POOL_ID = os.getenv("COG_USER_POOL_ID")
COG_CLIENT_ID = os.getenv("COG_CLIENT_ID")

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
DDB_TABLE_USERS = os.getenv("DDB_TABLE_USERS", "officemate_users")
DDB_TABLE_BUSINESSES = os.getenv("DDB_TABLE_BUSINESSES", "officemate_businesses")
DDB_TABLE_APPTS = os.getenv("DDB_TABLE_APPTS", "officemate_appointments")
