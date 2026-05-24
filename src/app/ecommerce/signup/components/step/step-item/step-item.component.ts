import { Component, input, InputSignal } from '@angular/core';
import { StepEnum } from '../../../models/step.model';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';

@Component({
    selector: 'app-step-item',
    imports: [CommonModule, IconComponent],
    templateUrl: './step-item.component.html',
    styleUrls: ['./step-item.component.css']
})
export class StepItemComponent {
  StepEnum = StepEnum;
  flag : InputSignal<string> = input("");
  step = input.required<StepEnum>();
  isCurrent = input.required<boolean>();
  isCompleted = input.required<boolean>();

  get bgColor() : string  {
    return (this.isCompleted() || this.isCurrent()) ? 'bg-fg' : 'bg-border-strong';
  }
}
