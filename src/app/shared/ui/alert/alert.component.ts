import { Component, computed, input } from '@angular/core';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'ml-alert',
  standalone: true,
  host: { class: 'block' },
  template: `
    <div [class]="containerClass()">
      <div class="flex">
        <div class="flex-shrink-0 mt-1">
          @switch (type()) {
            @case ('success') {
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
              </svg>
            }
            @case ('error') {
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            }
            @case ('warning') {
              <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
              </svg>
            }
            @case ('info') {
              <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
              </svg>
            }
          }
        </div>
        <div class="ml-3 flex-1">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class AlertComponent {
  type = input.required<AlertType>();

  protected readonly containerClass = computed(() => {
    const map: Record<AlertType, string> = {
      success: 'rounded-lg p-4 border bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-800',
      error:   'rounded-lg p-4 border bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800',
      warning: 'rounded-lg p-4 border bg-yellow-50 border-yellow-200 dark:bg-yellow-950/40 dark:border-yellow-800',
      info:    'rounded-lg p-4 border bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800',
    };
    return map[this.type()];
  });
}
