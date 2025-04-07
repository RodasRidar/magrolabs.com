import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/env';

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [],
  templateUrl: './promociones.component.html',
  styleUrl: './promociones.component.css'
})
export class PromocionesComponent {
ENV = environment
list = [
  {
    title: '¿Qué sucede después del período de prueba?',
    description: 'Después de completar tu registro, recibirás tu primer boxer gratis dentro de '+this.ENV.plazoDeEntregaDiasHabilesCreatinaFree.max +' días hábiles. Durante los primeros '+this.ENV.diasNormalesDePruebaOperiodoDeReflexion +' días, puedes probar tranquilamente tu creatina de 100g gratis, este es tu período de prueba. Luego, pasarás a una suscripción de pago y comenzarán tus pagos y entregas mensuales. ¿Te das de baja en tus primeros '+this.ENV.diasNormalesDePruebaOperiodoDeReflexion +' días? Entonces perderás tus beneficios gratis.',
  },
  {
    title: '¿Cuándo recibiré mi creatina gratis?',
    description: 'Recibirás tu primer boxer gratis dentro de 9 días hábiles. Durante los primeros '+this.ENV.diasNormalesDePruebaOperiodoDeReflexion +' días, puedes probar tranquilamente tu creatina de 100g gratis, este es tu período de prueba.',
  }
]
}
