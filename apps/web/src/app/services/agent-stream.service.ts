import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AgentStepEvent } from '../models/opportunity.model';

@Injectable({
  providedIn: 'root'
})
export class AgentStreamService {
  private eventSource!: EventSource;
  private streamSubject = new Subject<AgentStepEvent>();

  constructor(private zone: NgZone) {
    this.connect();
  }

  public getStream(): Observable<AgentStepEvent> {
    return this.streamSubject.asObservable();
  }

  private connect(): void {
    this.eventSource = new EventSource('/api/events/stream');

    this.eventSource.onmessage = (event) => {
      this.zone.run(() => {
        try {
          const parsed: AgentStepEvent = JSON.parse(event.data);
          this.streamSubject.next(parsed);
        } catch (e) {
          console.error('Failed to parse SSE payload:', e);
        }
      });
    };

    this.eventSource.onerror = (error) => {
      console.warn('SSE EventSource disconnected, reconnecting in 5s...', error);
      this.eventSource.close();
      setTimeout(() => this.connect(), 5000);
    };
  }
}
