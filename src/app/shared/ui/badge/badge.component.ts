import { Component, computed, input } from '@angular/core';

export type BadgeColor = 'green' | 'yellow' | 'red' | 'blue' | 'indigo' | 'purple' | 'pink' | 'gray';
export type BadgeSize = 'sm' | 'md';

@Component({
  selector: 'ml-badge',
  standalone: true,
  template: `
    <span [class]="badgeClass()">
      @if (pulse()) {
        <span [class]="dotClass()"></span>
      }
      {{ label() }}
    </span>
  `,
})
export class BadgeComponent {
  color = input.required<BadgeColor>();
  label = input.required<string>();
  pulse = input<boolean | undefined>(undefined);
  size  = input<BadgeSize>('sm');

  protected readonly badgeClass = computed(() => {
    const colorMap: Record<BadgeColor, string> = {
      gray:   'bg-fg-muted/10 text-fg-muted ring-1 ring-inset ring-fg-muted/20',
      red:    'bg-red-600/10 text-red-600 ring-1 ring-inset ring-red-600/20',
      yellow: 'bg-yellow-600/10 text-yellow-500 ring-1 ring-inset ring-yellow-600/20',
      green:  'bg-green-600/10 text-green-600 ring-1 ring-inset ring-green-500/20',
      blue:   'bg-blue-600/10 text-blue-600 ring-1 ring-inset ring-blue-600/30',
      indigo: 'bg-indigo-600/10 text-indigo-600 ring-1 ring-inset ring-indigo-600/30',
      purple: 'bg-purple-600/10 text-purple-600 ring-1 ring-inset ring-purple-600/30',
      pink:   'bg-pink-600/10 text-pink-600 ring-1 ring-inset ring-pink-600/20',
    };
    const sizeMap: Record<BadgeSize, string> = {
      sm: 'px-2 py-1',
      md: 'px-2.5 py-1',
    };
    return `inline-flex items-center gap-1 rounded-md text-xs font-medium ${sizeMap[this.size()]} ${colorMap[this.color()]}`;
  });

  protected readonly dotClass = computed(() => {
    const colorMap: Record<BadgeColor, string> = {
      gray:   'bg-fg-subtle',
      red:    'bg-red-500',
      yellow: 'bg-yellow-500',
      green:  'bg-green-500',
      blue:   'bg-blue-500',
      indigo: 'bg-indigo-500',
      purple: 'bg-purple-500',
      pink:   'bg-pink-500',
    };
    return `w-1.5 h-1.5 rounded-full animate-pulse ${colorMap[this.color()]}`;
  });
}
