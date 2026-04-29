import { Component, computed, forwardRef, input, signal, untracked } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'tel' | 'number' | 'date' | 'search';

let nextId = 0;

@Component({
  selector: 'ml-input',
  standalone: true,
  imports: [],
  host: { class: 'block' },
  templateUrl: './input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  label = input.required<string>();
  inputType = input<InputType>('text');
  inputId = input<string>('');
  placeholder = input<string>('');
  autocomplete = input<string | undefined>(undefined);
  required = input(false);
  readonly = input(false);
  maxLength = input<number | undefined>(undefined);
  errors = input<string[]>([]);

  protected readonly uid = `ml-input-${++nextId}`;
  protected readonly _id = computed(() => this.inputId() || this.uid);
  protected readonly hasErrors = computed(() => this.errors().length > 0);
  protected readonly value = signal<string>('');
  protected readonly isDisabled = signal(false);

  protected readonly inputClass = computed(() => {
    const base =
      'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm sm:text-sm placeholder:text-gray-400 transition-shadow focus:outline-none';

    const ring = this.hasErrors()
      ? 'ring-2 ring-inset ring-red-500 focus:ring-2 focus:ring-inset focus:ring-red-600'
      : 'ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary';

    const stateClass = this.isDisabled()
      ? 'bg-gray-100 cursor-not-allowed opacity-60'
      : this.readonly()
        ? 'bg-gray-50 cursor-default'
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
    let value = (event.target as HTMLInputElement).value;
    const max = this.maxLength();
    if (max !== undefined && value.length > max) {
      value = value.slice(0, max);
      (event.target as HTMLInputElement).value = value;
    }
    this.value.set(value);
    this.onChange(value);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
