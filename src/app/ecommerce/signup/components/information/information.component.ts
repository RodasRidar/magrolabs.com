import { Component, input } from '@angular/core';

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [],
  templateUrl: './information.component.html',
  styleUrl: './information.component.css'
})
export class InformationComponent {
  information = input.required<Information[]>()
}
export interface Information {
  name: string
}
