import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/env';
import { title } from 'process';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [],
  templateUrl: './pago.component.html',
  styleUrl: './pago.component.css'
})
export class PagoComponent {
  ENV = environment
  list = [
    {
      title: '¿Cuánto cuesta una suscripción de Magrolabs?',
      description: 'Creatina Magrolabs suscripción mensual de '+ this.ENV.creatinaSubscription250 +'g a S/' + this.ENV.precioCreatinaSubscription + ' y Creatina Magrolabs suscripción anual de '+ this.ENV.creatina3kg +'Kg a S/' + this.ENV.precioCreatina3kgSubscription + '',
    },
    {
      title: '¿Por qué se me cobran tarifas de verificación?',
      description: 'El cobro sera devuelto. Al registrarte, te pedimos que realices un pago de verificación. Esto es para vincular los datos de pago a la cuenta correcta y evitar abusos de la suscripción.',
    },
    {
      title: '¿Por qué se me cobran tarifas de verificación?',
      description: 'Después de que finalice el período de prueba, los costos de tu(s) suscripción(es) se cobrarán cada mes alrededor del día '+this.ENV.diaDeCobroSubscripcion +'. Utilizamos la tarjeta que asociaste al momento de la inscripción. Al verificar tu método de pago, aceptas los débitos mensuales. Si por alguna razón no se pudo realizar el cargo, recibirás varios recordatorios de pago por correo electrónico para que puedas realizar el pago.',
    },
    {
      title: 'Tengo un pago pendiente.',
      description: 'Es posible que en alguna ocasión te olvides de un pago o que no se pueda cobrar el importe. Puedes pagar fácil y seguramente el pago pendiente a través de tu cuenta o a través del recordatorio de pago en tu correo electrónico. Con un pago pendiente, no se enviarán productos.'
      + ' Al verificar tus datos de pago, autorizas los cobros automáticos mensuales. Al cancelar tu suscripción, se aplica un período de cancelación de un mes y tienes una obligación de pago.',
    },
    {
      title: '¿Cómo puedo parar los cobros automáticos?',
      description: 'Solo puedes parar los pagos automáticos pausando o cancelando tu suscripción. Esto lo puedes hacer fácilmente tú mismo en tu cuenta en la página "Suscripciones". Al verificar tus datos de pago, aceptaste el cobro mensual.',
    },
    {
      title: 'No he recibido aún mi creatina gratis, y ya se ha realizado un cobro.',
      description: 'Tu creatina gratuita se envió inmediatamente después de completar tu registro. Te enviamos un correo electrónico sobre la finalización de tu período de reflexión de '+this.ENV.diasNormalesDePruebaOperiodoDeReflexion +' días. Tu suscripción ha comenzado y ahora está activa. Después del período de reflexión, realizaremos cobros mensuales alrededor del día '+this.ENV.diaDeCobroSubscripcion +' del mes. La entrega de ese pedido siempre se realiza entre el día '+ this.ENV.plazoDeEntregaMensualesCreatina.min+' y el '+ this.ENV.plazoDeEntregaMensualesCreatina.max+' del mes siguiente. '+
      '¿No has recibido un correo electrónico nuestro sobre la finalización de tu período de reflexión? Verifica si has usado la dirección de correo electrónico correcta al registrarte y también revisa tu carpeta de Spam.',
    },
    {
      title: 'He hecho un pago, pero no he recibido nada aún.',
      description: 'En Magrolabs siempre pagas el mes por adelantado. El cobro mensual siempre se realiza alrededor del día '+this.ENV.diaDeCobroSubscripcion +' del mes. Siempre recibirás la entrega mensual entre el día '+ this.ENV.plazoDeEntregaMensualesCreatina.min+' y el '+ this.ENV.plazoDeEntregaMensualesCreatina.max+' del mes siguiente. ¿Crees que te falta un pedido? Puedes verificarlo en "Pedidos" en tu cuenta. Si algo no está bien o tienes alguna pregunta sobre tu entrega, por favor contáctanos.',
    },
    {
      title:'¿Por qué estoy recibiendo recordatorios de pago?',
      description: 'Probablemente recibes recordatorios de pago porque tienes un pago pendiente con nosotros. Inicia sesión en tu cuenta y revisa tus suscripciones. Si ya has realizado un pago pendiente, te recomendamos esperar un poco, procesar el pago puede tardar hasta 48 horas.'
    }
  ]
}
