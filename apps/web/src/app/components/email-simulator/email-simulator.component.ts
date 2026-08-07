import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailSimulationPayload } from '../../models/opportunity.model';

@Component({
  selector: 'app-email-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-simulator.component.html',
  styleUrl: './email-simulator.component.css'
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
