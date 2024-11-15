import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AddressSummary, ChosePlanSummary, Summary, SummaryEnum, UserDataSummary } from '../models/summary.model';

@Injectable({
  providedIn: 'root'
})
export class SummaryService {

  private summaryState = new BehaviorSubject<Summary|null>(null);
  summaryState$ = this.summaryState.asObservable();

  setSummary(summary: Summary) {
    this.summaryState.next(summary);
  }

  setChoosePlan(chosePlan: ChosePlanSummary) {
    let summary = this.summaryState.value;
    if(summary){
      summary.chosePlan = chosePlan;
      this.summaryState.next(summary);
    }
  }

  setUserData(userData: UserDataSummary) {
    let summary = this.summaryState.value;
    if(summary){
      summary.userData = userData;
      this.summaryState.next(summary);
    }
  }

  setAddress(address: AddressSummary) {
    let summary = this.summaryState.value;
    if(summary){
      summary.address = address;
      this.summaryState.next(summary);
    }
  }
}
