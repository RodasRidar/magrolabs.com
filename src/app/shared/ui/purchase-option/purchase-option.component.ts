import { Component, input, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export interface PurchaseBenefit {
  /** SVG path data (d attribute). Uses Material Symbols viewBox by default. */
  svgPath: string;
  text: string;
  /** SVG viewBox. Defaults to '0 -960 960 960'. */
  viewBox?: string;
  /** Icon size in px. Defaults to 18. */
  size?: number;
}

@Component({
    selector: 'ml-purchase-option',
    imports: [CurrencyPipe, IconComponent],
    styles: [`
    @keyframes option-select {
      0%   { transform: scale(1);     box-shadow: 0 0 0 0 rgba(0,0,0,0); }
      35%  { transform: scale(1.018); box-shadow: 0 4px 18px 0 rgba(0,0,0,0.10); }
      100% { transform: scale(1);     box-shadow: none; }
    }
    .select-pulse {
      animation: option-select 320ms ease-out;
    }
    .benefits-body {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 280ms ease;
    }
    .benefits-body.open {
      grid-template-rows: 1fr;
    }
    .benefits-body > div {
      overflow: hidden;
    }
  `],
    template: `
    <div
      class="rounded-lg overflow-hidden border transition-colors duration-150 mb-4 bg-bg"
      [class.border-fg]="isExpanded()"
      [class.border-border]="!isExpanded()"
      [class.select-pulse]="justSelected()"
    >
      <!-- Header row (always visible) -->
      <button
        type="button"
        (click)="onHeaderClick($event)"
        class="flex w-full cursor-pointer items-center justify-between gap-1.5 text-fg p-3 text-left"
      >
        <!-- Left: radio icon + label + badge -->
        <div class="flex items-center">
          <span class="relative size-5 shrink-0 mr-2">
            <ml-icon
              name="radio-on"
              class="absolute inset-0 size-5 text-fg transition-opacity duration-150"
              [class.opacity-100]="isExpanded()"
              [class.opacity-0]="!isExpanded()"
            />
            <ml-icon
              name="radio-off"
              class="absolute inset-0 size-5 text-fg-subtle transition-opacity duration-150"
              [class.opacity-0]="isExpanded()"
              [class.opacity-100]="!isExpanded()"
            />
          </span>
          <h2 class="font-light mr-2 max-lg:text-sm">{{ label() }}</h2>
          @if (badge()) {
            <div class="p-[0.35rem] bg-primary rounded-2xl">
              <p class="max-lg:text-[10px] text-xs text-white font-extralight">{{ badge() }}</p>
            </div>
          }
        </div>

        <!-- Right: prices -->
        <div class="flex items-center">
          <div class="flex justify-center items-center font-extralight">
            @if (originalPrice() !== null) {
              <p class="text-xs text-fg-subtle line-through">{{ originalPrice() | currency : 'S/' }}</p>
            }
            <p class="text-sm text-fg sm:text-sm ml-2">
              {{ price() | currency : 'S/' }}{{ priceSuffix() ?? '' }}
            </p>
          </div>
        </div>
      </button>

      <!-- Expandable benefits section -->
      <div class="benefits-body" [class.open]="isExpanded()">
        <div>
          @if (benefits().length > 0) {
            <div class="m-3">
              <div class="grid rounded-md grid-cols-1 gap-x-2 gap-y-2 bg-bg-alt py-4 px-3">
                @if (benefitsLabel()) {
                  <span class="text-sm mb-1 text-left text-fg font-light">{{ benefitsLabel() }}</span>
                }
                @for (benefit of benefits(); track benefit.text) {
                  <div class="flex flex-row items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      [attr.height]="(benefit.size ?? 18) + 'px'"
                      [attr.viewBox]="benefit.viewBox ?? '0 -960 960 960'"
                      [attr.width]="(benefit.size ?? 18) + 'px'"
                      class="text-fg-subtle"
                      fill="currentColor"
                    >
                      <path [attr.d]="benefit.svgPath" />
                    </svg>
                    <p class="text-pretty text-xs text-fg-subtle ml-2 sm:ml-3">{{ benefit.text }}</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class PurchaseOptionComponent {
  private readonly platformId = inject(PLATFORM_ID);

  label = input.required<string>();
  price = input.required<number>();
  originalPrice = input<number | null>(null);
  priceSuffix = input<string | null>(null);
  badge = input<string | null>(null);
  benefits = input<PurchaseBenefit[]>([]);
  benefitsLabel = input<string | null>(null);

  optionSelected = output<void>();

  isExpanded = signal(false);
  justSelected = signal(false);

  expand(): void {
    this.isExpanded.set(true);
    this._triggerSelectAnimation();
  }

  collapse(): void { this.isExpanded.set(false); }

  protected onHeaderClick(event: Event): void {
    event.preventDefault();
    this.optionSelected.emit();
  }

  private _triggerSelectAnimation(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Remove the class first so it can be re-added even if already selected
    this.justSelected.set(false);
    // rAF ensures the class removal is painted before re-adding
    requestAnimationFrame(() => this.justSelected.set(true));
    setTimeout(() => this.justSelected.set(false), 350);
  }
}
