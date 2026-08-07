export const ANALYSIS_PROMPT_TEMPLATE = `
You are an expert AI Email Analysis Agent for Job Opportunity Processing.
Analyze the following email from a recruiter or hiring manager and extract structured JSON information.

Email Content:
---
From: {{from}}
Subject: {{subject}}
Body:
{{body}}
---

Extract the following fields in strict JSON format without additional commentary:
{
  "company": "Company Name (e.g. Microsoft, Google, FinTech Corp, unknown if not mentioned)",
  "recruiterName": "Recruiter or Sender Name who WROTE the email (e.g. from sign-off like 'Best, Sarah' or From header display name like 'Jane Smith'). DO NOT extract the candidate's name from 'Hi [Candidate]' as recruiterName!",
  "role": "Job Role / Title (e.g. Senior Node.js Engineer, AI Architect, unknown)",
  "type": "Classification ('Interview', 'Job_Offer', 'General_Inquiry', 'Spam_Marketing')",
  "ctc": "Offered Compensation / CTC if mentioned (e.g. $180k - $220k or ₹35 LPA, null if not mentioned)",
  "location": "Location / Work Mode (e.g. Remote, Hybrid NYC, Onsite Bangalore, null if unknown)",
  "jd": "Brief summary of Job Description and key technical stack requirements",
  "resumeRequested": boolean (true if email asks for updated resume, CV, or portfolio, false otherwise),
  "interviewDate": "Proposed Interview Date/Time string if mentioned (e.g. 'Tomorrow 3 PM', '2026-08-10T15:00:00', null if none)",
  "confidenceScore": number (between 0.0 and 1.0)
}
`;
