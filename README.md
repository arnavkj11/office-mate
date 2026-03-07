# OfficeMate

A full-stack scheduling and appointment management web app with an AI assistant. Built for small businesses to manage appointments, working hours, and client bookings.

---

## Summary

OfficeMate helps business owners manage their schedule. Users sign up with AWS Cognito, complete onboarding with business details, and then use a React SPA to create appointments, set weekly working hours (plus date overrides), and chat with an AI assistant that answers questions about today's appointments. The backend is a FastAPI service that stores data in DynamoDB and validates JWT access tokens from Cognito.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                     │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  React + Vite SPA                                                         │   │
│  │  • AWS Amplify (auth)  • React Router  • date-fns  • react-calendar       │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────┬─────────────────────────────────────┘
                                            │
                          HTTPS + Bearer JWT (Cognito access token)
                                            │
┌───────────────────────────────────────────▼─────────────────────────────────────┐
│                              BACKEND (FastAPI)                                    │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  API Routes                                                               │   │
│  │  • /users          (me, bootstrap)                                        │   │
│  │  • /appointments   (CRUD, summary)                                        │   │
│  │  • /assistant/ui-chat  (AI chat)                                          │   │
│  │  • /businesses     (business management)                                  │   │
│  │  • /working-hours  (weekly schedule + overrides)                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  Auth: Cognito JWT verification (JWKS)  • Services • Models               │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────┬─────────────────────────────────────┘
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        │                                   │                                   │
        ▼                                   ▼                                   ▼
┌───────────────────┐             ┌───────────────────┐             ┌───────────────────┐
│   Amazon Cognito  │             │   DynamoDB        │             │   OpenAI API      │
│   • User pool     │             │   • users         │             │   • GPT-4o-mini   │
│   • JWT tokens    │             │   • businesses    │             │   • Assistant     │
└───────────────────┘             │   • appointments  │             └───────────────────┘
                                  └───────────────────┘
                                            │
                                  ┌─────────▼──────────┐
                                  │   AWS SES          │
                                  │   (email)          │
                                  └───────────────────┘
```

---

## Tech Stack

| Layer      | Technology                     |
|-----------|---------------------------------|
| Frontend  | React 18, Vite, React Router    |
| Auth      | AWS Amplify + Amazon Cognito    |
| Backend   | FastAPI, Python 3.x             |
| Database  | Amazon DynamoDB (users, businesses, appointments) |
| AI        | OpenAI GPT-4o-mini (assistant)  |
| Email     | Amazon SES (Mailjet available)  |

---

## Project Structure

```
office-mate/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── api/client.js     # API client (fetch + JWT)
│   │   ├── lib/amplify.js    # Cognito config
│   │   ├── components/       # NavBar, Sidebar, Footer, landing, etc.
│   │   ├── layouts/          # AppLayout
│   │   ├── pages/            # Landing, Auth, Onboarding, app/* (Dashboard, Appointments, etc.)
│   │   └── App.jsx
│   └── package.json
│
├── backend/                  # FastAPI API
│   ├── app/
│   │   ├── main.py           # App entry, CORS, routes
│   │   ├── agent.py          # OpenAI assistant logic
│   │   ├── api/              # routes_*.py
│   │   ├── core/             # auth_cognito, config, ddb, email_ses
│   │   ├── models/           # Pydantic models
│   │   └── services/         # Business logic (user, appointment, etc.)
│   └── requirements.txt
│
└── README.md
```

---

## Core Features

- **Auth**: Email-based sign-in via Cognito; JWT-protected API
- **Onboarding**: New users set name, business name, email, phone, location
- **Appointments**: Create, list, view; calendar UI; status updates; timezone-aware summary
- **Working hours**: Weekly schedule per day (start/end); date-specific overrides
- **AI assistant**: Chat about today's appointments; uses backend context
- **Settings / Notes**: App settings and notes pages

---

## Data Flow

1. **User flow**: Sign in → Onboarding (bootstrap) → App dashboard
2. **Appointments**: Frontend → `POST /appointments` → DynamoDB; list via `GET /appointments`
3. **Assistant**: Frontend sends message + history → `POST /assistant/ui-chat` → Agent fetches today’s appointments → OpenAI → response
4. **Auth**: Amplify handles Cognito; API client attaches `Authorization: Bearer <token>`; backend validates via JWKS

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- AWS account (Cognito, DynamoDB, SES)
- OpenAI API key

### Environment

**Backend** (`backend/.env`):

- `COG_REGION`, `COG_USER_POOL_ID`, `COG_CLIENT_ID` — Cognito
- `AWS_REGION` — AWS region
- `AWS_PROFILE` or `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` — AWS credentials
- `DDB_TABLE_USERS`, `DDB_TABLE_BUSINESSES`, `DDB_TABLE_APPTS` — DynamoDB table names
- `OPENAI_API_KEY` — OpenAI
- `SES_FROM_EMAIL` — SES sender (optional)

**Frontend** (`frontend/.env`):

- `VITE_API_BASE` — Backend URL (default `http://localhost:8000`)
- `VITE_AWS_REGION`, `VITE_COG_USER_POOL_ID`, `VITE_COG_CLIENT_ID` — Cognito

