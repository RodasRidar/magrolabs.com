import { Component } from "@angular/core";
import { PricingComponent } from "../../components/pricing/pricing.component";
import { StepComponent } from "../../components/step/step.component";
import { StepEnum } from "../../models/step.model";
import { Information, InformationComponent } from "../../components/information/information.component";


@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [StepComponent, PricingComponent, InformationComponent],
  templateUrl: './plans.component.html',
})
export class PlansComponent {
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

}
