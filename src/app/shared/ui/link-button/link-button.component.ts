import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'ml-link-button',
    imports: [RouterLink],
    templateUrl: './link-button.component.html'
})
export class LinkButtonComponent {
  routerLink = input<string | any[]>();
  href = input<string>();
  target = input<'_blank' | '_self'>('_self');
  type = input<'primary' | 'primary-outlined'>('primary');
  size = input<'md' | 'lg'>('md');

  protected rel = computed(() =>
    this.target() === '_blank' ? 'noopener noreferrer' : undefined
  );

  protected classes = computed(() => {
    const sizeClasses =
      this.size() === 'lg'
        ? 'w-full flex items-center justify-center px-8 py-3 text-base md:py-4 md:text-lg md:px-10'
        : 'inline-flex items-center justify-center px-5 py-3 text-base';

    const colorClasses =
      this.type() === 'primary-outlined'
        ? 'border border-primary text-primary bg-transparent hover:bg-primary-surface'
        : 'border border-transparent text-white bg-primary hover:bg-primary-hover';

    return `font-medium rounded-md transition-colors duration-200 ${sizeClasses} ${colorClasses}`;
  });
}
