import { Component } from "@angular/core";
import { PricingComponent } from "../../components/pricing/pricing.component";
import { StepComponent } from "../../components/step/step.component";
import { StepEnum } from "../../models/step.model";


@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [StepComponent,PricingComponent],
  templateUrl: './plans.component.html',
})
export class PlansComponent {
  stepEnum = StepEnum
}
