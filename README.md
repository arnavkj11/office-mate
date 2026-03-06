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
uvicorn main:app --reload --host 0.0.0.0 --port 8000
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
