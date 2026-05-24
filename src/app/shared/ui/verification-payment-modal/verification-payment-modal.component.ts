import { Component, inject, effect } from "@angular/core";
import { IconComponent } from '../icon/icon.component';

import { VerificationPaymentModalService } from "../../services/verification-payment-modal.service";
import { VerificationPaymentComponent } from "../../../ecommerce/signup/pages/verification-payment/verification-payment.component";

@Component({
  selector: "app-verification-payment-modal",
  imports: [VerificationPaymentComponent, IconComponent],
  templateUrl: "./verification-payment-modal.component.html",
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