### Run

**Backend:**

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:8000`
- Health: `GET /health`

---

## Deploy frontend on Vercel

### 1. Push your code

Ensure your project is in a Git repo (GitHub, GitLab, or Bitbucket) and push the latest code.

### 2. Create a Vercel project

1. Go to **[vercel.com/new](https://vercel.com/new)**.
2. **Import** your repository (e.g. connect GitHub and select the `office-mate` repo).
3. Before deploying, set the **Root Directory**:
   - Click **Edit** next to “Root Directory”.
   - Enter `frontend` and click **Continue**.

### 3. Build settings

Vercel should detect Vite. Confirm:

- **Framework Preset:** Vite  
- **Build Command:** `npm run build`  
- **Output Directory:** `dist`  
- **Install Command:** `npm install`

(Defaults are usually correct.)

### 4. Environment variables

In the same “Configure Project” screen (or later under **Settings → Environment Variables**), add:

| Name | Value | Notes |
|------|--------|--------|
| `VITE_API_BASE` | Your backend URL | e.g. `https://your-api.example.com` (or keep empty for now and use `http://localhost:8000` until the backend is deployed) |
| `VITE_AWS_REGION` | AWS region | e.g. `us-east-1` |
| `VITE_COG_USER_POOL_ID` | Cognito User Pool ID | From AWS Cognito |
| `VITE_COG_CLIENT_ID` | Cognito App client ID | From AWS Cognito |

These are baked into the build, so change them in Vercel and **redeploy** if you update the backend URL or Cognito.

### 5. Deploy

Click **Deploy**. Vercel will install dependencies, run `npm run build`, and serve the app. You’ll get a URL like `https://officemate-xxx.vercel.app`.

### 6. Cognito callback URLs

In **AWS Cognito → User Pool → App integration → App client**:

- Add your Vercel URL to **Allowed callback URLs** (e.g. `https://officemate-xxx.vercel.app/`).
- Add the same URL to **Allowed sign-out URLs**.
- Save changes.

### 7. (Optional) CLI deploy

```bash
cd frontend
npx vercel
```

When prompted, set the project root to `frontend` if needed, and add the env vars when asked or in the Vercel dashboard.

---

## Deploy backend on Railway

The repo includes [`railway.toml`](railway.toml) to force a Python build/install from `backend/requirements.txt` and start FastAPI from `backend`.

### 1. Create Railway service

1. In Railway, create a new project from this GitHub repo.
2. For the backend service, keep the service at repo root (the included `railway.toml` handles backend paths).
3. Trigger a deploy.

### 2. Set backend environment variables

Set these in Railway service variables:

