import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Opportunity } from '../../models/opportunity.model';

@Component({
  selector: 'app-opportunity-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './opportunity-list.component.html',
  styleUrl: './opportunity-list.component.css'
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
