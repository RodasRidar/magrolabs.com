import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AddressSummary, ChosePlanSummary, Summary, SummaryEnum, UserDataSummary } from '../models/summary.model';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class SummaryService {
  private _cookieService = inject(CookieService);

  private cookieName = 'summary';
  private summaryState = new BehaviorSubject<Summary | null>(this.getSummaryFromCookies());
  summaryState$ = this.summaryState.asObservable();

  setSummary(summary: Summary) {
    this.summaryState.next(summary);
    this.saveSummaryToCookies(summary);
  }

  setChoosePlan(chosePlan: ChosePlanSummary) {
    let summary = this.summaryState.value;
    if (summary) {
      summary.chosePlan = chosePlan;
      this.summaryState.next(summary);
      this.saveSummaryToCookies(summary);
    }
  }

  setUserData(userData: UserDataSummary) {
    let summary = this.summaryState.value;
    if (summary) {
      summary.userData = userData;
      this.summaryState.next(summary);
      this.saveSummaryToCookies(summary);
    }
  }

  setAddress(address: AddressSummary) {
    let summary = this.summaryState.value;
    if (summary) {
      summary.address = address;
      this.summaryState.next(summary);
      this.saveSummaryToCookies(summary);
    }
  }

  getSummary(): Summary | null {
    return this.summaryState.value;
  }

  private saveSummaryToCookies(summary: Summary) {
    const json = JSON.stringify(summary);
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 6);
    this._cookieService.set(this.cookieName, json, { path: '/', expires: expirationDate, sameSite: 'Strict' });
  }

  private getSummaryFromCookies(): Summary {
    if (this._cookieService.check(this.cookieName)) {
      const json = this._cookieService.get(this.cookieName);
      try {
        return JSON.parse(json) as Summary;
      } catch (error) {
        console.error('Failed to parse summary from cookies:', error);
        return <Summary>{};
      }
    }
    return <Summary>{};
  }

  clearSummary() {
    this.summaryState.next(null);
    this._cookieService.delete(this.cookieName, '/');
  }
}