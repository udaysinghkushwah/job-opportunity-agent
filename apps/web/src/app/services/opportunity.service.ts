import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Opportunity, EmailSimulationPayload } from '../models/opportunity.model';

@Injectable({
  providedIn: 'root'
})
export class OpportunityService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  getOpportunities(): Observable<Opportunity[]> {
    return this.http.get<Opportunity[]>(`${this.baseUrl}/opportunities`);
  }

  simulateEmail(payload: EmailSimulationPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/emails/simulate`, payload);
  }

  fetchInbox(): Observable<any> {
    return this.http.post(`${this.baseUrl}/emails/fetch-inbox`, {});
  }
}
