import { Component, input, output } from '@angular/core';

@Component({
    selector: 'ml-modal',
    imports: [],
    host: { class: 'block' },
    template: `
    <div class="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <!-- Panel -->
        <div
          class="relative inline-block align-middle bg-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:w-full"
          [class]="panelClass()">

          <!-- Body -->
          <div class="bg-surface relative" [class]="bodyClass()">
            <!-- Botón X: solo si se pasó closeAction -->
            @if (closable()) {
              <button
                type="button"
                (click)="closeAction.emit()"
                class="absolute top-3 right-3 text-gray-400 hover:text-gray-500 focus:outline-none">
                <span class="sr-only">Cerrar</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            }

            <!-- Slot: header (título) -->
            <ng-content select="[mlModalHeader]" />

            <!-- Slot: body (contenido) -->
            <ng-content />
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-4 py-3 sm:px-6">
            <ng-content select="[mlModalFooter]" />
          </div>

        </div>
      </div>
    </div>
  `
})
export class InlineModalComponent {
  /** Tamaño del panel: 'sm' (default, max-w-lg) | 'md' (max-w-2xl) */
  size = input<'sm' | 'md'>('sm');

  /** Padding del body: 'default' | 'lg' (px-6 pt-6 pb-4 sm:p-8 sm:pb-6) */
  bodyPadding = input<'default' | 'lg'>('default');

  /** Si se pasa, muestra el botón X y emite al hacer click. */
  closable = input<boolean>(false);

  /** Emitir al hacer click en X. */
  closeAction = output<void>();

  protected panelClass() {
    return this.size() === 'md' ? 'sm:max-w-2xl' : 'sm:max-w-lg';
  }

  protected bodyClass() {
    return this.bodyPadding() === 'lg'
      ? 'px-6 pt-6 pb-4 sm:p-8 sm:pb-6'
      : 'px-4 pt-5 pb-4 sm:p-6 sm:pb-4';
  }
}
