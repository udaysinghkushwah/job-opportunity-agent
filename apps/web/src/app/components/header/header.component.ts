import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Output() fetchInboxRequested = new EventEmitter<void>();

  onFetchInbox(): void {
    this.fetchInboxRequested.emit();
  }
}
