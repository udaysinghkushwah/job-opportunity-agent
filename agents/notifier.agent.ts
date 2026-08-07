import { BaseAgent } from './base.agent';
import { OpportunityState } from '../workflows/state.interface';
import { NotificationTool } from '../tools/notification.tool';

export class NotifierAgent extends BaseAgent {
  public readonly name = 'NotifierAgent';
  private notificationTool: NotificationTool;

  constructor() {
    super();
    this.notificationTool = new NotificationTool();
  }

  public async execute(state: OpportunityState): Promise<OpportunityState> {
    this.log(state, 'Dispatching multi-channel notifications (Slack/Telegram/UI Dashboard)...');

    const company = state.analysis?.company || 'Company';
    const role = state.analysis?.role || 'Role';
    const recruiterName = state.analysis?.recruiterName || 'Recruiter';
    const action = state.decision?.action || 'REVIEW';

    const details = state.calendarEvent?.summary
      ? `Interview Scheduled: ${state.calendarEvent.summary}`
      : `Action Executed: ${action} - Resume attached: ${state.selectedResume?.resumeName || 'None'}`;

    const result = await this.notificationTool.dispatchNotification({
      title: `Job Opportunity Agent Update: ${company}`,
      company,
      role,
      recruiterName,
      action,
      details
    });

    state.notificationSent = result;
    state.currentStep = 'WORKFLOW_COMPLETED';

    this.log(state, `Workflow complete! Notifications dispatched to channels: ${result.channels.join(', ')}`, { result });

    return state;
  }
}
