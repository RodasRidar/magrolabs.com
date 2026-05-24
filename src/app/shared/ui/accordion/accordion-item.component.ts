import { Component, inject, input, OnInit } from '@angular/core';
import { AccordionGroupComponent } from './accordion-group.component';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'ml-accordion-item',
    imports: [IconComponent],
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
    <div class="rounded-lg bg-bg-alt p-6 mb-4">
      <button
        type="button"
        (click)="toggle()"
        [attr.aria-expanded]="isOpen()"
        class="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
      >
        <span class="font-semibold text-fg">{{ title() }}</span>
        <span class="relative size-5 shrink-0 text-fg-muted">
          <ml-icon
            name="plus-circle"
            class="absolute inset-0 size-5 transition-opacity duration-200"
            [class.opacity-100]="!isOpen()"
            [class.opacity-0]="isOpen()"
          />
          <ml-icon
            name="minus-circle"
            class="absolute inset-0 size-5 transition-opacity duration-200"
            [class.opacity-0]="!isOpen()"
            [class.opacity-100]="isOpen()"
          />
        </span>
      </button>
      <div class="accordion-body" [class.open]="isOpen()">
        <div>
          <div class="pt-4 text-sm leading-relaxed text-fg-muted">
            <ng-content />
          </div>
        </div>
      </div>
    </div>
  `
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
