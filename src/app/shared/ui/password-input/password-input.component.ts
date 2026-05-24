import { Component, computed, forwardRef, input, signal, untracked } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextPasswordId = 0;

@Component({
    selector: 'ml-password-input',
    imports: [],
    host: { class: 'block' },
    templateUrl: './password-input.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PasswordInputComponent),
            multi: true,
        },
    ]
})
export class PasswordInputComponent implements ControlValueAccessor {
  label = input.required<string>();
  inputId = input<string>('');
  required = input(false);
  errors = input<string[]>([]);
  showStrength = input(false);
  placeholder = input<string>('');

  protected readonly uid = `ml-password-input-${++nextPasswordId}`;
  protected readonly _id = computed(() => this.inputId() || this.uid);
  protected readonly hasErrors = computed(() => this.errors().length > 0);
  protected readonly value = signal<string>('');
  protected readonly isDisabled = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly inputType = computed(() => (this.showPassword() ? 'text' : 'password'));

  protected readonly strengthLevel = computed(() => {
    const val = this.value();
    if (!val) return 0;
    const hasMinLength = val.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    const hasSpecial = /[^a-zA-Z0-9]/.test(val);
    if (hasMinLength && hasLetter && hasNumber && hasSpecial) return 3;
    if (hasMinLength) return 2;
    return 1;
  });

  protected readonly strengthBars = computed(() => {
    const level = this.strengthLevel();
    const activeClass =
      level === 1 ? 'bg-red-500' : level === 2 ? 'bg-amber-400' : 'bg-emerald-500';
    return [1, 2, 3].map((i) => 'h-1 flex-1 rounded-full transition-colors duration-300 ' + (i <= level ? activeClass : 'bg-bg-alt'));
  });

  protected readonly strengthLabel = computed(() => {
    const labels = ['', 'Débil', 'Media', 'Fuerte'];
    return labels[this.strengthLevel()];
  });

  protected readonly strengthLabelClass = computed(() => {
    const level = this.strengthLevel();
    if (level === 1) return 'text-red-500';
    if (level === 2) return 'text-amber-500';
    if (level === 3) return 'text-emerald-600';
    return '';
  });

  protected readonly inputClass = computed(() => {
    const base =
      'block w-full rounded-md border-0 py-1.5 pr-10 text-fg shadow-sm sm:text-sm placeholder:text-fg-subtle transition-shadow focus:outline-none';

    const ring = this.hasErrors()
      ? 'ring-2 ring-inset ring-red-500 focus:ring-2 focus:ring-inset focus:ring-red-600'
      : 'ring-1 ring-inset ring-border-strong focus:ring-2 focus:ring-inset focus:ring-primary';

    const stateClass = this.isDisabled()
      ? 'bg-bg-alt cursor-not-allowed opacity-60'
      : 'bg-bg';

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
