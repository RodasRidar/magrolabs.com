import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerificationPaymentModalService } from '../../services/verification-payment-modal.service';
import { VerificationPaymentComponent } from '../../../ecommerce/signup/pages/verification-payment/verification-payment.component';

@Component({
  selector: 'app-verification-payment-modal',
  standalone: true,
  imports: [CommonModule, VerificationPaymentComponent],
  template: `
    @if (modalService.isOpen()) {
      <div 
        class="fixed inset-0 z-50 overflow-y-auto"
        (click)="onBackdropClick($event)"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        
        <!-- Modal Container -->
        <div class="flex items-center justify-center p-2 sm:p-1 mx-auto min-h-screen">
          <div 
            class="relative max-w-[720px] bg-white rounded-lg shadow-xl transition-all"
            (click)="stopPropagation($event)"
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">
                Activar tu prueba gratis.
              </h3>
              <button
                type="button"
                (click)="closeModal()"
                class="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <!-- Content -->
            <div class="px-0 pt-12 pb-0 max-h-[80vh] overflow-y-auto">
              <app-verification-payment></app-verification-payment>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class VerificationPaymentModalComponent {
  modalService = inject(VerificationPaymentModalService);

  closeModal(): void {
    this.modalService.close();
  }

  onBackdropClick(event: MouseEvent): void {
    // No cerrar al hacer clic en el backdrop para evitar que el usuario
    // pierda el progreso accidentalmente
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
}
