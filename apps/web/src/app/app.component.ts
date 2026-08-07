import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { OpportunityService } from './services/opportunity.service';
import { AgentStreamService } from './services/agent-stream.service';
import { Opportunity, EmailSimulationPayload, AgentStepEvent } from './models/opportunity.model';
import { HeaderComponent } from './components/header.component';
import { AgentGraphComponent } from './components/agent-graph.component';
import { EmailSimulatorComponent } from './components/email-simulator.component';
import { OpportunityListComponent } from './components/opportunity-list.component';
import { AgentConsoleComponent, ConsoleLogEntry } from './components/agent-console.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    AgentGraphComponent,
    EmailSimulatorComponent,
    OpportunityListComponent,
    AgentConsoleComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  opportunities: Opportunity[] = [];
  activeAgentName: string = '';
  activeAgentStatusText: string = 'Idle - Waiting for incoming email...';
  logs: ConsoleLogEntry[] = [
    {
      timestamp: new Date().toLocaleTimeString(),
      type: 'system',
      message: 'Fresh Angular Standalone Multi-Agent Dashboard initialized. Connected to SSE Telemetry Stream.'
    }
  ];

  private streamSub!: Subscription;

  constructor(
    private oppService: OpportunityService,
    private streamService: AgentStreamService
  ) {}

  ngOnInit(): void {
    this.loadOpportunities();
    this.initSseStream();
  }

  ngOnDestroy(): void {
    if (this.streamSub) {
      this.streamSub.unsubscribe();
    }
  }

  loadOpportunities(): void {
    this.oppService.getOpportunities().subscribe({
      next: (opps) => {
        this.opportunities = Array.isArray(opps) ? opps : [];
      },
      error: (err) => {
        console.error('Failed to load opportunities from database:', err);
      }
    });
  }

  handleSimulateSubmitted(payload: EmailSimulationPayload): void {
    this.addLog('system', `Submitting email simulation from ${payload.from}...`);
    this.oppService.simulateEmail(payload).subscribe({
      next: (res) => {
        this.addLog('success', `Pipeline execution started. ${res.message || ''}`);
      },
      error: (err) => {
        this.addLog('error', `Failed to execute simulation: ${err.message || 'Unknown error'}`);
      }
    });
  }

  handleFetchInboxRequested(): void {
    this.addLog('system', 'Triggering live Gmail inbox fetch...');
    this.oppService.fetchInbox().subscribe({
      next: (res) => {
        this.addLog('success', `Inbox fetch complete: ${res.message || 'Inbox polled.'}`);
        this.loadOpportunities();
      },
      error: (err) => {
        this.addLog('error', `Inbox fetch error: ${err.message}`);
      }
    });
  }

  handleClearLogsRequested(): void {
    this.logs = [];
  }

  private initSseStream(): void {
    this.streamSub = this.streamService.getStream().subscribe({
      next: (event: AgentStepEvent) => {
        if (event.agentName) {
          this.activeAgentName = event.agentName;
          this.activeAgentStatusText = `[Active Node]: ${event.agentName} ${event.message ? '- ' + event.message : ''}`;
        }

        if (event.message) {
          const type = event.type === 'pipeline_complete' ? 'success' : event.type === 'pipeline_error' ? 'error' : 'agent';
          this.addLog(type, `[${event.agentName || 'Pipeline'}] ${event.message}`);
        }

        if (event.type === 'pipeline_complete') {
          setTimeout(() => {
            this.activeAgentName = '';
            this.activeAgentStatusText = 'Pipeline Complete - Waiting for next email...';
            this.loadOpportunities();
          }, 1500);
        }
      }
    });
  }

  private addLog(type: 'system' | 'agent' | 'success' | 'error', message: string): void {
    this.logs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    });
    if (this.logs.length > 100) {
      this.logs.pop();
    }
  }
}
