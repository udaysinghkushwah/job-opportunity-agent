import { BaseAgent } from './base.agent';
import { OpportunityState, DecisionResult } from '../workflows/state.interface';
import { LLMTool } from '../tools/llm.tool';
import { DECISION_PROMPT_TEMPLATE } from '../prompts/decision.prompt';

export class DecisionAgent extends BaseAgent {
  public readonly name = 'DecisionAgent';
  private llmTool: LLMTool;

  constructor() {
    super();
    this.llmTool = new LLMTool();
  }

  public async execute(state: OpportunityState): Promise<OpportunityState> {
    this.log(state, 'Evaluating decision rules for recruiter opportunity...');

    if (!state.analysis) {
      throw new Error('State error: analysis missing before decision execution.');
    }

    const prompt = DECISION_PROMPT_TEMPLATE.replace('{{analysisJson}}', JSON.stringify(state.analysis, null, 2));

    const fallback: DecisionResult = this.evaluateRules(state);

    const decision = await this.llmTool.generateJson<DecisionResult>(
      { userPrompt: prompt },
      fallback
    );

    state.decision = decision;
    state.currentStep = 'DECISION_COMPLETE';

    this.log(state, `Decision Action Determined: ${decision.action} (${decision.reason})`, { decision });

    return state;
  }

  private evaluateRules(state: OpportunityState): DecisionResult {
    const analysis = state.analysis!;

    if (analysis.type === 'Spam_Marketing') {
      return {
        action: 'REJECT_IGNORE',
        reason: 'Email identified as promotional spam or marketing.'
      };
    }

    return {
      action: 'AUTO_REPLY',
      reason: 'Legitimate recruiter email or job opportunity inquiry.'
    };
  }
}
