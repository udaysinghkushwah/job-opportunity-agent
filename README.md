# AI Job Opportunity Agent 🤖💼

An end-to-end autonomous Agentic AI system built with Node.js, TypeScript, and **Angular** to handle recruiter job opportunity emails, parse structured role data, make policy decisions, auto-select tailored domain PDF resumes, generate context-aware personalized responses, dispatch emails via Gmail, book calendar events, and persist long-term memory in MongoDB.

---

## 🛠️ Complete Setup & Installation Guide

### 📋 1. Prerequisites
Before setting up the project, make sure you have the following installed:
- **Node.js** (v18.0.0 or higher): [Download Node.js](https://nodejs.org/)
- **npm** (v9.0.0 or higher)
- **Angular CLI** (`npm install -g @angular/cli@latest`)

---

### 📥 2. Clone & Install Dependencies
Clone the repository and install dependencies for both the main workspace and the Angular web application:

```bash
# Clone repository
cd job-opportunity-agent

# Install root dependencies
npm install

# Install Angular UI dependencies
cd apps/web && npm install && cd ../..
```

---

### 🔑 3. Environment Configuration (`.env`)

Copy the reference environment template `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```

Open `.env` in your text editor and configure the following parameters:

```env
# Application Settings
PORT=3010
NODE_ENV=development

# Candidate Profile Settings
CANDIDATE_NAME="Uday Singh Kushwah"
CANDIDATE_EMAIL="candidate@example.com"

# LLM Provider Configuration ('gemini', 'openai', or 'mock')
LLM_PROVIDER=gemini
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
GEMINI_MODEL=gemini-2.0-flash

# Database Configuration (MongoDB Atlas or Local MongoDB)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.l5elqrt.mongodb.net/job_opportunity_agent?retryWrites=true&w=majority"

# Real Gmail Integration (SMTP Send & IMAP Live Inbox Watcher)
GMAIL_USER="your_email@gmail.com"
GMAIL_APP_PASSWORD="your_16_character_app_password"
```

---

### 📧 4. Gmail Credentials Setup (App Password)
To enable real email sending via SMTP and live inbox background watching via IMAP:

1. Log into your Google Account: [https://myaccount.google.com/](https://myaccount.google.com/)
2. Navigate to **Security** -> Enable **2-Step Verification**.
3. Under *2-Step Verification*, scroll down to **App passwords**.
4. Create a new App Password (name it `Job Opportunity Agent`).
5. Copy the generated **16-character code** (e.g. `your_app_password`) and paste it as `GMAIL_APP_PASSWORD` in `.env`.
6. Set `GMAIL_USER` to your Gmail address.

---

### 🗄️ 5. Database Setup (MongoDB Atlas)
1. Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or run local MongoDB.
2. Create a database named `job_opportunity_agent`.
3. Obtain your connection string and replace `<username>` & `<password>` in `MONGODB_URI`.
4. *Note:* If MongoDB is unreachable, the system automatically uses a fault-tolerant in-memory repository fallback.

---

### 📑 6. Generate PDF Resumes
The system automatically selects domain-specific PDF resumes (`AI`, `Backend`, `Healthcare`, `Leadership`) to attach to recruiter auto-replies.

Run the automated PDF resume builder:
```bash
npx ts-node scripts/generate-pdf-resumes.ts
```
This generates the following files in `storage/resumes/`:
- `resume_ai.pdf`
- `resume_backend.pdf`
- `resume_healthcare.pdf`
- `resume_leadership.pdf`

---

## 🚀 How to Run (Separate UI & API Servers)

You can run the **Angular UI** and **Backend API Server** as separate dedicated microservices for optimal local development:

### 1. Launch Backend API Server (Port 3010)
Starts Express server, MongoDB connection, SSE telemetry stream, and live Gmail IMAP inbox watcher:
```bash
npm run dev:api
```
*(Server runs at `http://localhost:3010`)*

---

### 2. Launch Angular UI Dev Server (Port 4200)
Starts the dedicated Angular CLI development server with live reload and automatic API proxying:
```bash
npm run dev:ui
```
*(Angular UI runs at **[http://localhost:4200](http://localhost:4200)**)*

> **Automatic Proxying:** All Angular HTTP requests to `/api/*` on port `4200` are transparently proxied to the backend server at `http://localhost:3010` via [`apps/web/proxy.conf.json`](file:///Users/uday/Documents/AI/job-opportunity-agent/apps/web/proxy.conf.json).

---

### 3. Build Angular Production Distribution
To compile the Angular UI production bundle into `apps/web/dist`:
```bash
npm run build:web
```

---

### 4. Run Automated Test Suite
To execute multi-agent workflow tests (Interview Scheduled, Auto Replied, Spam Rejected):
```bash
npm test
```

---

## 🧪 Testing Live Email Automation

1. **Passive Background Inbox Watcher**:
   - Send an email to your `GMAIL_USER` from an external account.
   - **Subject**: `Senior AI Engineer Opportunity - TechAI`
   - **Body**: `Hi Uday, We reviewed your profile for Senior AI Engineer at TechAI. Please share your updated resume and let us know if tomorrow at 3 PM works for a call.`
   - Within 15 seconds, the background IMAP watcher will pick up the email, execute all 8 agents, attach `resume_ai.pdf`, send a personalized auto-reply via SMTP, and book a calendar event.

2. **Interactive Angular Web Dashboard**:
   - Open **`http://localhost:4200`** in your browser.
   - Use the **Recruiter Email Workbench** to simulate emails or trigger manual inbox fetches.
   - Observe live SSE execution logs, animated pipeline graph nodes, and MongoDB opportunity records in real time.

---

## 🏗️ High-Level Architecture

```
                    Gmail / Outlook / Webhook
                                │
                      New Recruiter Email
                                │
                                ▼
                    1. Email Listener Agent
                                │
               ┌────────────────┴────────────────┐
               │                                 │
           Spam / Other                      Opportunity
               │                                 │
             Ignore                              ▼
                                     2. Email Analysis Agent
                                                 │
                                     Extract Structured Data
                                     (Company, Recruiter, Role,
                                      CTC, Location, JD, Date)
                                                 │
                                                 ▼
                                      Memory / Database (MongoDB)
                                                 │
                                                 ▼
                                      3. Decision Making Agent
                                                 │
                  ┌──────────────────────────────┼──────────────────────────────┐
                  │                              │                              │
             Auto Reply                      Ask User                      Reject/Ignore
                  │
                  ▼
       4. Resume Selection Agent
                  │
        (Select PDF Resume)
                  │
                  ▼
      5. Reply Generation Agent
                  │
         (Context-Aware Dynamic LLM Reply)
                  │
                  ▼
        6. Email Sending Agent
                  │
         (Gmail API + PDF Attachment)
                  │
                  ▼
          7. Calendar Agent ─────────► 8. Notification Agent
      (Google Calendar Booking)        (Slack / Telegram / Dashboard)
```

---

## 🤖 Micro-Agent Roles

1. **Email Listener Agent**: Ingests new emails from live IMAP watcher/webhooks and initializes execution context.
2. **Email Analysis Agent**: Uses LLM to extract structured fields (`company`, `recruiterName`, `role`, `ctc`, `location`, `jd`, `resumeRequested`, `interviewDate`).
3. **Decision Agent**: Evaluates business policy rules (Recruiter + Resume requested -> `AUTO_REPLY`, Vague -> `ASK_USER`, Spam -> `REJECT_IGNORE`).
4. **Resume Selector Agent**: Smartly matches role/JD against candidate domain PDF resumes (`Backend`, `AI`, `Healthcare`, `Leadership`).
5. **Reply Generator Agent**: Generates context-aware personalized responses under 100 words based on incoming email content.
6. **Email Sender Agent**: Uses Gmail SMTP to auto-send reply with attached domain PDF resume file.
7. **Calendar Agent**: Automatically books Google Calendar interview slot if interview schedule is detected.
8. **Notifier Agent**: Sends live execution status updates to Slack, Telegram, and UI stream.

---

## 🐳 Docker Deployment

```bash
docker-compose up --build -d
```
Runs MongoDB, Redis, and API application in containerized isolation.
