# AI Job Opportunity Agent — Technical Architecture & Code-Level Deep Dive 🧠💻

This document provides a comprehensive, code-level architectural breakdown of the **AI Job Opportunity Agent**. It details the inner workings of the multi-agent pipeline, code structures, data schemas, LLM prompt engineering, fallback mechanisms, and the Angular 17 UI integration.

---

## 📐 1. System Architecture Overview

The system is designed as an **Event-Driven Micro-Agent State Machine**. Incoming email events (via IMAP live inbox polling or HTTP webhooks) trigger a sequential pipeline of 8 specialized agents.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 INCOMING EMAIL EVENT                                   │
│            (Gmail IMAP Watcher / HTTP Workbench / Webhook Ingestion)                   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              WORKFLOW ENGINE (State Machine)                           │
│                                                                                        │
│  [1. EmailListener] ➔ [2. EmailAnalysis] ➔ [3. DecisionEngine]                       │
│                                                   │                                    │
│                         ┌─────────────────────────┴─────────────────────────┐          │
│                         │ Action == AUTO_REPLY                              │          │
│                         ▼                                                   ▼          │
│             [4. ResumeSelector]                                      [Short Circuit]   │
│                     │                                              (Spam / Rejected)   │
│                     ▼                                                                  │
│             [5. ReplyGenerator]                                                        │
│                     │                                                                  │
│                     ▼                                                                  │
│             [6. EmailSender]                                                           │
│                     │                                                                  │
│                     ▼                                                                  │
│             [7. CalendarAgent]                                                         │
│                     │                                                                  │
│                     ▼                                                                  │
│             [8. NotifierAgent] ─────────────────────────────────────────────────────────┼───┐
└────────────────────────────────────────────────────────────────────────────────────────┘   │
                                                                                             │
                                                                                             ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐  SSE Stream
│                           PERSISTENCE & REAL-TIME DASHBOARD                            │  Broadcaster
│                                                                                        │   │
│  MongoDB Atlas Persistence  ◄────────  RxJS EventSource SSE Stream  ◄──────────────────┘
│  (Mongoose Schema Model)               (Angular Standalone UI on :4200)                │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 2. Code-Level Deep Dive: The 8 Micro-Agents

Each agent is implemented as a standalone TypeScript class extending or executing single-responsibility functions, operating on a shared, strongly-typed state object (`WorkflowState`).

---

### Agent 1: Email Listener Agent ([`agents/listener.agent.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/agents/listener.agent.ts))
- **Primary Responsibility**: Ingests raw email payloads (From header, Subject, Body, Timestamp, Message-ID) and initializes the `WorkflowState`.
- **Key Functions**:
  - `ingestEmail(rawPayload: RawEmailPayload): WorkflowState`
  - Assigns unique `opportunityId` (`opp_<timestamp>_<hash>`).
  - Sets initial pipeline status to `INGESTED`.
  - Emits telemetry event `AGENT_START: EmailListenerAgent`.

---

### Agent 2: Email Analysis Agent ([`agents/analyzer.agent.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/agents/analyzer.agent.ts))
- **Primary Responsibility**: Uses Gemini LLM to parse unstructured email bodies into structured JSON data.
- **Extracted Schema**:
  ```typescript
  interface ExtractedOpportunity {
    company: string;
    recruiterName: string;
    role: string;
    type: 'Interview' | 'Job_Offer' | 'General_Inquiry' | 'Spam_Marketing';
    ctc?: string;
    location?: string;
    jdSummary: string;
    resumeRequested: boolean;
    interviewDateProposed?: string;
  }
  ```
- **Smart Recruiter Name Extraction Logic**:
  To prevent greetings like `Hi Uday,` from accidentally setting `recruiterName = "Uday"` (candidate name), the fallback parser applies a 3-tier heuristic:
  1. **Signature Parsing**: Checks email bottom sign-offs (`Best, Reecha`, `Regards, Pooja`, `Thanks, John`).
  2. **Header Parsing**: Extracts display name from `From:` header (`"Pooja Kushwah" <pooja@gmail.com>`).
  3. **Fallback Prefix**: Sanitizes email address prefix (`pooja.kushwah`).

---

