# 🚀 LinkedIn Launch Post (Executive Professional Edition)

Copy & paste the polished professional text below directly into LinkedIn:

---

Managing inbound recruiter communications efficiently is a common challenge for software engineers. Between evaluating role specifications, selecting tailored resume variants, drafting contextual responses, and coordinating interview schedules, handling outreach requires considerable time.

To solve this, I designed and built **AI Job Opportunity Agent**—an open-source, event-driven multi-agent system built with **Node.js**, **TypeScript**, **Google Gemini API**, and **Angular 17**.

The system automates the candidate response lifecycle end-to-end within seconds while maintaining strict policy rules and high reliability.

---

### ⚙️ System Workflow Architecture:

1️⃣ **Real-Time Event Ingestion**: Continuously monitors unread Gmail inbox communications via IMAP and initializes pipeline state.
2️⃣ **Structured LLM Extraction**: Leverages Gemini 2.0 to extract structured metadata (Company, Recruiter, Title, Compensation, Proposed Schedules).
3️⃣ **Entity Disambiguation**: Implements a 3-tier heuristic parser to accurately identify sender signatures vs. candidate greetings.
4️⃣ **Automated Policy Evaluation**: Evaluates incoming inquiries against business rules, approving valid recruiter outreach while filtering marketing spam.
5️⃣ **Targeted Resume Variant Matching**: Applies regex word-boundary matching to automatically select domain-specific PDF resumes.
6️⃣ **Contextual SMTP Dispatch**: Generates concise, context-aware email responses (< 100 words) and delivers them with the attached PDF resume.
7️⃣ **Calendar Provisioning**: Automatically books Google Calendar interview slots when scheduling availability is detected.
8️⃣ **Real-Time Observability**: Streams execution telemetry to an Angular 17 dashboard using RxJS Server-Sent Events (SSE) and an animated state machine visualizer.

---

💻 **Technology Stack**:
- **Backend Architecture**: Node.js, TypeScript, Express, EventEmitter State Machine
- **AI Core**: Google Gemini API (`gemini-2.0-flash`) with fallback mock engine
- **Frontend SPA**: Angular 17 (Standalone Component Architecture, RxJS SSE)
- **Persistence Layer**: MongoDB Atlas (with in-memory repository fallback)
- **Document Processing**: PDFKit

---

⭐ **Open-Source Repository & Architecture Docs**:  
The project is fully open-source. Explore the complete codebase, technical architecture, and setup guides on GitHub:  
👉 **https://github.com/udaysinghkushwah/job-opportunity-agent**

I would welcome technical feedback, architecture discussion, or open-source contributions from the community.

#ArtificialIntelligence #AgenticAI #NodeJS #TypeScript #Angular #Gemini #WebDevelopment #OpenSource #SoftwareEngineering #Automation #GmailAPI #MongoDB
