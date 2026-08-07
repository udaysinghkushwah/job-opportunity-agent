import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailSimulationPayload } from '../models/opportunity.model';

@Component({
  selector: 'app-email-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="card simulator-card">
      <div class="card-header">
        <h3>📩 Recruiter Email Simulator</h3>
        <span class="badge">Test Workbench</span>
      </div>
      <div class="preset-buttons">
        <button class="preset-btn" (click)="loadPreset('backend')">💻 Node.js Lead</button>
        <button class="preset-btn" (click)="loadPreset('ai')">🤖 AI Engineer</button>
        <button class="preset-btn" (click)="loadPreset('healthcare')">🏥 HealthTech</button>
        <button class="preset-btn danger" (click)="loadPreset('spam')">🚫 Spam Offer</button>
      </div>
      <form (submit)="onSubmit($event)">
        <div class="form-group">
          <label>From (Recruiter Email):</label>
          <input type="email" [(ngModel)]="from" name="from" required placeholder="reecha@abc-tech.com">
        </div>
        <div class="form-group">
          <label>Subject:</label>
          <input type="text" [(ngModel)]="subject" name="subject" required placeholder="Interview Schedule - Senior Node.js Engineer">
        </div>
        <div class="form-group">
          <label>Email Body:</label>
          <textarea [(ngModel)]="body" name="body" rows="4" required placeholder="Hi Uday, We reviewed your profile..."></textarea>
        </div>
        <button type="submit" class="btn btn-success full-width" [disabled]="loading">
          {{ loading ? '⏳ Processing Multi-Agent Pipeline...' : '🚀 Execute Multi-Agent Pipeline' }}
        </button>
      </form>
    </section>
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
    .badge {
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }
    .preset-buttons {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .preset-btn {
      background: rgba(51, 65, 85, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .preset-btn:hover {
      background: rgba(99, 102, 241, 0.25);
      color: #f8fafc;
      border-color: #6366f1;
    }
    .preset-btn.danger:hover {
      background: rgba(239, 68, 68, 0.25);
      color: #f8fafc;
      border-color: #ef4444;
    }
    .form-group {
      margin-bottom: 14px;
    }
    label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: #94a3b8;
      margin-bottom: 6px;
    }
    input, textarea {
      width: 100%;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 10px 12px;
      color: #f8fafc;
      font-family: inherit;
      font-size: 13px;
      box-sizing: border-box;
    }
    input:focus, textarea:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
    }
    .full-width {
      width: 100%;
    }
    .btn-success {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      border: none;
      padding: 12px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      transition: all 0.2s;
    }
    .btn-success:hover:not(:disabled) {
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.5);
      transform: translateY(-1px);
    }
    .btn-success:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class EmailSimulatorComponent {
  from: string = 'reecha@abc-tech.com';
  subject: string = 'Interview Schedule - Senior Node.js Engineer';
  body: string = 'Hi Uday,\n\nWe reviewed your profile for Senior Node.js Engineer at ABC Technologies. Please share your updated resume and confirm availability for tomorrow 3 PM.\n\nBest,\nReecha';
  loading: boolean = false;

  @Output() simulateSubmitted = new EventEmitter<EmailSimulationPayload>();

  loadPreset(type: 'backend' | 'ai' | 'healthcare' | 'spam'): void {
    if (type === 'backend') {
      this.from = 'reecha@abc-tech.com';
      this.subject = 'Interview Schedule - Senior Node.js Engineer';
      this.body = 'Hi Uday, We reviewed your profile for Senior Node.js Engineer at ABC Technologies. Please share your updated resume and confirm availability for tomorrow 3 PM.';
    } else if (type === 'ai') {
      this.from = 'recruiter@ai-frontier.io';
      this.subject = 'Senior AI Engineer Position';
      this.body = 'Hi Uday, We saw your work on Agentic AI and LLMs. We would love to have you join AI Frontier as Senior AI Engineer. Please attach your updated resume.';
    } else if (type === 'healthcare') {
      this.from = 'careers@healthtech-solutions.org';
      this.subject = 'HealthTech Software Systems Lead';
      this.body = 'Hi Uday, Your experience in HIPAA-compliant systems and FHIR integration fits our Senior Healthcare Lead role. Please send your updated resume.';
    } else if (type === 'spam') {
      this.from = 'marketing@crypto-fast-loans.net';
      this.subject = 'CLAIM $5000 CRYPTO REWARD IMMEDIATELY - UNSUBSCRIBE';
      this.body = 'Click here to claim instant loan. Unsubscribe if not interested.';
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.from || !this.subject || !this.body) return;

    this.loading = true;
    this.simulateSubmitted.emit({
      from: this.from,
      subject: this.subject,
      body: this.body
    });

    setTimeout(() => {
      this.loading = false;
    }, 4000);
  }
}
