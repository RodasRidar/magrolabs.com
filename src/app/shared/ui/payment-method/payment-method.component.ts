import { Component, output } from '@angular/core';

@Component({
  selector: 'app-payment-method',
  standalone: true,
  imports: [],
  templateUrl: './payment-method.component.html',
  styleUrl: './payment-method.component.css'
})
export class PaymentMethodComponent {
  ngOnInit(): void {
    this.paymentMethod.emit('Tarjeta');
  }
  paymentMethod = output<'Tarjeta'| 'Trasnferencia'>()
    
  radios = [
    {
      name: 'Tarjetas, Yape y otras billeteras',
      description: 'Paga con tarjeta de débito/crédito, escaneando el código QR desde tu billetera electrónica o con el código de aprobación de Yape.',
      icon: `CARD`,
    },
    {
      name: 'Transferencia bancaria',
      description: 'Paga por transferencia bancaria de los principales bancos: BCP, Interbank, BBVA, Scotiabank.',
      icon: ``,
    },
  ];

  selectPaymentMethod( name: string ) {
    if ( name === 'Tarjetas, Yape y otras billeteras' ) {
      this.paymentMethod.emit('Tarjeta');
    } else {
      this.paymentMethod.emit('Trasnferencia');
    }
  }
}