| Name | Value |
|------|--------|
| `COG_REGION` | e.g. `us-east-1` |
| `COG_USER_POOL_ID` | Cognito User Pool ID |
| `COG_CLIENT_ID` | Cognito App client ID |
| `AWS_REGION` | Same as `COG_REGION` |
| `DDB_TABLE_USERS` | `officemate_users` (or your table name) |
| `DDB_TABLE_BUSINESSES` | `officemate_businesses` |
| `DDB_TABLE_APPTS` | `officemate_appointments` |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `FRONTEND_ORIGIN` | Your Vercel frontend URL |

### 3. Wire frontend to Railway URL

1. Copy Railway backend URL.
2. In Vercel project settings, set `VITE_API_BASE` to that URL.
3. Redeploy frontend.

---

## Deploy backend on AWS App Runner

The backend uses **AWS App Runner**, which builds and runs your FastAPI app from the repo. Your frontend is at **https://office-mate-three.vercel.app/**.

### 1. Push `apprunner.yaml`

Ensure `backend/apprunner.yaml` is in the repo. It configures Python, build, and run commands for App Runner.

### 2. Create an App Runner service

1. Open **[AWS App Runner console](https://console.aws.amazon.com/apprunner)** and select your region (e.g. `us-east-1`).
2. Click **Create an App Runner service**.
3. **Source and deployment:**
   - **Repository type:** Source code repository
   - **Provider:** GitHub (or Bitbucket if you use it)
   - If first time: **Add new** and authorize GitHub
   - **Repository:** Select the `office-mate` repo
   - **Branch:** `main` (or your default)
   - **Source directory:** `backend`
   - **Deployment:** Automatic (or Manual if you prefer)
4. Click **Next**.

### 3. Configure build

1. **Configuration file:** Use a configuration file
2. **Configuration file path:** `apprunner.yaml` (relative to source directory)
3. Click **Next**.

### 4. Configure service

1. **Service name:** e.g. `officemate-api`
2. **Port:** 8000 (should match `apprunner.yaml`)
3. Click **Next**.

### 5. Environment variables

Under **Environment variables** (or in the **Security** step), add:

| Name | Value |
|------|--------|
| `COG_REGION` | e.g. `us-east-1` |
| `COG_USER_POOL_ID` | Cognito User Pool ID |
| `COG_CLIENT_ID` | Cognito App client ID |
| `AWS_REGION` | Same as `COG_REGION` |
| `DDB_TABLE_USERS` | `officemate_users` (or your table name) |
| `DDB_TABLE_BUSINESSES` | `officemate_businesses` |
| `DDB_TABLE_APPTS` | `officemate_appointments` |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `FRONTEND_ORIGIN` | `https://office-mate-three.vercel.app` |

### 6. IAM role for AWS access

App Runner needs an IAM role to call DynamoDB, Cognito (JWKS), and optionally SES. Either:

- Use an **existing role** with `dynamodb:*`, `ses:SendEmail`, and permissions to read Cognito JWKS.
- Or **create a role** for the service with:
  - `AmazonDynamoDBFullAccess` (or scoped policies)
  - `AmazonSESFullAccess` (if using SES)
  - Cognito read (e.g. `cognito-idp:DescribeUserPool`) and ability to fetch public JWKS

### 7. Create and deploy

Click **Create and deploy**. Wait until **Status** is **Running**.

### 8. Get the service URL

Copy the **Default domain** (e.g. `https://xxxxx.us-east-1.awsapprunner.com`).

### 9. Wire frontend to backend

1. In **Vercel → Project → Settings → Environment Variables**, set `VITE_API_BASE` to the App Runner URL.
2. Redeploy the frontend so the new value is used.

### 10. Update Cognito CORS (if needed)

The backend already uses `FRONTEND_ORIGIN` for CORS. No extra Cognito CORS changes needed if you set `FRONTEND_ORIGIN` correctly.
