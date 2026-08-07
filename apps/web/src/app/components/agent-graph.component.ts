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
  template: `
    <section class="card graph-card">
      <div class="card-header">
        <h2>⚡ Live Multi-Agent Execution Graph</h2>
        <span class="graph-status">{{ activeAgentStatusText }}</span>
      </div>
      <div class="pipeline-graph">
        <ng-container *ngFor="let node of nodes; let last = last">
          <div class="node" [ngClass]="node.status">
            <div class="node-icon">{{ node.icon }}</div>
            <div class="node-title">{{ node.title }}</div>
            <div class="node-sub">{{ node.sub }}</div>
          </div>
          <div *ngIf="!last" class="connector" [class.active]="node.status === 'active' || node.status === 'complete'"></div>
        </ng-container>
      </div>
    </section>
  `,
  styles: [`
    .card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 20px 24px;
      margin-bottom: 24px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    h2 {
      font-size: 16px;
      font-weight: 600;
      color: #f8fafc;
      margin: 0;
    }
    .graph-status {
      font-size: 13px;
      color: #a855f7;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
    }
    .pipeline-graph {
      display: flex;
      align-items: center;
      justify-content: space-between;
      overflow-x: auto;
      padding: 12px 0;
    }
    .node {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 14px 18px;
      text-align: center;
      min-width: 110px;
      transition: all 0.3s ease;
    }
    .node-icon {
      font-size: 24px;
      margin-bottom: 6px;
    }
    .node-title {
      font-size: 12px;
      font-weight: 600;
      color: #cbd5e1;
    }
    .node-sub {
      font-size: 10px;
      color: #64748b;
    }
    .node.active {
      border-color: #a855f7;
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
      transform: scale(1.06);
      background: rgba(168, 85, 247, 0.15);
    }
    .node.active .node-title {
      color: #e9d5ff;
    }
    .node.complete {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }
    .node.complete .node-title {
      color: #a7f3d0;
    }
    .connector {
      flex: 1;
      height: 2px;
      background: rgba(255, 255, 255, 0.1);
      min-width: 16px;
      margin: 0 4px;
      transition: background 0.3s ease;
    }
    .connector.active {
      background: linear-gradient(90deg, #10b981, #a855f7);
    }
  `]
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
