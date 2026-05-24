import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { SafeHtml } from '@angular/platform-browser';
import { switchMap } from 'rxjs';
import { SvgIconLoader } from '../../services/svg-icon-loader.service';

export type IconName =
  | 'star'
  | 'check'
  | 'check-solid'
  | 'check-circle'
  | 'x-circle'
  | 'close'
  | 'chevron-down'
  | 'minus-circle'
  | 'plus-circle'
  | 'plus'
  | 'minus'
  | 'lock'
  | 'user-circle'
  | 'shopping-cart'
  | 'pencil'
  | 'face'
  | 'local-shipping'
  | 'credit-card'
  | 'package-lock'
  | 'clipboard-document'
  | 'box'
  | 'truck-side'
  | 'calendar'
  | 'radio-on'
  | 'radio-off'
  | 'trash'
  | 'card-add'
  | 'menu'
  | 'user-circle-outline'
  | 'home'
  | 'profile'
  | 'logout';

/**
 * Iconos centralizados en `public/svg/icons/<name>.svg`.
 * Todos usan `currentColor` — color y tamaño se controlan desde el host.
 *
 *   <ml-icon name="check" class="h-5 w-5 text-fg-muted" />
 *
 * El SVG se inyecta como `innerHTML` del host (sin wrapper extra).
 */
@Component({
  selector: 'ml-icon',
  host: {
    'class': 'inline-block [&>svg]:block [&>svg]:h-full [&>svg]:w-full',
    'aria-hidden': 'true',
    '[innerHTML]': 'svg()',
  },
  template: '',
})
export class IconComponent {
  name = input.required<IconName>();

  private readonly loader = inject(SvgIconLoader);
  private readonly path = computed(() => `/svg/icons/${this.name()}.svg`);

  protected readonly svg = toSignal(
    toObservable(this.path).pipe(switchMap((p) => this.loader.load(p))),
    { initialValue: '' as SafeHtml | string },
  );
}
