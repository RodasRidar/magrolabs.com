import { Component, output } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { ChosePlanSummary } from '../../../../shared/models/summary.model';
import { environment } from '../../../../../environments/env';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css'
})
export class PricingComponent {


  ENV = environment
  chosePlan = output<ChosePlanSummary>()
  
  chooseYearly() {
    this.chosePlan.emit({    
      selection: 'Creatina 3kg' ,
      descriptionOne: 'Monohidratada 100%',
      descriptionTwo: 'Plan anual de S/399',
      quantity: 1
    })
  }

  chooseMonthly() {
    this.chosePlan.emit({    
      selection: 'Creatina 250g' ,
      descriptionOne: 'Monohidratada 100%',
      descriptionTwo: 'Plan mensual de S/39',
      quantity: 1
    })
  }
}
