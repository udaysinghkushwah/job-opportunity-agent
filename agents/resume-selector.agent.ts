import { BaseAgent } from './base.agent';
import { OpportunityState } from '../workflows/state.interface';
import { ResumeTool } from '../tools/resume.tool';

export class ResumeSelectorAgent extends BaseAgent {
  public readonly name = 'ResumeSelectorAgent';
  private resumeTool: ResumeTool;

  constructor() {
    super();
    this.resumeTool = new ResumeTool();
  }

  public async execute(state: OpportunityState): Promise<OpportunityState> {
    if (state.decision?.action !== 'AUTO_REPLY') {
      this.log(state, 'Skipping resume selection (Decision action is not AUTO_REPLY)');
      return state;
    }

    const role = state.analysis?.role || '';
    const jd = state.analysis?.jd || '';

    this.log(state, `Selecting candidate resume version matching role "${role}"...`);

    const selected = this.resumeTool.selectBestResume(role, jd);
    state.selectedResume = selected;
    state.currentStep = 'RESUME_SELECTED';

    this.log(state, `Selected Resume: ${selected.resumeName} (Category: ${selected.category})`, { selected });

    return state;
  }
}
