export interface Opportunity {
  _id?: string;
  opportunityId: string;
  company: string;
  recruiterName: string;
  recruiterEmail?: string;
  role: string;
  status: 'ANALYZED' | 'INTERVIEW_SCHEDULED' | 'AUTO_REPLIED' | 'REJECTED' | 'PENDING_USER_DECISION';
  resumeVersion?: string;
  lastEmailSubject: string;
  lastEmailBody: string;
  generatedReply?: string;
  calendarEventUrl?: string;
  nextAction?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentStepEvent {
  type: 'agent_step' | 'pipeline_complete' | 'pipeline_error';
  opportunityId?: string;
  agentName?: string;
  step?: string;
  message?: string;
  timestamp?: string;
  data?: any;
}

export interface EmailSimulationPayload {
  from: string;
  subject: string;
  body: string;
}
