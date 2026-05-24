import { Component, input } from '@angular/core';

@Component({
  selector: 'ml-page-header',
  standalone: true,
  host: { class: 'block' },
  template: `
    <header>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight text-fg">{{ title() }}</h1>
        <ng-content />
      </div>
    </header>
  `,
})
export class PageHeaderComponent {
  title = input.required<string>();
}
