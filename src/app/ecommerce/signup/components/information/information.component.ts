import { Component, input } from '@angular/core';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

@Component({
    selector: 'app-information',
    imports: [IconComponent],
    templateUrl: './information.component.html',
    styleUrl: './information.component.css'
})
export class InformationComponent {
  information = input.required<Information[]>()
}
export interface Information {
  name: string
}
