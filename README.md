# AI Job Opportunity Agent 🤖💼

An end-to-end autonomous Agentic AI system built with **Node.js**, **TypeScript**, and **Angular 17+** to handle recruiter job opportunity emails, parse structured role data, make policy decisions, auto-select tailored domain PDF resumes, generate context-aware personalized responses, dispatch emails via Gmail, book calendar events, and persist long-term memory in MongoDB Atlas.

---

## 📖 Project Description

The **AI Job Opportunity Agent** is an enterprise-grade autonomous multi-agent AI system designed to automate a candidate's recruiter email workflow end-to-end. Built with a modular micro-agent state machine, the system continuously monitors incoming recruiter communications, evaluates business rules, attaches tailored domain PDF resumes, sends personalized auto-replies, books interview slots on Google Calendar, and visualizes live pipeline execution in real time via an interactive Angular Web Dashboard.

### ✨ Key Features & Capabilities:
- **📬 Real-Time Gmail Inbox Watcher**: Continuously polls unread emails via IMAP every 15 seconds and automatically triggers the multi-agent pipeline.
- **🧠 8-Stage Micro-Agent Engine**: Modular pipeline architecture (`Listener` ➔ `Analyzer` ➔ `Decision` ➔ `ResumeSelector` ➔ `ReplyGenerator` ➔ `EmailSender` ➔ `Calendar` ➔ `Notifier`).
- **📄 Smart PDF Resume Selector**: Uses regex word boundaries to analyze incoming job descriptions and match tailored domain PDF resumes (`resume_ai.pdf`, `resume_backend.pdf`, `resume_healthcare.pdf`, `resume_leadership.pdf`).
- **✍️ Context-Aware LLM Auto-Reply**: Dynamically derives personalized replies addressing specific recruiter names, company roles, and proposed interview dates.
- **🔍 Smart Recruiter Name Parsing**: Differentiates between sender sign-offs (`Best, Reecha`), From headers (`Pooja Kushwah <pooja@gmail.com>`), and candidate greetings (`Hi Uday`).
- **📅 Google Calendar Booking**: Automatically books Google Calendar interview slots when interview availability is requested.
- **🗄️ MongoDB Atlas Persistent Memory**: Long-term state persistence and history tracking for candidate opportunities.
- **🎨 Modular Angular Web Dashboard**: Dedicated Angular 17 SPA with real-time SSE execution stream, live agent graph, and email test workbench.

---

## 🛠️ Complete Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | Angular 17+ (NgModule / Standalone Components, RxJS, EventSource SSE) |
| **Backend Engine** | Node.js, TypeScript, Express.js, EventEmitter State Graph |
| **Database & Storage** | MongoDB Atlas (Mongoose ODM), Fallback In-Memory Memory Repository |
| **AI / LLM Provider** | Google Gemini API (`gemini-2.0-flash`), Custom Fallback Engine |
| **Email Protocol** | Gmail API, Nodemailer (SMTP Send), Imap Simple (Live Inbox Watcher) |
| **PDF Generation** | PDFKit (`scripts/generate-pdf-resumes.ts`) |
| **Build & Tooling** | Angular CLI (`@angular/cli`), ts-node, esbuild |

---

## 📂 Modular Angular UI Structure (`apps/web/src/app/`)

The Angular frontend follows official Angular CLI modular architecture with dedicated directories for every component:

```
apps/web/src/app/
├── components/
│   ├── header/                            # App Header & Gmail fetch action
│   │   ├── header.component.ts
│   │   ├── header.component.html
│   │   └── header.component.css
│   ├── agent-graph/                        # Animated 8-node pipeline execution graph
│   │   ├── agent-graph.component.ts
│   │   ├── agent-graph.component.html
│   │   └── agent-graph.component.css
│   ├── email-simulator/                    # Interactive recruiter email workbench & presets
│   │   ├── email-simulator.component.ts
│   │   ├── email-simulator.component.html
│   │   └── email-simulator.component.css
│   ├── opportunity-list/                   # MongoDB pipeline records table & detail modal
│   │   ├── opportunity-list.component.ts
│   │   ├── opportunity-list.component.html
│   │   └── opportunity-list.component.css
│   └── agent-console/                      # Real-time SSE telemetry terminal stream
│       ├── agent-console.component.ts
│       ├── agent-console.component.html
│       └── agent-console.component.css
├── core/                                  # Core services & singletons
│   ├── services/
│   │   ├── opportunity.service.ts          # REST API HTTP Client (/api/opportunities)
│   │   └── agent-stream.service.ts        # RxJS EventSource client for SSE stream
│   └── models/
│       └── opportunity.model.ts            # TypeScript interfaces
├── app.component.ts                       # Main application shell
├── app.component.html
├── app.component.css
└── app.config.ts                          # Zone change detection & HttpClient providers
```

---

## 🛠️ Complete Setup & Installation Guide

### 📋 1. Prerequisites
Before setting up the project, make sure you have the following installed:
- **Node.js** (v18.0.0 or higher): [Download Node.js](https://nodejs.org/)
- **npm** (v9.0.0 or higher)
- **Angular CLI**: `npm install -g @angular/cli@latest`

---

### 📥 2. Clone & Install Dependencies
Clone the repository and install dependencies for both the main workspace and the Angular web application:

```bash
# Clone repository
git clone https://github.com/udaysinghkushwah/job-opportunity-agent.git
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
2. Navigate to **Security** ➔ Enable **2-Step Verification**.
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

### 📑 6. Generate Domain PDF Resumes
The system automatically selects domain-specific PDF resumes (`AI`, `Backend`, `Healthcare`, `Leadership`) to attach to recruiter auto-replies.

Run the automated PDF resume builder:
```bash
npx ts-node scripts/generate-pdf-resumes.ts
```
This generates the following PDF files in `storage/resumes/`:
- `resume_ai.pdf`
- `resume_backend.pdf`
- `resume_healthcare.pdf`
- `resume_leadership.pdf`

---

## 🚀 How to Run (Separate UI & API Servers)

You can run the **Angular UI** and **Backend API Server** as separate dedicated microservices:

### 1. Launch Dedicated Angular UI Dev Server (Port 4200)
Starts the dedicated Angular CLI development server with live reload, AOT compilation, and proxy integration:
```bash
npm run dev:ui
```
👉 **Angular UI URL**: **[http://localhost:4200](http://localhost:4200)**

---

### 2. Launch Dedicated Backend API Server (Port 3010)
Starts Express server, MongoDB connection, SSE telemetry stream, and live Gmail IMAP inbox watcher:
```bash
npm run dev:api
```
👉 **Backend API URL**: **[http://localhost:3010](http://localhost:3010)**

---

### 3. Automatic Proxy Configuration ([`apps/web/proxy.conf.json`](file:///Users/uday/Documents/AI/job-opportunity-agent/apps/web/proxy.conf.json))
The Angular CLI dev server on port `4200` automatically proxies all `/api/*` HTTP requests to port `3010`:

```json
{
  "/api": {
    "target": "http://localhost:3010",
    "secure": false,
    "changeOrigin": true
  }
}
```

---

### 4. Build Angular Production Distribution
To compile the Angular UI production bundle into `apps/web/dist`:
```bash
npm run build:web
```

---

### 5. Run Automated Multi-Agent Test Suite
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
3. **Decision Agent**: Evaluates business policy rules (Recruiter + Job opportunity -> `AUTO_REPLY`, Spam -> `REJECT_IGNORE`).
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
