import { Component, inject } from '@angular/core';
import { AddressSummary, ChosePlanSummary, Summary, UserDataSummary } from '../../../../shared/models/summary.model';
import { SummaryService } from '../../../../shared/services/summary-service.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html'
})
export class SummaryComponent {
  _summaryService = inject(SummaryService);
  _router = inject(Router);

  summaryState$ = this._summaryService.summaryState$;
  summary: Summary = <Summary>{}

  ngOnInit(): void {
    this._summaryService.setSummary(this.summary);
  }

  changeChoose() {
    this._summaryService.setChoosePlan(<ChosePlanSummary>{})
    this._router.navigate(['registro/'])
  }

  changeUserData() {
    this._summaryService.setUserData(<UserDataSummary>{})
    this._router.navigate(['/registro/crear-cuenta'])
  }

  changeAddress() {
    this._summaryService.setAddress(<AddressSummary>{})
    this._router.navigate(['/registro/direccion'])
  }
}

