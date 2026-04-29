import { Component, input } from '@angular/core';

@Component({
  selector: 'ml-form-field',
  standalone: true,
  imports: [],
  templateUrl: './form-field.component.html',
})
export class FormFieldComponent {
  label = input.required<string>();
  inputId = input<string>('');
  required = input(false);
  errors = input<string[]>([]);
}
