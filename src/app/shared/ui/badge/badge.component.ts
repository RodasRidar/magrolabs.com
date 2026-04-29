import { Component, computed, input } from '@angular/core';

export type BadgeColor = 'green' | 'yellow' | 'red' | 'blue' | 'indigo' | 'gray';
export type BadgeSize = 'sm' | 'md';

@Component({
  selector: 'ml-badge',
  standalone: true,
  template: `
    <span [class]="badgeClass()">
      @if (pulse() !== undefined) {
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
      green:  'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red:    'bg-red-100 text-red-800',
      blue:   'bg-blue-100 text-blue-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      gray:   'bg-gray-200 text-gray-800',
    };
    const sizeMap: Record<BadgeSize, string> = {
      sm: 'px-2.5 py-0.5',
      md: 'px-3 py-1',
    };
    return `inline-flex items-center text-xs font-medium rounded-full ${sizeMap[this.size()]} ${colorMap[this.color()]}`;
  });

  protected readonly dotClass = computed(() => {
    const colorMap: Record<BadgeColor, string> = {
      green:  'bg-green-500',
      yellow: 'bg-yellow-500',
      red:    'bg-red-500',
      blue:   'bg-blue-500',
      indigo: 'bg-indigo-500',
      gray:   'bg-gray-500',
    };
    const pulse = this.pulse() === true ? 'animate-pulse' : '';
    return `w-2 h-2 me-1 rounded-full ${colorMap[this.color()]} ${pulse}`.trim();
  });
}
