import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { StepComponent } from '../../components/step/step.component';
import { StepEnum } from '../../models/step.model';
import { Information, InformationComponent } from '../../components/information/information.component';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [StepComponent, ButtonComponent, CommonModule, InformationComponent],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent {
  stepEnum = StepEnum;
  clientName = 'John Doe';
  informationList: Information[] = [
    { name: 'Tu periodo de reflexión comienza despues de recibir tu creatina.' },
    { name: 'Te avisaremos cuando finalice tu periodo de reflexión.' },
    { name: 'Entrega estimada de la creatina gratis: 6 a 9 días hábiles' },
  ]
}
