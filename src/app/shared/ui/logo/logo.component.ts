import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { SafeHtml } from '@angular/platform-browser';
import { switchMap } from 'rxjs';
import { SvgIconLoader } from '../../services/svg-icon-loader.service';

export type LogoVariant = 'imagotipo' | 'isotipo';

const PATHS: Record<LogoVariant, string> = {
  imagotipo: '/svg/magrolabs_imagotipo.svg',
  isotipo: '/svg/magrolabs_isotipo.svg',
};

/**
 * Logo de Magrolabs. Color dinámico vía `currentColor` (usa `text-fg`).
 * El SVG se estira a la altura del host preservando aspect ratio.
 */
@Component({
  selector: 'ml-logo',
  host: {
    'class': 'inline-block [&>svg]:block [&>svg]:h-full [&>svg]:w-auto',
    'role': 'img',
    '[attr.aria-label]': "label() || 'Magrolabs'",
    '[innerHTML]': 'svg()',
  },
  template: '',
})
export class LogoComponent {
  variant = input<LogoVariant>('imagotipo');
  label = input<string>('');

  private readonly loader = inject(SvgIconLoader);
  private readonly path = computed(() => PATHS[this.variant()]);

  protected readonly svg = toSignal(
    toObservable(this.path).pipe(switchMap((p) => this.loader.load(p))),
    { initialValue: '' as SafeHtml | string },
  );
}
