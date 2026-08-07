import mongoose, { Schema, Document } from 'mongoose';

export interface IOpportunity extends Document {
  opportunityId: string;
  company: string;
  recruiterName: string;
  recruiterEmail: string;
  role: string;
  type: string;
  ctc?: string;
  location?: string;
  status: 'EMAIL_RECEIVED' | 'ANALYZED' | 'AUTO_REPLIED' | 'USER_NOTIFIED' | 'INTERVIEW_SCHEDULED' | 'REJECTED';
  resumeVersion?: string;
  lastEmailSubject: string;
  lastEmailBody: string;
  generatedReply?: string;
  calendarEventUrl?: string;
  nextAction: string;
  logs: Array<{ step: string; timestamp: string; details: any }>;
  createdAt: Date;
  updatedAt: Date;
}

export const OpportunitySchema = new Schema<IOpportunity>(
  {
    opportunityId: { type: String, required: true, unique: true },
    company: { type: String, required: true },
    recruiterName: { type: String, default: 'Unknown Recruiter' },
    recruiterEmail: { type: String, default: 'recruiter@company.com' },
    role: { type: String, required: true },
    type: { type: String, default: 'Interview' },
    ctc: { type: String },
    location: { type: String },
    status: {
      type: String,
      enum: ['EMAIL_RECEIVED', 'ANALYZED', 'AUTO_REPLIED', 'USER_NOTIFIED', 'INTERVIEW_SCHEDULED', 'REJECTED'],
      default: 'EMAIL_RECEIVED'
    },
    resumeVersion: { type: String },
    lastEmailSubject: { type: String, required: true },
    lastEmailBody: { type: String, required: true },
    generatedReply: { type: String },
    calendarEventUrl: { type: String },
    nextAction: { type: String, default: 'Initial Review' },
    logs: [{ step: String, timestamp: String, details: Schema.Types.Mixed }]
  },
  { timestamps: true }
);

export const OpportunityModel = mongoose.models.Opportunity || mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);
