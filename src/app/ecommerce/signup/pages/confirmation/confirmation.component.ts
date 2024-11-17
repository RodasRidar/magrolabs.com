import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { StepComponent } from '../../components/step/step.component';
import { StepEnum } from '../../models/step.model';
import { Information, InformationComponent } from '../../components/information/information.component';
import { RouterLink } from '@angular/router';
import { SummaryService } from '../../../../shared/services/summary-service.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [StepComponent, ButtonComponent, CommonModule, InformationComponent, RouterLink],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent {
  private _summaryService = inject(SummaryService)

  stepEnum = StepEnum;
  clientName = '';
  informationList: Information[] = [
    { name: 'Tu periodo de reflexión comienza despues de recibir tu creatina.' },
    { name: 'Te avisaremos cuando finalice tu periodo de reflexión.' },
    { name: 'Entrega estimada de la creatina gratis: 6 a 9 días hábiles.' },
  ]

  ngOnInit(): void {
    this.clientName = this._summaryService.getSummary()?.userData?.nombre ?? '';
  }
}