### Agent 3: Decision Making Agent ([`agents/decision.agent.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/agents/decision.agent.ts))
- **Primary Responsibility**: Evaluates policy rules to determine the pipeline execution path (`AUTO_REPLY`, `ASK_USER`, `REJECT_IGNORE`).
- **Policy Rules**:
  - If `type === 'Spam_Marketing'` or email body contains unsubscribed marketing links ➔ `REJECT_IGNORE` (Pipeline short-circuits).
  - If `type === 'Interview'` or `type === 'Job_Offer'` or `type === 'General_Inquiry'` (Legitimate recruiter inquiry) ➔ `AUTO_REPLY`.
  - If CTC or requirements are outside predefined safety thresholds ➔ `ASK_USER`.

---

### Agent 4: Resume Selection Agent ([`agents/resume-selector.agent.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/agents/resume-selector.agent.ts))
- **Primary Responsibility**: Matches role titles and JD keywords against candidate domain PDF resumes using word-boundary regex patterns (`\bkeyword\b`).
- **Category Matrix**:
  - **AI / ML**: `AI`, `Machine Learning`, `LLM`, `Deep Learning`, `Python`, `PyTorch` ➔ `resume_ai.pdf`
  - **Backend / Systems**: `Node.js`, `TypeScript`, `Golang`, `Backend`, `Distributed`, `Microservices` ➔ `resume_backend.pdf`
  - **Healthcare / Biotech**: `Healthcare`, `Biotech`, `Clinical`, `HIPAA`, `Medical` ➔ `resume_healthcare.pdf`
  - **Leadership / Management**: `Lead`, `Architect`, `Director`, `Manager`, `VP`, `Head` ➔ `resume_leadership.pdf`
- **Fallback**: Defaults to `resume_backend.pdf` if no specific keywords match.

---

### Agent 5: Reply Generator Agent ([`agents/reply-generator.agent.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/agents/reply-generator.agent.ts))
- **Primary Responsibility**: Generates a professional, context-aware email response under 100 words.
- **LLM Prompt Engineering**:
  - Dynamically addresses the recruiter by name (`Hi [RecruiterName]`).
  - Mentions specific role title and company name.
  - Confirms PDF resume attachment.
  - Acknowledges proposed interview dates or offers available availability.
  - Formats candidate sign-off (`Best regards,\nUday Singh Kushwah`).

---

### Agent 6: Email Sending Agent ([`agents/email-sender.agent.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/agents/email-sender.agent.ts))
- **Primary Responsibility**: Dispatches the auto-reply via Nodemailer Gmail API / SMTP transport.
- **Attachment Injection**: Loads the selected PDF resume from `storage/resumes/<selected_resume>.pdf` and attaches it to the SMTP MIME message payload.
- **Safety Checks**: Verifies recipient email is valid and suppresses auto-replies to mailer-daemons or system bounce addresses.

---

### Agent 7: Calendar Booking Agent ([`agents/calendar.agent.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/agents/calendar.agent.ts))
- **Primary Responsibility**: If `interviewDateProposed` is present in the opportunity context, calls `CalendarTool` to generate a Google Calendar event.
- **Output**: Returns Google Calendar event URL (`https://calendar.google.com/calendar/event?eid=...`) and appends it to state context.

---

### Agent 8: Notification Agent ([`agents/notifier.agent.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/agents/notifier.agent.ts))
- **Primary Responsibility**: Broadcasts final pipeline execution outcome across multi-channel sinks:
  1. **MongoDB Atlas**: Saves/updates the complete `Opportunity` document.
  2. **SSE Stream Server**: Emits live telemetry event `PIPELINE_COMPLETE` to all connected UI clients.
  3. **Slack / Telegram**: Dispatches webhook notification summary.

---

## 🗄️ 3. Persistence & Service Layer

### 1. MongoDB Service ([`services/mongodb.service.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/services/mongodb.service.ts))
- Connects to MongoDB Atlas using Mongoose ODM.
- **Mongoose Schema (`Opportunity`)**:
  ```typescript
  const OpportunitySchema = new Schema({
    opportunityId: { type: String, required: true, unique: true },
    recruiterEmail: String,
    recruiterName: String,
    company: String,
    role: String,
    type: String,
    status: String,
    attachedResume: String,
    generatedReply: String,
    calendarEventUrl: String,
    logs: [String],
    createdAt: { type: Date, default: Date.now }
  });
  ```
- **Fault-Tolerant In-Memory Fallback**: If MongoDB connection fails or is offline, the service transparently switches to an in-memory repository array so pipeline execution never crashes.

---

### 2. Real-Time SSE Stream Service ([`services/sse.service.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/services/sse.service.ts))
- Implements Server-Sent Events (SSE) protocol over HTTP.
- Exposes endpoint `GET /api/stream`.
- Maintains active client response array (`res.write('data: ...\n\n')`).
- Broadcasts real-time step logs, node activations, and state changes to the Angular frontend.

