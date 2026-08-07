# 🧠 Technical Architecture & Code-Level Deep Dive

> [!NOTE]
> This document provides a comprehensive code-level architectural breakdown of the **AI Job Opportunity Agent**. It covers the event-driven micro-agent state machine, data schemas, LLM prompt engineering, fallback resilience, step-by-step visual diagrams, and the Angular 17 SPA integration.

---

## 📐 1. System Architecture Overview

The system operates as an **Event-Driven Micro-Agent State Machine**. Incoming email events from the Gmail IMAP Watcher or HTTP Workbench trigger an automated, multi-stage pipeline.

```mermaid
flowchart TD
    subgraph Ingestion ["📬 Ingestion Layer"]
        A[Gmail IMAP Watcher 15s] -->|Raw Email| B[EmailListenerAgent]
        A2[Angular Email Simulator] -->|REST Payload| B
    end

    subgraph Pipeline ["⚙️ 8-Stage Agent State Machine"]
        B -->|Initialize State| C[EmailAnalysisAgent]
        C -->|Extract Structured JSON| D[DecisionAgent]
        
        D -->|Spam / Reject| D1[Short-Circuit: REJECT_IGNORE]
        D -->|Legitimate Inquiry| E[ResumeSelectorAgent]
        
        E -->|Match Domain PDF| F[ReplyGeneratorAgent]
        F -->|Draft Contextual Reply| G[EmailSenderAgent]
        G -->|SMTP Send + PDF Attachment| H[CalendarAgent]
        H -->|Book Google Calendar| I[NotifierAgent]
    end

    subgraph StorageUI ["🗄️ Persistence & Telemetry Layer"]
        I -->|Save State| J[(MongoDB Atlas)]
        I -->|Broadcast SSE Event| K[RxJS EventSource Stream]
        K -->|Real-Time Telemetry| L[Angular 17 SPA Dashboard]
    end

    style Ingestion fill:#1e293b,stroke:#3b82f6,color:#fff
    style Pipeline fill:#0f172a,stroke:#10b981,color:#fff
    style StorageUI fill:#1e1b4b,stroke:#8b5cf6,color:#fff
```

---

## 🔄 2. End-to-End Sequence Workflow

The sequence diagram below illustrates the exact execution path and inter-agent communication when a recruiter email arrives.

```mermaid
sequenceDiagram
    autonumber
    actor Recruiter as 📧 Recruiter / Gmail Inbox
    participant Watcher as 📡 Gmail IMAP Watcher
    participant Listener as 👂 EmailListenerAgent
    participant Analyzer as 🔍 EmailAnalysisAgent
    participant LLM as 🤖 Gemini LLM API
    participant Decision as ⚖️ DecisionAgent
    participant Resume as 📄 ResumeSelectorAgent
    participant Sender as 📤 EmailSenderAgent
    participant Mongo as 🗄️ MongoDB Atlas
    participant SSE as 📡 SSE Stream / UI

    Recruiter->>Watcher: Send Opportunity Email
    Watcher->>Listener: Trigger Email Ingest
    Listener->>Analyzer: Forward Raw Email Payload
    Analyzer->>LLM: Prompt LLM for Structured Extraction
    LLM-->>Analyzer: Return JSON (Company, Recruiter, Role, Date)
    Analyzer->>Decision: Send Extracted Context
    
    alt Legitimate Recruiter Inquiry
        Decision->>Resume: Trigger AUTO_REPLY Path
        Resume->>Resume: Match Regex Keywords to Domain PDF
        Resume->>Sender: Attach resume_backend.pdf & Draft Reply
        Sender->>Recruiter: Deliver SMTP Auto-Reply + PDF Attachment
        Sender->>Mongo: Persist Completed Opportunity
        Sender->>SSE: Broadcast PIPELINE_COMPLETE Event
    else Spam / Marketing Email
        Decision->>Mongo: Log REJECT_IGNORE Short-Circuit
        Decision->>SSE: Broadcast PIPELINE_SHORT_CIRCUIT Event
    end
```

---

## 🤖 3. Step-by-Step Micro-Agent Visual Breakdown

Below is the code-level analysis, data transformation, and visual architecture diagram for each step in the pipeline.

---

