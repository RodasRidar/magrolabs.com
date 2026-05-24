import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/env';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';

@Component({
    selector: 'app-envio-entrega',
    imports: [IconComponent],
    templateUrl: './envio-entrega.component.html',
    styleUrl: './envio-entrega.component.css'
})
export class EnvioEntregaComponent {
  ENV = environment
  list = [
    {
      title: this.ENV.campanaPrimeraCreatina.textos.faqTituloRecepcion,
      description: 'Recibirás tu ' + this.ENV.campanaPrimeraCreatina.textos.heroOferta + ' de ' + this.ENV.creatinaFreeGramos + ' gr en un plazo de '+ this.ENV.plazoDeEntregaHorasCreatinaFree.max+' horas. Tan pronto como completes tu registro, tu pedido será enviado inmediatamente. Recuerda que cuentas con ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días de prueba para decidir si deseas continuar con tu suscripción.',
    },
    {
      title: '¿Cuándo recibiré mis entregas mensuales?',
      description: 'Las entregas mensuales las recibirás en un plazo de '+ this.ENV.plazoDeEntregaHoras.max + ' horas después de que se haya realizado tu pago automático. Todas las entregas se realizan dentro del mismo período y pueden llegar de forma separada si hay más de un producto en tu suscripción.',
    },
    {
      title: 'No he recibido mi(s) producto(s)',
      description: '¿No has recibido tu primer pedido después de las '+ this.ENV.plazoDeEntregaHoras.max+' horas? ¿O no te ha llegado la entrega mensual pasada la fecha estimada? No te preocupes, ponte en contacto con nosotros y lo solucionaremos rápidamente.',
    },
    {
      title: 'He recibido el producto incorrecto',
      description: '¡Lo sentimos! Si recibiste un producto incorrecto. En Magrolabs, no es necesario devolver un producto incorrecto. Si el producto llegó en buen estado, puedes compartirlo o regalarlo a alguien más. Nosotros no solicitamos devoluciones ni realizamos reembolsos en estos casos. En cambio, te enviaremos una nueva entrega del producto correcto sin costo adicional para ti. Si necesitas ayuda adicional, nuestro equipo de atención al cliente está listo para ayudarte.',
    }
  ];
}
