import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/env';

@Component({
  selector: 'app-pausar-cancelar',
  standalone: true,
  imports: [],
  templateUrl: './pausar-cancelar.component.html',
  styleUrl: './pausar-cancelar.component.css'
})
export class PausarCancelarComponent {
  ENV = environment
  list = [
    {
      title: '¿Cómo funciona la pausa?',
      description: 'Puedes pausar fácilmente tu suscripción en tu cuenta. A partir del '+this.ENV.diasNormalesDePruebaOperiodoDeReflexion +'mo día desde tu registro, puedes pausar tu suscripción. Puedes pausarla durante un máximo de 3 meses. Ve a ‘Suscripciones’ en tu cuenta. Haz clic en el botón ‘Pausar o cancelar suscripción’ en la parte inferior de la página y luego selecciona el motivo: ‘Tengo suficientes calzoncillos por ahora’ para continuar con la pausa. Al pausar, aplicamos un período de cancelación de un mes. Por lo tanto, después de la pausa, aún habrá al menos un pago y una entrega más. Recibirás un correo electrónico de confirmación de tu pausa con toda la información. Una vez que haya terminado tu pausa, tu suscripción se reanudará automáticamente. ¿Quieres pausar varias suscripciones? Ten en cuenta que deberás pausarlas por separado.',
    },
    {
      title: '¿Cómo funciona la cancelación?',
      description: 'Puedes cancelar fácilmente tu suscripción en tu cuenta. Ve a "Suscripciones" en tu cuenta. Haz clic en el botón "Pausar o cancelar suscripción" en la parte inferior de la página para cancelar tu suscripción. Durante tu período de reflexión de '+this.ENV.diasNormalesDePruebaOperiodoDeReflexion +' días, puedes cancelar de inmediato. Después del período de prueba y con una suscripción activa, aplicamos un período de cancelación de un mes. Después de tu cancelación, recibirás de inmediato un correo electrónico de confirmación de la cancelación con el mes de tu último pago y entrega. Siempre puedes ver el estado de tus suscripciones en tu cuenta. Cuando el estado es "inactivo" o "próximamente inactivo", tu cancelación se ha procesado.',
    },
    {
      title: '¿Hay un período de cancelación?',
      description: 'Cuando te registras por primera vez en Magrolabs, tienes un período de reflexión de '+this.ENV.diasNormalesDePruebaOperiodoDeReflexion +' días. Este comienza después de que recibas tu primera entrega. Durante el período de reflexión de '+this.ENV.diasNormalesDePruebaOperiodoDeReflexion +' días, puedes cancelar tu membresía de inmediato. Después del período de reflexión y con una membresía activa, aplicamos un período de cancelación de un mes. Después de tu cancelación, recibirás de inmediato un correo electrónico de confirmación de la cancelación con el mes de tu último pago y entrega.',
    },
  ];

}
