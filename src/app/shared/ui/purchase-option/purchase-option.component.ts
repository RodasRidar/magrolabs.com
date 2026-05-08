import { Component, input, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

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
  standalone: true,
  imports: [CurrencyPipe],
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
      class="rounded-lg overflow-hidden border transition-colors duration-150 mb-4 bg-white"
      [class.border-gray-800]="isExpanded()"
      [class.border-gray-200]="!isExpanded()"
      [class.select-pulse]="justSelected()"
    >
      <!-- Header row (always visible) -->
      <button
        type="button"
        (click)="onHeaderClick($event)"
        class="flex w-full cursor-pointer items-center justify-between gap-1.5 text-gray-900 p-3 text-left"
      >
        <!-- Left: radio icon + label + badge -->
        <div class="flex items-center">
          <span class="relative size-5 shrink-0 mr-2">
            <!-- Filled circle: visible when expanded/selected -->
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960"
              class="absolute inset-0 size-5 transition-opacity duration-150"
              [class.opacity-100]="isExpanded()"
              [class.opacity-0]="!isExpanded()"
              width="24px" fill="#000000">
              <path d="M480-280q83 0 141.5-58.5T680-480q0-83-58.5-141.5T480-680q-83 0-141.5 58.5T280-480q0 83 58.5 141.5T480-280Zm0 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
            </svg>
            <!-- Empty circle: visible when collapsed/not selected -->
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960"
              class="absolute inset-0 size-5 transition-opacity duration-150"
              [class.opacity-0]="isExpanded()"
              [class.opacity-100]="!isExpanded()"
              width="24px" fill="#434343">
              <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
            </svg>
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
              <p class="text-xs text-gray-500 line-through">{{ originalPrice() | currency : 'S/' }}</p>
            }
            <p class="text-sm text-gray-900 sm:text-sm ml-2">
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
              <div class="grid rounded-md grid-cols-1 gap-x-2 gap-y-2 bg-[#f8f6f3] py-4 px-3">
                @if (benefitsLabel()) {
                  <span class="text-sm mb-1 text-left text-gray-900 font-light">{{ benefitsLabel() }}</span>
                }
                @for (benefit of benefits(); track benefit.text) {
                  <div class="flex flex-row items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      [attr.height]="(benefit.size ?? 18) + 'px'"
                      [attr.viewBox]="benefit.viewBox ?? '0 -960 960 960'"
                      [attr.width]="(benefit.size ?? 18) + 'px'"
                      fill="#434343"
                    >
                      <path [attr.d]="benefit.svgPath" />
                    </svg>
                    <p class="text-pretty text-xs text-gray-500 ml-2 sm:ml-3">{{ benefit.text }}</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
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
