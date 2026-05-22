# UI Primitive Pattern

Lives in `src/app/shared/ui/<name>/`. Selector `ml-<name>`. Standalone. Signal-based. Tailwind-styled. No NgModule, no constructor injection.

## Decision: inline template vs separate file

| Use inline `template: \`...\`` | Use `templateUrl: './x.component.html'` |
|---|---|
| ≤ ~15 lines of markup | Larger markup, multiple variants in template |
| Single root element | Multiple sections, complex `@if`/`@for` blocks |
| Examples: `badge`, `card`, `spinner`, `page-header`, `alert`, `breadcrumb`, `action-card` | Examples: `button`, `input`, `select`, `modal` |

When in doubt, inline. The team's bias is toward inline for primitives because variants live more cleanly next to the class definition.

## Minimal inline-template primitive

```ts
import { Component, computed, input } from '@angular/core';

export type FooTone = 'neutral' | 'primary' | 'danger';

@Component({
  selector: 'ml-foo',
  standalone: true,
  host: { class: 'block' },
  template: `
    <div [class]="containerClass()">
      <ng-content />
    </div>
  `,
})
export class FooComponent {
  tone = input<FooTone>('neutral');

  protected readonly containerClass = computed(() => {
    const map: Record<FooTone, string> = {
      neutral: 'bg-surface text-gray-900',
      primary: 'bg-primary text-white',
      danger:  'bg-red-100 text-red-800',
    };
    return `rounded-md p-4 ${map[this.tone()]}`;
  });
}
```

## Primitive with a separate template

`button.component.ts`:

```ts
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'ml-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  name         = input.required<string>();
  type         = input<'primary' | 'secondary' | 'secondary-outlined'>('primary');
  isDisabled   = input(false);
  isProcessing = input(false);
}
```

`button.component.html` uses `@if` / `@else if` / `@else` to switch variants, applies tailwind classes directly, and shows the spinner via an inline SVG with `animate-spin`. See `src/app/shared/ui/button/button.component.html` for the canonical example.

## Slotting content with `<ng-content>`

For "shell" primitives (card, action-card, alert, page-header) that wrap arbitrary children:

```ts
template: `
  <div class="...">
    <ng-content select="[accent]" />  <!-- named slot -->
    <ng-content />                     <!-- default slot -->
    <ng-content select="[footer]" />
  </div>
`
```

The consumer marks projected content with attribute selectors:

```html
<ml-action-card>
  <div accent>Highlight banner</div>
  <p>Main body…</p>
  <div footer>
    <ml-button [name]="'Continuar'" />
  </div>
</ml-action-card>
```

## Outputs

Use the `output()` function, never `EventEmitter` or `@Output()`:

```ts
import { output } from '@angular/core';

closed = output<void>();
selectionChange = output<Event>();
// emit:
this.closed.emit();
```

## Things to avoid

- ❌ `@Input()` / `@Output()` decorators
- ❌ Constructor injection (`constructor(private svc: Svc)`)
- ❌ `CommonModule` import when you only need control flow (`@if`/`@for`/`@switch` is built in)
- ❌ Building Tailwind classes by string concatenation (`` `text-${color}-500` ``) — JIT can't see them, they get purged
- ❌ Inline arbitrary hex colors (`text-[#abc123]`). The only allowed exception is the existing dark gradient `from-[#1f1b19]`.
- ❌ Adding `OnPush` change detection manually — signals make it unnecessary in this project.
