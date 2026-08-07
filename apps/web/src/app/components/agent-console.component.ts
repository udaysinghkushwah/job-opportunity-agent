import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConsoleLogEntry {
  timestamp: string;
  type: 'system' | 'agent' | 'success' | 'error';
  message: string;
}

@Component({
  selector: 'app-agent-console',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card logs-card">
      <div class="card-header">
        <h3>💻 Real-Time Agent Reasoning & SSE Execution Stream</h3>
        <button class="btn btn-secondary btn-sm" (click)="onClearLogs()">Clear Console</button>
      </div>
      <div class="terminal-log-window">
        <div *ngFor="let log of logs" class="log-entry" [ngClass]="log.type">
          <span class="log-time">[{{ log.timestamp }}]</span>
          <span class="log-msg">{{ log.message }}</span>
        </div>
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
      margin-top: 24px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    h3 {
      font-size: 15px;
      font-weight: 600;
      color: #f8fafc;
      margin: 0;
    }
    .btn-secondary {
      background: rgba(51, 65, 85, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
    }
    .terminal-log-window {
      background: #090d16;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 16px;
      height: 180px;
      overflow-y: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
    }
    .log-entry {
      margin-bottom: 6px;
      display: flex;
      gap: 10px;
    }
    .log-time {
      color: #64748b;
    }
    .log-entry.system .log-msg { color: #94a3b8; }
    .log-entry.agent .log-msg { color: #38bdf8; }
    .log-entry.success .log-msg { color: #34d399; }
    .log-entry.error .log-msg { color: #f87171; }
  `]
})
export class AgentConsoleComponent {
  @Input() logs: ConsoleLogEntry[] = [];
  @Output() clearLogsRequested = new EventEmitter<void>();

  onClearLogs(): void {
    this.clearLogsRequested.emit();
  }
}
