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
      description: 'Puedes pausar fácilmente tu suscripción en tu cuenta. A partir del día ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + '(Período de prueba) desde tu registro. Puedes pausarla durante un máximo de 3 meses. Ve a "Mi Suscripción" en tu cuenta. Haz clic en el botón ‘Cancelar suscripción’ en la parte inferior de la página y luego selecciona un motivo: "Tengo suficientes creatina por ahora, se me está acumulando." para continuar con la pausa. Recibirás un correo electrónico de confirmación de tu pausa con toda la información (revisa la carpeta de spam si no lo encuentras). Una vez que haya terminado tu pausa, tu suscripción se reanudará automáticamente. ¿Quieres pausar varias suscripciones? Ten en cuenta que deberás pausarlas por separado.',
    },
    {
      title: '¿Cómo funciona la cancelación?',
      description: 'Puedes cancelar fácilmente tu suscripción en tu cuenta. Ve a "Mi Suscripción" en tu cuenta. Haz clic en el botón "Cancelar suscripción". Durante tu período de prueba de ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días, puedes cancelar de inmediato. Después del período de prueba y con una suscripción activa, aplicamos un período de cancelación de ' + this.ENV.diasAntesDeSiguienteCobroSubscripcion + ' días antes de tu fecha de facturación. Después de tu cancelación, recibirás de inmediato un correo electrónico de confirmación de la cancelación con el mes de tu último pago y entrega. Siempre puedes ver el estado de tus suscripciones en tu cuenta. Cuando el estado de tu suscripción es "Cancelado" o "Por Cancelar", tu cancelación se ha procesado.',
    },
    {
      title: '¿Hay un período de cancelación?',
      description: 'Cuando te registras por primera vez en Magrolabs, tienes un período de prueba de ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días. Este comienza después de que recibas tu primera entrega. Durante el período de prueba de ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días, puedes cancelar tu membresía de inmediato. Después del período de prueba y con una membresía activa, aplicamos un período de cancelación de ' + this.ENV.diasAntesDeSiguienteCobroSubscripcion + ' días antes de tu fecha de facturación. Después de tu cancelación, recibirás de inmediato un correo electrónico de confirmación de la cancelación con el mes de tu último pago y entrega (revisa la carpeta de spam si no lo encuentras).',
    },
  ];

}
