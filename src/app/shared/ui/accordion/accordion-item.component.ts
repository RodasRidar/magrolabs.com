import { Component, inject, input, OnInit } from '@angular/core';
import { AccordionGroupComponent } from './accordion-group.component';

@Component({
  selector: 'ml-accordion-item',
  standalone: true,
  imports: [],
  styles: [`
    .accordion-body {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 280ms ease;
    }
    .accordion-body.open {
      grid-template-rows: 1fr;
    }
    .accordion-body > div {
      overflow: hidden;
    }
  `],
  template: `
    <div class="rounded-lg bg-gray-50 p-6 mb-4">
      <button
        type="button"
        (click)="toggle()"
        [attr.aria-expanded]="isOpen()"
        class="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
      >
        <span class="font-semibold text-gray-900">{{ title() }}</span>
        <span class="relative size-5 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg"
            class="absolute inset-0 size-5 transition-opacity duration-200"
            [class.opacity-100]="!isOpen()"
            [class.opacity-0]="isOpen()"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg"
            class="absolute inset-0 size-5 transition-opacity duration-200"
            [class.opacity-0]="!isOpen()"
            [class.opacity-100]="isOpen()"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      </button>
      <div class="accordion-body" [class.open]="isOpen()">
        <div>
          <div class="pt-4 text-sm leading-relaxed text-gray-700">
            <ng-content />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AccordionItemComponent implements OnInit {
  title = input.required<string>();

  private readonly group = inject(AccordionGroupComponent);
  private index!: number;

  ngOnInit(): void {
    this.index = this.group.register();
  }

  protected isOpen(): boolean {
    return this.group.isOpen(this.index);
  }

  protected toggle(): void {
    this.group.toggle(this.index);
  }
}