### Step 1: Real-Time Gmail Ingestion & Listener Agent
- **Source File**: [`agents/listener.agent.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/agents/listener.agent.ts)
- **Role**: Entry point for email ingestion. Initializes unique opportunity IDs and logs the starting telemetry state.

![Step 1 Gmail Ingestion Diagram](images/step1_gmail_ingestion.png)

```typescript
export class EmailListenerAgent {
  static ingest(rawPayload: RawEmailPayload): WorkflowState {
    const opportunityId = `opp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      opportunityId,
      rawPayload,
      status: 'INGESTED',
      logs: [`[Agent: EmailListenerAgent] Ingested payload from ${rawPayload.from}`],
      createdAt: new Date()
    };
  }
}
```

---

### Step 2: Email Analysis & LLM Metadata Extraction
- **Source File**: [`agents/analyzer.agent.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/agents/analyzer.agent.ts)
- **Role**: Invokes Gemini LLM to convert raw body text into structured JSON metadata.

![Step 2 Email Analysis Diagram](images/step2_email_analysis.png)

> [!TIP]
> **Recruiter Name Extraction Algorithm**:
> To prevent candidate greetings (e.g., `Hi Uday,`) from incorrectly overwriting `recruiterName`, the analyzer uses a 3-tier regex parser:
> 1. **Bottom Sign-Off**: Checks sign-offs (`Best, Sarah`, `Regards, John`, `Thanks, Alex`).
> 2. **From Header**: Extracts display name (`"Jane Smith" <jane@techcorp.com>`).
> 3. **Sanitized Prefix**: Extracts sanitized email username (`jane.smith`).

---

### Step 3: Policy Engine & Spam Filtration
- **Source File**: [`agents/decision.agent.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/agents/decision.agent.ts)
- **Role**: Evaluates policy rules and decides the pipeline path (`AUTO_REPLY`, `ASK_USER`, `REJECT_IGNORE`).

![Step 3 Decision Policy Engine Diagram](images/step3_decision_policy.png)

```mermaid
stateDiagram-v2
    [*] --> Ingested
    Ingested --> AnalysisComplete
    
    state AnalysisComplete {
        [*] --> CheckType
        CheckType --> SpamDetected: Type == Spam_Marketing
        CheckType --> InquiryDetected: Type == Interview / Job_Offer / General_Inquiry
    }

    SpamDetected --> ShortCircuitIgnore: Action = REJECT_IGNORE
    InquiryDetected --> CheckCTC: Check Salary Thresholds
    
    CheckCTC --> AutoReplyApproved: CTC Valid / Standard Role
    CheckCTC --> ManualUserReview: CTC Flagged / Out of Bounds
    
    AutoReplyApproved --> [*]: Action = AUTO_REPLY
    ManualUserReview --> [*]: Action = ASK_USER
    ShortCircuitIgnore --> [*]: Stop Pipeline
```

---

### Step 4: Resume Selection & Domain PDF Matching
- **Source File**: [`agents/resume-selector.agent.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/agents/resume-selector.agent.ts)
- **Role**: Matches domain keywords against candidate PDF resume categories using strict word-boundary regex (`\bkeyword\b`).

![Step 4 Resume Selection Diagram](images/step4_resume_selection.png)

| Domain Category | Regex Trigger Keywords | Output Resume File |
| :--- | :--- | :--- |
| **AI / Machine Learning** | `AI`, `Machine Learning`, `LLM`, `Deep Learning`, `Python`, `PyTorch` | `resume_ai.pdf` |
| **Backend / Distributed** | `Node.js`, `TypeScript`, `Golang`, `Backend`, `Microservices` | `resume_backend.pdf` |
| **Healthcare / Biotech** | `Healthcare`, `Biotech`, `Clinical`, `HIPAA`, `Medical` | `resume_healthcare.pdf` |
| **Leadership / Executive** | `Lead`, `Architect`, `Director`, `Manager`, `VP`, `Head` | `resume_leadership.pdf` |

---

### Step 5 & 6: Reply Generation & Gmail SMTP Delivery
- **Source Files**: [`agents/reply-generator.agent.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/agents/reply-generator.agent.ts) & [`agents/email-sender.agent.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/agents/email-sender.agent.ts)
- **Role**: Prompts Gemini LLM to construct a personalized email under 100 words and dispatches it via Nodemailer SMTP with the attached PDF resume.

![Step 5 & 6 Email Reply & SMTP Dispatch Diagram](images/step5_6_reply_and_sending.png)

---

### Step 7 & 8: Calendar Booking & Angular Dashboard Telemetry
- **Source Files**: [`agents/calendar.agent.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/agents/calendar.agent.ts) & [`agents/notifier.agent.ts`](file:///Users/uday/Documents/AI/job-opportunity-agent/agents/notifier.agent.ts)
- **Role**: Detects proposed interview schedules, books Google Calendar slots, persists to MongoDB Atlas, and streams SSE execution telemetry to the Angular UI dashboard.

![Step 7 & 8 Calendar Booking & Dashboard Telemetry Diagram](images/step7_8_calendar_and_dashboard.png)

---

## 🎨 4. Angular UI Component Architecture

The frontend is an Angular 17 Single Page Application (SPA) structured with dedicated standalone components:

```mermaid
graph TD
    subgraph AppShell ["📱 Angular Application Shell (AppModule / AppConfig)"]
        Header[HeaderComponent]
        Graph[AgentGraphComponent]
        Simulator[EmailSimulatorComponent]
        OppList[OpportunityListComponent]
        Console[AgentConsoleComponent]
    end

    subgraph Services ["📡 Core Angular Services"]
        StreamSvc[AgentStreamService RxJS EventSource]
        HttpSvc[OpportunityService HttpClient]
    end

    StreamSvc -->|SSE Stream Events| Graph
    StreamSvc -->|Live Terminal Logs| Console
    HttpSvc -->|REST Opportunities| OppList
    HttpSvc -->|POST Simulation| Simulator
```

---

## 🛡️ 5. Resiliency & Fallback Matrix

> [!WARNING]
> Production environments face API rate limits and network degradation. The system implements transparent fallbacks for high availability:

| Failure Scenario | Secondary Fallback Strategy | Resulting Status |
| :--- | :--- | :--- |
| **Gemini API 429 Rate Limit** | Automatically switches to deterministic Mock LLM Engine | `SUCCESS` (No pipeline interruption) |
| **MongoDB Atlas Offline** | Transparently switches to In-Memory Repository Array | `SUCCESS` (Zero request loss) |
| **Invalid Email Address / Bounce** | Suppresses auto-reply to `mailer-daemon` addresses | `REJECTED` (Prevents loops) |
| **IMAP Socket Disconnect** | Auto-reconnects with exponential backoff every 15s | `ACTIVE` (Continuous background monitoring) |
