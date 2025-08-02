import { Component, inject, output } from '@angular/core';
import { SummaryService } from '../../services/summary-service.service';
import { FlowPaymentMethod } from '../../models/flow.model';
import { environment } from '../../../../environments/env';

@Component({
  selector: 'app-payment-method',
  standalone: true,
  imports: [],
  templateUrl: './payment-method.component.html',
  styleUrl: './payment-method.component.css'
})
export class PaymentMethodComponent {
  private _summaryService = inject(SummaryService);
  env = environment

  ngOnInit(): void {
    this.paymentMethod.emit(FlowPaymentMethod.DEBIT_CREDIT_CARD);

    const last4CardDigits = this._summaryService.getSummary()?.userData?.last4CardDigits || '';
    const creditCardType = this._summaryService.getSummary()?.userData?.creditCardType || '';

    if(this._summaryService.getSummary()?.userData?.isPaymentVerified) {
      this.radios.unshift({
        name: '**** **** **** ' + last4CardDigits + ' (' + creditCardType + ')',
        description: 'Paga con tu tarjeta '+ creditCardType + 'que termina en ' + last4CardDigits + ' registrada en tu cuenta.',
        icon: `CARD_ENROLLED`,
        id: FlowPaymentMethod.CARD_ENROLLED,
      })
    }
  }
  paymentMethod = output<FlowPaymentMethod>()
    
  radios = [
    {
      name: 'Tarjetas',
      description: 'Paga con tu tarjeta de débito o crédito.',
      icon: `DEBIT_CREDIT_CARD`,
      id: FlowPaymentMethod.DEBIT_CREDIT_CARD,
    },
    /*{
      name: 'Transferencia bancaria',
      description: 'Paga a través de todos los bancos.',
      icon: ``,
      id: FlowPaymentMethod.BANK_TRANSFER,
    },*/
    {
      name: 'Yape',
      description: 'Paga con Yape y otras billeteras.',
      icon: `YAPE`,
      id: FlowPaymentMethod.YAPE,
    }
    /*,
    {
      name: 'Pago Efectivo',
      description: 'Pagos vía banca móvil, agentes y bodegas.',
      icon: `PAGO_EFECTIVO`,
      id: FlowPaymentMethod.PAGO_EFECTIVO,
    }*/,
    {
      name: 'Suscripción mensual',
      // description: 'Ahorra S/'+ (this.env.precioCreatinaOnePurchase - this.env.precioCreatinaSubscription).toString() + ' y llevate una creatina gratis + S/'+ this.env.creditoRegaloPorCompraMes.toString() + '.',
      description: 'Ahorra '+ this.env.creatina2025Descuento +' y llevate una creatina gratis.',
      icon: `RECURRENT_PAYMENT`,
      id: FlowPaymentMethod.RECURRENT_PAYMENT,
    }
  ];

  selectPaymentMethod( id: FlowPaymentMethod ) {
    this.paymentMethod.emit(id);
  }
}