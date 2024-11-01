import { Component, Input } from '@angular/core';

@Component({
  selector: 'ml-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  @Input() name = '';
  @Input() type:'primary' | 'secondary' = 'primary';
}
