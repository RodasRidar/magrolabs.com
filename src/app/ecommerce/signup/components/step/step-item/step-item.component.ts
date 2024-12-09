import { Component, input, Input, InputSignal } from '@angular/core';
import { StepEnum } from '../../../models/step.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-item.component.html',
  styleUrls: ['./step-item.component.css'],
})
export class StepItemComponent {
  StepEnum = StepEnum;
  flag : InputSignal<string> = input("");
  step = input.required<StepEnum>();
  isCompleted = input.required<boolean>();

  get bgColor() : string  { 
    return this.isCompleted() ? 'bg-gray-900' : 'bg-gray-300'
  }
  get iconColor() : string  { 
    return this.isCompleted() ? '#ffffff' : '#828282'
  }
}
