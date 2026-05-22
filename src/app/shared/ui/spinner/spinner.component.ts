import { Component, computed, input } from '@angular/core';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'gray' | 'accent';

@Component({
  selector: 'ml-spinner',
  standalone: true,
  template: `<div class="animate-spin rounded-full border-t-2 border-b-2 h-12 w-12 border-gray-900"></div>`,
})
export class SpinnerComponent {

}
