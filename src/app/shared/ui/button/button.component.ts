import { Component, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'secondary-outlined';

@Component({
  selector: 'ml-button',
  imports: [],
  templateUrl: './button.component.html',
  host: { class: 'block' },
})
export class ButtonComponent {
  name = input.required<string>();
  type = input<ButtonVariant>('primary');
  isDisabled = input(false);
  isProcessing = input(false);

  protected readonly buttonClass = computed(() => {
    const base =
      'w-full inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-base font-medium transition-colors disabled:cursor-not-allowed';

    const variantMap: Record<ButtonVariant, string> = {
      primary:
        'border-transparent text-white bg-primary hover:bg-primary-hover disabled:bg-primary disabled:opacity-60',
      secondary:
        'border-transparent text-bg bg-fg hover:bg-fg-muted disabled:bg-border-strong disabled:text-fg-subtle',
      'secondary-outlined':
        'text-fg border-border-strong bg-bg hover:bg-bg-alt disabled:text-fg-subtle disabled:bg-bg-alt',
    };

    const processing = this.isProcessing() ? 'cursor-progress' : '';
    return `${base} ${variantMap[this.type()]} ${processing}`.trim();
  });

  protected readonly spinnerClass = computed(() => {
    const map: Record<ButtonVariant, string> = {
      primary: 'text-white',
      secondary: 'text-bg',
      'secondary-outlined': 'text-fg',
    };
    return `animate-spin h-4 w-4 mr-2 ${map[this.type()]}`;
  });
}
