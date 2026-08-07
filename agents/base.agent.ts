import { OpportunityState } from '../workflows/state.interface';

export abstract class BaseAgent {
  public abstract readonly name: string;

  public abstract execute(state: OpportunityState): Promise<OpportunityState>;

  protected log(state: OpportunityState, message: string, details: any = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[Agent: ${this.name}] ${message}`);
    state.logs.push({
      step: this.name,
      timestamp,
      details: { message, ...details }
    });
  }
}
