import { BaseAgent } from './base.agent';
import { OpportunityState } from '../workflows/state.interface';

export class EmailListenerAgent extends BaseAgent {
  public readonly name = 'EmailListenerAgent';

  public async execute(state: OpportunityState): Promise<OpportunityState> {
    this.log(state, 'Ingested new email payload from Gmail webhook / PubSub', {
      messageId: state.rawEmail.messageId,
      threadId: state.rawEmail.threadId,
      from: state.rawEmail.from,
      subject: state.rawEmail.subject
    });

    state.currentStep = 'EMAIL_LISTENER_COMPLETE';
    state.status = 'EMAIL_RECEIVED';

    return state;
  }
}
