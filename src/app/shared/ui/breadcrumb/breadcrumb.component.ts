import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

@Component({
    selector: 'ml-breadcrumb',
    imports: [RouterLink],
    template: `
    <nav aria-label="Breadcrumb" class="sm:flex block gap-1">
      <div class="flex items-center flex-wrap gap-y-1">
        @for (item of items(); track item.label; let last = $last) {
          @if (item.link) {
            <a [routerLink]="item.link"
               class="text-gray-700 text-sm font-extralight underline hover:no-underline hover:text-gray-900">
              {{ item.label }}
            </a>
          } @else {
            <span class="text-gray-700 text-sm font-extralight max-sm:tracking-tighter">{{ item.label }}</span>
          }

          @if (!last) {
            <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 -960 960 960" width="15px" fill="#434343" aria-hidden="true">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
            </svg>
          }
        }
      </div>
    </nav>
  `
})
export class BreadcrumbComponent {
  items = input.required<BreadcrumbItem[]>();
}
