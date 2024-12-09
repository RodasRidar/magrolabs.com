import { Component, inject, input } from '@angular/core';
import { StepItemComponent } from './step-item/step-item.component';
import { StepEnum } from '../../models/step.model';
import { SummaryService } from '../../../../shared/services/summary-service.service';

@Component({
  selector: 'app-step',
  standalone: true,
  imports: [StepItemComponent],
  templateUrl: './step.component.html'
})
export class StepComponent {
  private _summaryService = inject(SummaryService)

  stepEnum = StepEnum
  step = input.required<StepEnum>()
  stepChosePlan = false;
  stepUserData = false;
  stepAddress = false;
  stepCardValidation = false;
  stepConfirmation = false;
  flag = ""


  ngOnInit(): void {
    let summary = this._summaryService.getSummary()
    if (summary?.chosePlan?.selection === 'Subscripción de Creatina 250g') {
      this.flag = "Gratis"
    }
    switch (this.step()) {
      case StepEnum.CHOSE_PLAN:
        this.stepChosePlan = true;
        break;
      case StepEnum.USER_DATA:
        this.stepChosePlan = true;
        this.stepUserData = true;
        break;
      case StepEnum.ADDRESS:
        this.stepChosePlan = true;
        this.stepUserData = true;
        this.stepAddress = true;
        break;

      case StepEnum.CARD_VALIDATION:
        this.stepChosePlan = true;
        this.stepUserData = true;
        this.stepAddress = true;
        this.stepCardValidation = true;
        break;

      case StepEnum.CONFIRMATION:
        this.stepChosePlan = true;
        this.stepUserData = true;
        this.stepAddress = true;
        this.stepCardValidation = true;
        this.stepConfirmation = true;
        break;
    }
  }
}
