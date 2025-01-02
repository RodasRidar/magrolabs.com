import { CommonModule } from '@angular/common';
import { Component, input, Input } from '@angular/core';

@Component({
  selector: 'ml-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  name = input.required<string>();
  type = input<'primary' | 'secondary'>('primary');
  isDisabled = input(false);
  isProcessing = input(false);

}
