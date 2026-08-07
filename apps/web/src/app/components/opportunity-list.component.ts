import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Opportunity } from '../models/opportunity.model';

@Component({
  selector: 'app-opportunity-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card opps-card">
      <div class="card-header">
        <h3>🗄️ Opportunity Pipeline (MongoDB Memory)</h3>
        <button class="btn btn-secondary btn-sm" (click)="onRefresh()">🔄 Refresh</button>
      </div>
      <div class="opps-list">
        <div *ngIf="opportunities.length === 0" class="empty-state">
          No opportunities found in MongoDB. Execute a recruiter email simulation to start!
        </div>
        <div *ngFor="let opp of opportunities" class="opp-item" (click)="onSelectOpportunity(opp)">
          <div class="opp-main">
            <div class="opp-company">{{ opp.company }}</div>
            <div class="opp-role">{{ opp.role }}</div>
            <div class="opp-recruiter">Recruiter: {{ opp.recruiterName }}</div>
          </div>
          <div class="opp-meta">
            <span class="status-pill" [ngClass]="opp.status.toLowerCase()">{{ opp.status }}</span>
            <span *ngIf="opp.resumeVersion" class="resume-tag">📄 {{ opp.resumeVersion }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Detail Inspection Modal -->
    <div class="modal-overlay" *ngIf="selectedOpp" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Opportunity Detail: {{ selectedOpp.company }}</h3>
          <button class="close-btn" (click)="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p><strong>Opportunity ID:</strong> {{ selectedOpp.opportunityId }}</p>
          <p><strong>Recruiter Name:</strong> {{ selectedOpp.recruiterName }}</p>
          <p><strong>Role Title:</strong> {{ selectedOpp.role }}</p>
          <p><strong>Status:</strong> <span class="status-pill" [ngClass]="selectedOpp.status.toLowerCase()">{{ selectedOpp.status }}</span></p>
          <p *ngIf="selectedOpp.resumeVersion"><strong>Selected Resume:</strong> {{ selectedOpp.resumeVersion }}</p>
          <p *ngIf="selectedOpp.calendarEventUrl">
            <strong>Calendar Slot:</strong> <a [href]="selectedOpp.calendarEventUrl" target="_blank" class="link">View Google Calendar Event</a>
          </p>
          <div *ngIf="selectedOpp.generatedReply" class="reply-box">
            <div class="reply-header">Generated Auto-Reply Content:</div>
            <pre>{{ selectedOpp.generatedReply }}</pre>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 20px 24px;
      height: 100%;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
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
    .opps-list {
      max-height: 380px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .empty-state {
      padding: 24px;
      text-align: center;
      color: #64748b;
      font-size: 13px;
    }
    .opp-item {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .opp-item:hover {
      border-color: #6366f1;
      background: rgba(99, 102, 241, 0.1);
      transform: translateX(4px);
    }
    .opp-company {
      font-weight: 700;
      color: #f8fafc;
      font-size: 14px;
    }
    .opp-role {
      font-size: 12px;
      color: #818cf8;
    }
    .opp-recruiter {
      font-size: 11px;
      color: #64748b;
    }
    .opp-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    .status-pill {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 10px;
      text-transform: uppercase;
    }
    .status-pill.interview_scheduled {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }
    .status-pill.auto_replied {
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
    }
    .status-pill.rejected {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
    .resume-tag {
      font-size: 10px;
      color: #94a3b8;
      font-family: 'JetBrains Mono', monospace;
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      width: 90%;
      max-width: 550px;
      padding: 24px;
      color: #f8fafc;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .close-btn {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 24px;
      cursor: pointer;
    }
    .link {
      color: #818cf8;
      text-decoration: underline;
    }
    .reply-box {
      margin-top: 14px;
      background: #0f172a;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .reply-header {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 6px;
    }
    pre {
      margin: 0;
      white-space: pre-wrap;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #a7f3d0;
    }
  `]
})
export class OpportunityListComponent {
  @Input() opportunities: Opportunity[] = [];
  @Output() refreshRequested = new EventEmitter<void>();

  selectedOpp: Opportunity | null = null;

  onRefresh(): void {
    this.refreshRequested.emit();
  }

  onSelectOpportunity(opp: Opportunity): void {
    this.selectedOpp = opp;
  }

  closeModal(): void {
    this.selectedOpp = null;
  }
}
