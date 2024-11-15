import { Component, output } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { ChosePlanSummary } from '../../../../shared/models/summary.model';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css'
})
export class PricingComponent {


  chosePlan = output<ChosePlanSummary>()
  
  chooseYearly() {
    this.chosePlan.emit({    
      selection: 'Creatina 3kg' ,
      descriptionOne: 'Monohidratada 100%',
      descriptionTwo: 'Plan anual de S/399'
    })
  }

  chooseMonthly() {
    this.chosePlan.emit({    
      selection: 'Creatina 250g' ,
      descriptionOne: 'Monohidratada 100%',
      descriptionTwo: 'Plan mensual de S/39'
    })
  }
}
