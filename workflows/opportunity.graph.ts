import { EventEmitter } from 'events';
import { OpportunityState, RawEmailPayload } from './state.interface';
import { EmailListenerAgent } from '../agents/listener.agent';
import { EmailAnalysisAgent } from '../agents/analyzer.agent';
import { DecisionAgent } from '../agents/decision.agent';
import { ResumeSelectorAgent } from '../agents/resume-selector.agent';
import { ReplyGeneratorAgent } from '../agents/reply-generator.agent';
import { EmailSenderAgent } from '../agents/email-sender.agent';
import { CalendarAgent } from '../agents/calendar.agent';
import { NotifierAgent } from '../agents/notifier.agent';
import { dbService } from '../database/mongodb.service';

export class OpportunityWorkflowEngine extends EventEmitter {
  private listenerAgent = new EmailListenerAgent();
  private analysisAgent = new EmailAnalysisAgent();
  private decisionAgent = new DecisionAgent();
  private resumeSelectorAgent = new ResumeSelectorAgent();
  private replyGeneratorAgent = new ReplyGeneratorAgent();
  private emailSenderAgent = new EmailSenderAgent();
  private calendarAgent = new CalendarAgent();
  private notifierAgent = new NotifierAgent();

  async processEmail(rawEmail: RawEmailPayload): Promise<OpportunityState> {
    const opportunityId = `opp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    let state: OpportunityState = {
      opportunityId,
      rawEmail,
      currentStep: 'INITIATED',
      status: 'EMAIL_RECEIVED',
      logs: []
    };

    console.log(`\n==================================================`);
    console.log(`[WorkflowEngine] Starting pipeline for Opportunity: ${opportunityId}`);
    console.log(`[Subject]: "${rawEmail.subject}" from "${rawEmail.from}"`);
    console.log(`==================================================\n`);

    const pipeline = [
      this.listenerAgent,
      this.analysisAgent,
      this.decisionAgent,
      this.resumeSelectorAgent,
      this.replyGeneratorAgent,
      this.emailSenderAgent,
      this.calendarAgent,
      this.notifierAgent
    ];

    for (const agent of pipeline) {
      try {
        this.emit('step_start', { opportunityId, step: agent.name, state });
        state = await agent.execute(state);
        
        // Save state to MongoDB Memory after each agent step
        await this.persistState(state);

        this.emit('step_complete', { opportunityId, step: agent.name, state });

        // Branching logic: If rejected as spam, stop early
        if (state.decision?.action === 'REJECT_IGNORE' && agent.name === 'DecisionAgent') {
          console.log(`[WorkflowEngine] Short-circuiting pipeline (Decision: REJECT_IGNORE)`);
          state.status = 'REJECTED';
          state.currentStep = 'WORKFLOW_COMPLETED';
          await this.persistState(state);
          break;
        }

      } catch (err: any) {
        console.error(`[WorkflowEngine] Error in agent ${agent.name}:`, err.message);
        state.logs.push({
          step: agent.name,
          timestamp: new Date().toISOString(),
          details: { error: err.message }
        });
        await this.persistState(state);
        this.emit('step_error', { opportunityId, step: agent.name, error: err.message, state });
        break;
      }
    }

    console.log(`\n[WorkflowEngine] Pipeline execution finished. Final Status: ${state.status}\n`);
    return state;
  }

  private async persistState(state: OpportunityState) {
    const record = {
      opportunityId: state.opportunityId,
      company: state.analysis?.company || 'Processing...',
      recruiterName: state.analysis?.recruiterName || 'Unknown',
      recruiterEmail: state.rawEmail.from,
      role: state.analysis?.role || 'Pending Analysis',
      type: state.analysis?.type || 'General',
      ctc: state.analysis?.ctc,
      location: state.analysis?.location,
      status: state.status,
      resumeVersion: state.selectedResume?.resumeName,
      lastEmailSubject: state.rawEmail.subject,
      lastEmailBody: state.rawEmail.body,
      generatedReply: state.replyContent?.body,
      calendarEventUrl: state.calendarEvent?.eventUrl,
      nextAction: this.deriveNextAction(state),
      logs: state.logs
    };

    await dbService.saveOpportunity(record);
  }

  private deriveNextAction(state: OpportunityState): string {
    if (state.status === 'REJECTED') return 'No action required (Spam/Ignored)';
    if (state.status === 'INTERVIEW_SCHEDULED') return 'Prepare DSA & System Design Interview';
    if (state.status === 'AUTO_REPLIED') return 'Await Recruiter Response to Resume';
    if (state.decision?.action === 'ASK_USER') return 'Candidate Action Required (Manual Approval)';
    return 'Processing Email...';
  }
}

export const workflowEngine = new OpportunityWorkflowEngine();