---

## 🛠️ 4. Tools & Integrations Layer

| Tool | Source File | Functionality |
| :--- | :--- | :--- |
| **LLMTool** | [`tools/llm.tool.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/tools/llm.tool.ts) | Integrates `@google/genai` Gemini 2.0 API. Includes fallback mock engine when API rate limit (429) occurs. |
| **GmailTool** | [`tools/gmail.tool.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/tools/gmail.tool.ts) | Provides Nodemailer SMTP email dispatch and `imap-simple` background polling watcher (15s interval). |
| **CalendarTool** | [`tools/calendar.tool.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/tools/calendar.tool.ts) | Generates Google Calendar event URLs and schedules meeting slots. |
| **NotificationTool** | [`tools/notification.tool.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/tools/notification.tool.ts) | Formats and dispatches notification payloads to external webhooks and SSE listeners. |

---

## 🎨 5. Angular Standalone UI Architecture (`apps/web/`)

The frontend is an Angular 17 Single Page Application (SPA) designed with a modular component architecture:

```
apps/web/src/app/components/
├── header/               # Displays candidate profile status & manual trigger buttons
├── agent-graph/           # SVG/CSS animated 8-node state machine execution visualizer
├── email-simulator/       # Test workbench with recruiter email presets
├── opportunity-list/      # Real-time data table of MongoDB records & detailed modal
└── agent-console/         # Live terminal streaming SSE telemetry logs
```

### Component Data Flow & Services:
1. **`AgentStreamService`** ([`apps/web/src/app/services/agent-stream.service.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/apps/web/src/app/services/agent-stream.service.ts)):
   - Connects to `/api/stream` via native `EventSource`.
   - Converts SSE stream events into RxJS Observables (`stream$`, `activeAgent$`).
2. **`OpportunityService`** ([`apps/web/src/app/services/opportunity.service.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/apps/web/src/app/services/opportunity.service.ts)):
   - Performs REST API calls (`GET /api/opportunities`, `POST /api/simulate-email`).
3. **`Proxy Configuration`** ([`apps/web/proxy.conf.json`](file:///Users/uday/Documents/AI/job-opportunity-agent/apps/web/proxy.conf.json)):
   - Routes `/api/*` from Angular dev server (`localhost:4200`) to backend Express API (`localhost:3010`).

---

## 🔄 6. Complete End-to-End Workflow Trace

When an email arrives from recruiter `pooja@abc-tech.com`:

```
1. [InboxWatcher] Detects new unread email from pooja@abc-tech.com
   │
2. [EmailListenerAgent] Creates opportunity record "opp_178612..." with status "INGESTED"
   │
3. [EmailAnalysisAgent] Invokes LLM -> Parses:
   │  - Company: "Abc-Tech"
   │  - Role: "Senior Node.js Engineer"
   │  - Recruiter: "Pooja" (Parsed from "Best, Pooja" sign-off)
   │  - Type: "Interview"
   │  - InterviewDate: "Tomorrow at 3 PM"
   │
4. [DecisionAgent] Evaluates rules -> Decision: AUTO_REPLY
   │
5. [ResumeSelectorAgent] Matches keywords "Node.js" -> Selects: "resume_backend.pdf"
   │
6. [ReplyGeneratorAgent] Generates reply:
   │  "Hi Pooja, Thank you for reaching out regarding the Senior Node.js Engineer role at Abc-Tech..."
   │
7. [EmailSenderAgent] Connects to Gmail SMTP -> Attaches "resume_backend.pdf" -> Delivers email
   │
8. [CalendarAgent] Parses "Tomorrow at 3 PM" -> Generates Google Calendar event link
   │
9. [NotifierAgent] Saves complete record to MongoDB Atlas -> Emits SSE event to Angular Dashboard
```

---

## 🛡️ 7. Resilience, Fallbacks & Error Handling

1. **Gemini API Rate Limits (HTTP 429 / Quota Depleted)**:
   - When Gemini returns `429 RESOURCE_EXHAUSTED`, `LLMTool` automatically catches the error and seamlessly falls back to an internal deterministic mock engine without halting the pipeline.
2. **MongoDB Connection Failures**:
   - If network or credentials fail, `MongoDBService` switches to an in-memory repository to guarantee zero request drops.
3. **Gmail IMAP Reconnection**:
   - The inbox watcher handles socket disconnects with exponential backoff re-polling every 15 seconds.
