import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddressService } from '../../../../shared/services/address-service.service';
import { StepEnum } from '../../models/step.model';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { StepComponent } from '../../components/step/step.component';
import { Router } from '@angular/router';
import { Information, InformationComponent } from '../../components/information/information.component';

@Component({
  selector: 'app-verification-payment',
  standalone: true,
  imports: [StepComponent, ButtonComponent, ReactiveFormsModule, CommonModule, InformationComponent],
  templateUrl: './verification-payment.component.html',
})
export class VerificationPaymentComponent {
verifyPayment() {
throw new Error('Method not implemented.');
}
togglePromoCodeInput() {
throw new Error('Method not implemented.');
}

  isPaymentVerified = false;
  promotionIsShow = false;
  informationList: Information[] = [
    {
      name: 'Tu creatina gratis se enviara inmediatamente después de completar el registro',
    },
    {
      name: 'Periodo de reflexión de 14 días',
    },
    {
      name: 'Cancela cuando quieras',
    }
  ]
  private _formBuilder = inject(FormBuilder)
  private _addressService = inject(AddressService)
  private _router = inject(Router)

  stepEnum = StepEnum;

  promoForm = this._formBuilder.group({
    promoCode: this._formBuilder.control('', [Validators.minLength(3), Validators.pattern(/^[A-Z0-9]{3,10}$/)]),
  })

  applyPromoCode() {
    if (this.promoForm.valid) {
      const promoCode = this.promoForm.get('promoCode')?.value;
      console.log('Código promocional aplicado:', promoCode);
    }
  }

  nextStep(): void {
    this._router.navigate(['registro/confirmacion']);
  }
}
