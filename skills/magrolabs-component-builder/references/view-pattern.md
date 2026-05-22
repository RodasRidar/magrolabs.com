# View / Page Pattern

Lives in `src/app/<feature>/pages/<name>/` (or `src/app/<feature>/<name>/` at the feature root). Selector `app-<name>`. Standalone. Lazy-loaded. Composed of UI primitives from `shared/ui/`.

## File layout

```
src/app/account/pages/perfil/
  perfil.component.ts
  perfil.component.html
  perfil.component.css     (often empty — use Tailwind in the template)
  perfil.component.spec.ts
```

## Component class anatomy

```ts
import { Component, OnInit, inject, DestroyRef, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../shared/services/seo.service';
import { ToastService } from '../../../shared/services/toast.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-perfil',
  imports: [
    CommonModule, RouterLink,
    PageHeaderComponent, CardComponent, ButtonComponent,
  ],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent implements OnInit {
  private _seoService = inject(SeoService);
  private _toastService = inject(ToastService);
  private _destroyRef = inject(DestroyRef);

  isLoading = signal(true);
  data = signal<SomeModel | null>(null);

  hasData = computed(() => this.data() !== null);

  ngOnInit(): void {
    this.configureSEO();
    this.loadData();
  }

  private configureSEO(): void {
    this._seoService.setTitle('Mi Perfil | Magrolabs');
    this._seoService.setDescription('Editá tu información personal en Magrolabs.');
    // For private/authenticated pages:
    this._seoService.setIndexFollow(false);
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.someService.get()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (data) => {
          this.data.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this._toastService.error('Error', 'No pudimos cargar tus datos.');
        },
      });
  }
}
```

### Service injection rules

- Always `inject()` — never constructor injection.
- Prefix private service fields with `_` (e.g. `_seoService`, `_router`, `_toastService`). Public services accessed from the template (like `profileCompletionService` on the cuenta page) skip the underscore.

### Unsubscription

Prefer `takeUntilDestroyed(this._destroyRef)` for new code. The cuenta page uses an older `Subject<void>` + `destroyRef.onDestroy()` pattern — match that style only if you're editing that file. Don't introduce the older pattern in brand-new pages.

## Template anatomy

Every page follows this shell:

```html
<ml-page-header [title]="'My Page Title'">
  <p class="mt-2 text-lg text-gray-600 font-medium">Optional subtitle</p>
</ml-page-header>

<main>
  <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
    <div class="px-4 py-8 sm:px-0">

      @if (isLoading()) {
        <!-- skeleton: grid of gray animate-pulse blocks inside ml-cards -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ml-card padding="md" class="animate-pulse">
            <div class="h-6 bg-gray-300 rounded w-2/3 mb-4"></div>
            <div class="space-y-3">
              <div class="h-4 bg-gray-300 rounded w-full"></div>
              <div class="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </ml-card>
          <!-- repeat 2-3 cards -->
        </div>
      } @else {
        <!-- real content -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          ...
        </div>
      }

    </div>
  </div>
</main>
```

The skeleton mirrors the real layout — same grid columns, same card padding — so there is no layout shift when data lands. See `src/app/account/pages/cuenta/cuenta.component.html` for the reference implementation.

## Routing

Add the route to `src/app/app.routes.ts`. Always lazy-load with `loadComponent`:

```ts
{
  path: 'mi-perfil',
  loadComponent: () =>
    import('./account/pages/perfil/perfil.component').then(m => m.PerfilComponent),
  canActivate: [authGuard],
}
```

Guard reference:

| Guard | Use when |
|---|---|
| `refLinkGuard` | All public marketing/storefront pages (almost every public route already uses this) |
| `authGuard` | Authenticated user area (children of `/cuenta`) |
| `notAuthGuard` | Pages that should redirect away if already logged in (login, signup) |
| `pixelTestGuard` | Internal pixel testing route |

If the new page belongs under an existing parent (`/cuenta/...`, `/registro/...`, `/atencion-cliente/...`, `/productos/...`, `/loyalty-webshop/...`, `/politicas/...`), nest it in that parent's `children` array. Don't add a new top-level entry.

## SEO checklist

For every new page, set at minimum:

- `setTitle('<Page name> | Magrolabs')` (this is the project's title convention)
- `setDescription('<140–160 char marketing description>')`
- `setIndexFollow(false)` for any page behind `authGuard` or containing private data
- Add canonical / og tags only if `SeoService` exposes helpers for them — don't manipulate `Meta` directly outside the service.

## Forms on views

If the view contains a form, prefer **signal forms** (Angular 21+) for new work. If you need reactive forms (e.g. matching an existing pattern in the same feature folder), import `ReactiveFormsModule` and compose with the `ml-input` / `ml-select` form controls — both already implement `ControlValueAccessor`, so they bind to `formControl` / `formControlName` directly.
