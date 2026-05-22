import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/env';
import { title } from 'process';

@Component({
    selector: 'app-pago',
    imports: [],
    templateUrl: './pago.component.html',
    styleUrl: './pago.component.css'
})
export class PagoComponent {
  ENV = environment
  list = [
    {
      title: '¿Cuánto cuesta una suscripción de Magrolabs?',
      description: 'La suscripción mensual de nuestra Creatina Magrolabs de '+ this.ENV.creatinaSubscription250 +'g solo cuesta S/' + this.ENV.precioCreatinaSubscription + ' al mes y nuestra suscripción anual Creatina Magrolabs de '+ this.ENV.creatina3kg +'Kg cuesta S/' + this.ENV.precioCreatina3kgSubscription + ' al año',
    },
    {
      title: '¿Por qué se hace una verificación?',
      description: 'Al registrarte, te pedimos que realices una verificación con tu tarjeta. Esto es para vincular los datos de pago a la cuenta correcta y evitar abusos de la suscripción.',
    },
    {
      title: '¿Cuando se realizarán los pagos?',
      description: 'Después de que finalice el período de prueba, los cobros de tu(s) suscripción(es) se harán automáticamente. Utilizamos la tarjeta que asociaste al momento de la inscripción. Al verificar tu método de pago, aceptas los débitos mensuales. Si por alguna razón no se pudo realizar el cargo, recibirás varios recordatorios de pago por correo electrónico para que puedas realizar el pago. Puedes confiar en que los pagos se realizan de forma segura y confiable gracias a Flow.',
    },
    {
      title: 'Tengo un pago pendiente.',
      description: 'Es posible que en alguna ocasión te olvides de un pago o que no se pueda cobrar el importe. Puedes pagar fácil y seguramente el pago pendiente a través de tu cuenta o a través del recordatorio de pago en tu correo electrónico. Con un pago pendiente, no se enviarán productos.'
      + ' Al verificar tus datos de pago, autorizas los cobros automáticos mensuales. Al cancelar tu suscripción, se aplica un período de cancelación de '+this.ENV.diasAntesDeSiguienteCobroSubscripcion+' días antes de tu fecha de facturación y tienes una obligación de pago.',
    },
    {
      title: '¿Cómo puedo parar los cobros automáticos?',
      description: 'Solo puedes parar los pagos automáticos pausando o cancelando tu suscripción. Esto lo puedes hacer fácilmente tú mismo en tu cuenta en la página "Mi Suscripción". Al verificar tus datos de pago, aceptaste el cobro mensual. Si quieres cancelar tu suscripción y no recibir una próxima entrega, deberias hacerlo '+this.ENV.diasAntesDeSiguienteCobroSubscripcion +' días antes de tu fecha de facturación.',
    },
    {
      title: 'No he recibido aún mi ' + this.ENV.campanaPrimeraCreatina.textos.heroOferta + ', y ya se ha realizado un cobro.',
      description: 'Tu ' + this.ENV.campanaPrimeraCreatina.textos.heroOferta + ' se envió inmediatamente después de completar tu registro. Te enviamos un correo electrónico sobre la finalización de tu período de reflexión de '+this.ENV.diasNormalesDePruebaOperiodoDeReflexion +' días. Tu suscripción ha comenzado y ahora está activa. Después del período de reflexión, realizaremos cobros mensuales en tu fecha de facturación que es la misma del inicio de tu suscripción. La entrega de ese pedido siempre se hará después del cobro'+
      ' ¿No has recibido un correo electrónico nuestro sobre la finalización de tu período de reflexión? Verifica si has usado la dirección de correo electrónico correcta al registrarte y también revisa tu carpeta de Spam.',
    },
    {
      title: 'He hecho un pago, pero no he recibido nada aún.',
      description: 'En Magrolabs siempre pagas el mes por adelantado. El cobro mensual siempre se realiza en tu fecha de facturación. Recibirás la entrega mensual después del cobro. ¿Crees que te falta un pedido? Puedes verificarlo en "Mis Pedidos" en tu cuenta. Si algo no está bien o tienes alguna pregunta sobre tu entrega, por favor contáctanos.',
    },
    {
      title:'¿Por qué estoy recibiendo recordatorios de pago?',
      description: 'Probablemente recibes recordatorios de pago porque tienes un pago pendiente con nosotros. Inicia sesión en tu cuenta y revisa tus suscripciones. Si ya has realizado un pago pendiente, te recomendamos esperar un poco, procesar el pago puede tardar hasta 48 horas.'
    }
  ]
}
