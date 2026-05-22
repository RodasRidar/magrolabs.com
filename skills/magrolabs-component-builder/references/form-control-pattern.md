# Form Control Pattern (ControlValueAccessor)

Any UI primitive that participates in Angular forms (text input, select, textarea, checkbox, radio, password input, date picker, etc.) must implement `ControlValueAccessor` so it works with both `[(ngModel)]` and `[formControl]` / `formControlName`.

The canonical example in this codebase is `src/app/shared/ui/input/input.component.ts`. Read it before writing a new form control.

## Required boilerplate

```ts
import { Component, computed, forwardRef, input, signal, untracked } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0; // module-scoped counter for unique ids

@Component({
  selector: 'ml-foo',
  standalone: true,
  host: { class: 'block' },
  templateUrl: './foo.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FooComponent),
      multi: true,
    },
  ],
})
export class FooComponent implements ControlValueAccessor {
  label = input.required<string>();
  inputId = input<string>('');
  required = input(false);
  errors = input<string[]>([]);

  protected readonly uid = `ml-foo-${++nextId}`;
  protected readonly _id = computed(() => this.inputId() || this.uid);
  protected readonly hasErrors = computed(() => this.errors().length > 0);
  protected readonly value = signal<string>('');
  protected readonly isDisabled = signal(false);

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
}
```

## Why each piece exists

- **`forwardRef` in the provider** — the component class is referenced before it's defined (TS hoisting limitation). `forwardRef(() => FooComponent)` defers the lookup.
- **`multi: true`** — `NG_VALUE_ACCESSOR` is a multi-provider token; omitting this breaks form binding.
- **`uid` counter** — guarantees a unique `id` on the native input so `<label for="...">` always matches, even with multiple instances on the page.
- **`untracked` in `setDisabledState`** — Angular calls this from outside the component's reactive context; without `untracked` you can get write-after-read warnings.
- **Separate `value` signal + `onChange` callback** — the signal drives the template; the callback notifies Angular forms. Keep them in sync inside `onInput`.

## Error display

Errors are passed in as an `input<string[]>([])` from the parent (which converts `FormControl.errors` to a human-readable list). The primitive itself does not interpret Angular validators — it just renders strings.

Standard error markup:

```html
@if (hasErrors()) {
  <div class="mt-1 px-1">
    @for (error of errors(); track $index) {
      <p class="text-xs text-red-500">{{ error }}</p>
    }
  </div>
}
```

And the input ring class swaps based on `hasErrors()`:

```ts
const ring = this.hasErrors()
  ? 'ring-2 ring-inset ring-red-500 focus:ring-2 focus:ring-inset focus:ring-red-600'
  : 'ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary';
```

Always use `ring-primary` (not `ring-blue-500` or similar) on focus — that's the brand color.

## Testing form controls

Don't test the component in isolation — wrap it in a `TestHostComponent` with a `FormControl` so you exercise the full ControlValueAccessor contract. Copy the structure from `src/app/shared/ui/input/input.component.spec.ts`. Cover at minimum:

- `writeValue` propagates to the DOM
- DOM `input` event propagates to the `FormControl`
- `blur` marks the control as touched
- `disable()` / `enable()` toggle the native element
- Error class swap when `errors` input is non-empty
