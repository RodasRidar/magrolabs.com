import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Summary, SummaryEnum } from '../models/summary.model';

@Injectable({
  providedIn: 'root'
})
export class SummaryServiceService {

  private summaryState = new BehaviorSubject<Summary|null>(null);
  summaryState$ = this.summaryState.asObservable();

  setSummary(address: Summary) {
    this.summaryState.next(address);
  }
}
