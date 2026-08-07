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
  templateUrl: './agent-console.component.html',
  styleUrl: './agent-console.component.css'
})
export class AgentConsoleComponent {
  @Input() logs: ConsoleLogEntry[] = [];
  @Output() clearLogsRequested = new EventEmitter<void>();

  onClearLogs(): void {
    this.clearLogsRequested.emit();
  }
}
