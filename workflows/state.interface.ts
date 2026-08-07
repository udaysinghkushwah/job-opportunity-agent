export interface RawEmailPayload {
  messageId: string;
  threadId: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
}

export interface ExtractedEmailAnalysis {
  company: string;
  recruiterName: string;
  recruiterEmail?: string;
  role: string;
  type: 'Interview' | 'Job_Offer' | 'General_Inquiry' | 'Spam_Marketing';
  ctc?: string;
  location?: string;
  jd: string;
  resumeRequested: boolean;
  interviewDate?: string;
  confidenceScore: number;
}

export interface DecisionResult {
  action: 'AUTO_REPLY' | 'ASK_USER' | 'REJECT_IGNORE';
  reason: string;
}

export interface SelectedResume {
  category: 'Backend' | 'AI' | 'Healthcare' | 'Leadership' | 'General';
  resumeName: string;
  filePath: string;
  reason: string;
}

export interface GeneratedReply {
  subject: string;
  body: string;
}

export interface EmailSentResult {
  success: boolean;
  messageId: string;
  sentAt: string;
  attachmentAttached?: string;
}

export interface CalendarEventResult {
  success: boolean;
  eventId?: string;
  summary?: string;
  startTime?: string;
  endTime?: string;
  eventUrl?: string;
}

export interface NotificationResult {
  sent: boolean;
  channels: string[];
  timestamp: string;
}

export interface OpportunityState {
  opportunityId: string;
  rawEmail: RawEmailPayload;
  analysis?: ExtractedEmailAnalysis;
  decision?: DecisionResult;
  selectedResume?: SelectedResume;
  replyContent?: GeneratedReply;
  emailSent?: EmailSentResult;
  calendarEvent?: CalendarEventResult;
  notificationSent?: NotificationResult;
  currentStep: string;
  status: 'EMAIL_RECEIVED' | 'ANALYZED' | 'AUTO_REPLIED' | 'USER_NOTIFIED' | 'INTERVIEW_SCHEDULED' | 'REJECTED';
  logs: Array<{ step: string; timestamp: string; details: any }>;
}
