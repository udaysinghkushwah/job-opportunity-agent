import { BaseAgent } from './base.agent';
import { OpportunityState } from '../workflows/state.interface';
import { CalendarTool } from '../tools/calendar.tool';

export class CalendarAgent extends BaseAgent {
  public readonly name = 'CalendarAgent';
  private calendarTool: CalendarTool;

  constructor() {
    super();
    this.calendarTool = new CalendarTool();
  }

  public async execute(state: OpportunityState): Promise<OpportunityState> {
    const isInterview = state.analysis?.type === 'Interview' || state.analysis?.interviewDate;

    if (!isInterview || state.decision?.action === 'REJECT_IGNORE') {
      this.log(state, 'Skipping calendar event creation (Not an interview request)');
      return state;
    }

    this.log(state, 'Booking Google Calendar interview slot...');

    const company = state.analysis?.company || 'Company';
    const role = state.analysis?.role || 'Engineer';
    const recruiterName = state.analysis?.recruiterName || 'Recruiter';
    const dateTimeStr = state.analysis?.interviewDate;

    const result = await this.calendarTool.createInterviewEvent({
      company,
      role,
      recruiterName,
      dateTimeStr
    });

    state.calendarEvent = result;
    state.currentStep = 'CALENDAR_BOOKED';
    state.status = 'INTERVIEW_SCHEDULED';

    this.log(state, `Google Calendar event booked! EventUrl=${result.eventUrl}`, { result });

    return state;
  }
}
