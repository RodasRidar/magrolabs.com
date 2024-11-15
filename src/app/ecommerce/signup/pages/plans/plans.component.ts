import { Component, inject } from "@angular/core";
import { PricingComponent } from "../../components/pricing/pricing.component";
import { StepComponent } from "../../components/step/step.component";
import { StepEnum } from "../../models/step.model";
import { Information, InformationComponent } from "../../components/information/information.component";
import { SummaryService } from "../../../../shared/services/summary-service.service";
import { ChosePlanSummary } from "../../../../shared/models/summary.model";
import { Router } from "@angular/router";


@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [StepComponent, PricingComponent, InformationComponent],
  templateUrl: './plans.component.html',
})
export class PlansComponent {
  private _summaryService = inject(SummaryService);
  private _router = inject(Router);

  stepEnum = StepEnum
  informationList: Information[] = [
    {
      name: 'Recibe 10 soles de crédito de compra cada mes.'
    },
    {
      name: 'Acumula automáticamente, sin costo adicional.'
    },
    {
      name: 'Canjea tus créditos por artículos exclusivos.'
    }
  ]

  chosePlan(chosePlan: ChosePlanSummary) {
    this._summaryService.setSummary({
      chosePlan: chosePlan
    })
    this._router.navigate(['registro/crear-cuenta'])
  }

}
