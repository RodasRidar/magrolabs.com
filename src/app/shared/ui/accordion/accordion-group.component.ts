import { Component, signal } from '@angular/core';

@Component({
    selector: 'ml-accordion-group',
    imports: [],
    host: { class: 'block space-y-4' },
    template: `<ng-content />`
})
export class AccordionGroupComponent {
  private readonly openIndex = signal<number | null>(null);
  private itemCount = 0;

  register(): number {
    return this.itemCount++;
  }

  isOpen(index: number): boolean {
    return this.openIndex() === index;
  }

  toggle(index: number): void {
    this.openIndex.update((v) => (v === index ? null : index));
  }
}
