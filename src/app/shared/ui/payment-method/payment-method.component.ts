import { Component, inject, output } from '@angular/core';
import { SummaryService } from '../../services/summary-service.service';
import { id } from 'apicache';

@Component({
  selector: 'app-payment-method',
  standalone: true,
  imports: [],
  templateUrl: './payment-method.component.html',
  styleUrl: './payment-method.component.css'
})
export class PaymentMethodComponent {
  private _summaryService = inject(SummaryService);

  ngOnInit(): void {
    this.paymentMethod.emit('Tarjeta');

    const last4CardDigits = this._summaryService.getSummary()?.userData?.last4CardDigits || '';
    const creditCardType = this._summaryService.getSummary()?.userData?.creditCardType || '';

    if(this._summaryService.getSummary()?.userData?.isPaymentVerified) {
      this.radios.unshift({
        name: '**** **** **** ' + last4CardDigits + ' (' + creditCardType + ')',
        description: 'Paga con tu tarjeta '+ creditCardType + 'que termina en ' + last4CardDigits + ' registrada en tu cuenta.',
        icon: `CARD`,
        id: '3',
      })
    }
  }
  paymentMethod = output<'Tarjeta'| 'Trasnferencia'| 'Tarjeta Enrolada'>()
    
  radios = [
    {
      name: 'Tarjetas, Yape y otras billeteras',
      description: 'Paga con tarjeta de débito/crédito, escaneando el código QR desde tu billetera electrónica o con el código de aprobación de Yape.',
      icon: `CARD`,
      id: '1',
    },
    {
      name: 'Transferencia bancaria',
      description: 'Paga por transferencia bancaria de los principales bancos: BCP, Interbank, BBVA, Scotiabank.',
      icon: ``,
      id: '2',
    },
  ];

  selectPaymentMethod( id: string ) {
    if ( id === 'Tarjetas, Yape y otras billeteras' ) {
    } 
    else {
      this.paymentMethod.emit('Trasnferencia');
    }
    switch (id) {
      case '1':
        this.paymentMethod.emit('Tarjeta');
        break;
      case '2':
        this.paymentMethod.emit('Trasnferencia');
        break;
      case '3':
        this.paymentMethod.emit('Tarjeta Enrolada');
        break;
    }
  }
}