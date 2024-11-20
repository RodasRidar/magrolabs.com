import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddressService } from '../../../../shared/services/address-service.service';
import { StepEnum } from '../../models/step.model';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { StepComponent } from '../../components/step/step.component';
import { Router } from '@angular/router';
import { Information, InformationComponent } from '../../components/information/information.component';
import { SummaryService } from '../../../../shared/services/summary-service.service';

@Component({
  selector: 'app-verification-payment',
  standalone: true,
  imports: [StepComponent, ButtonComponent, ReactiveFormsModule, CommonModule, InformationComponent],
  templateUrl: './verification-payment.component.html',
})
export class VerificationPaymentComponent {

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
  private _summaryService = inject(SummaryService)

  stepEnum = StepEnum;

  form = this._formBuilder.group({
    promoCode: this._formBuilder.control('', [Validators.minLength(3), Validators.pattern(/^[A-Z0-9]{3,10}$/)]),
    cardNumber: this._formBuilder.nonNullable.control('', [Validators.required, Validators.pattern(/^[0-9]{15,16}|(([0-9]{4}\s){3}[0-9]{3,4})$/)]),
    cardName: this._formBuilder.nonNullable.control('', [Validators.required, Validators.pattern(/^[A-Z\s]{3,}$/)]),
    cardExpiration: this._formBuilder.nonNullable.control('', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/[0-9]{4}$/)]),
    cardCvv: this._formBuilder.nonNullable.control('', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]),
  })

  ngOnInit(): void {
    let summary = this._summaryService.getSummary()
    if (!summary?.address) {
      this._router.navigate(['registro/direccion']);
    }
  }

  applyPromoCode() {
    if (this.form.get('promoCode')?.valid) {
      const promoCode = this.form.get('promoCode')?.value;
      if (promoCode === 'FREE' || promoCode === 'ERROR') {
        this.isPaymentVerified = true;
      }
    }
  }

  nextStep(): void {
    const promoCode = this.form.get('promoCode')?.value;
    if (promoCode === 'FREE') {
      this._router.navigate(['registro/confirmacion'], { queryParams: { status: 1 } });
    }
    else{
      this._router.navigate(['registro/confirmacion'], { queryParams: { status: 0 } });
    }
  }

  verifyPayment() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isPaymentVerified = true;
  }

  hasRequiredError(field: string) {
    const control = this.form.get(field);
    return control?.hasError('required') && control.touched;
  }

  formatCardNumber(): void {
    let cardNumber = this.form.get('cardNumber')?.value || '';
    cardNumber = cardNumber.replace(/\D/g, '');
    cardNumber = cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.form.get('cardNumber')?.setValue(cardNumber, { emitEvent: false });
  }

}
