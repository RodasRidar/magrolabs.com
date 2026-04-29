import { Component, computed, forwardRef, input, signal, untracked } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextPasswordId = 0;

@Component({
  selector: 'ml-password-input',
  standalone: true,
  imports: [],
  host: { class: 'block' },
  templateUrl: './password-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInputComponent),
      multi: true,
    },
  ],
})
export class PasswordInputComponent implements ControlValueAccessor {
  label = input.required<string>();
  inputId = input<string>('');
  required = input(false);
  errors = input<string[]>([]);

  protected readonly uid = `ml-password-input-${++nextPasswordId}`;
  protected readonly _id = computed(() => this.inputId() || this.uid);
  protected readonly hasErrors = computed(() => this.errors().length > 0);
  protected readonly value = signal<string>('');
  protected readonly isDisabled = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly inputType = computed(() => (this.showPassword() ? 'text' : 'password'));

  protected readonly inputClass = computed(() => {
    const base =
      'block w-full rounded-md border-0 py-1.5 pr-10 text-gray-900 shadow-sm sm:text-sm placeholder:text-gray-400 transition-shadow focus:outline-none';

    const ring = this.hasErrors()
      ? 'ring-2 ring-inset ring-red-500 focus:ring-2 focus:ring-inset focus:ring-red-600'
      : 'ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary';

    const stateClass = this.isDisabled()
      ? 'bg-gray-100 cursor-not-allowed opacity-60'
      : 'bg-white';

    return `${base} ${ring} ${stateClass}`;
  });

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    untracked(() => this.isDisabled.set(isDisabled));
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  protected toggleVisibility(): void {
    this.showPassword.update((v) => !v);
  }
}
