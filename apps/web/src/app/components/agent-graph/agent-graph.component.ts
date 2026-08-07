import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AgentNode {
  id: string;
  icon: string;
  title: string;
  sub: string;
  status: 'idle' | 'active' | 'complete' | 'error';
}

@Component({
  selector: 'app-agent-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-graph.component.html',
  styleUrl: './agent-graph.component.css'
})
export class AgentGraphComponent implements OnChanges {
  @Input() activeAgentName: string = '';
  @Input() activeAgentStatusText: string = 'Idle - Waiting for incoming recruiter email...';

  nodes: AgentNode[] = [
    { id: 'EmailListenerAgent', icon: '📬', title: '1. Listener', sub: 'Gmail Push', status: 'idle' },
    { id: 'EmailAnalysisAgent', icon: '🧠', title: '2. Analysis', sub: 'LLM Extract', status: 'idle' },
    { id: 'DecisionAgent', icon: '⚖️', title: '3. Decision', sub: 'Policy Rules', status: 'idle' },
    { id: 'ResumeSelectorAgent', icon: '📄', title: '4. Resume', sub: 'Match PDF', status: 'idle' },
    { id: 'ReplyGeneratorAgent', icon: '✍️', title: '5. Reply Gen', sub: 'Craft Response', status: 'idle' },
    { id: 'EmailSenderAgent', icon: '📤', title: '6. Gmail API', sub: 'Send Reply', status: 'idle' },
    { id: 'CalendarAgent', icon: '📅', title: '7. Calendar', sub: 'Book Event', status: 'idle' },
    { id: 'NotifierAgent', icon: '🔔', title: '8. Notifier', sub: 'Slack/Dashboard', status: 'idle' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeAgentName']) {
      this.updateNodeStates(this.activeAgentName);
    }
  }

  private updateNodeStates(activeName: string): void {
    let foundActive = false;
    for (const node of this.nodes) {
      if (node.id === activeName) {
        node.status = 'active';
        foundActive = true;
      } else if (!foundActive && activeName !== '') {
        node.status = 'complete';
      } else {
        node.status = 'idle';
      }
    }
  }
}
