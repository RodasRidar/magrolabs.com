import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/env';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [],
  templateUrl: './privacidad.component.html',
  styleUrl: './privacidad.component.css'
})
export class PrivacidadComponent {
  ENV = environment
  list = [
    {
      title: '¿Qué información recopilamos sobre usted?',
      description: [
        'Recopilamos información personal que usted nos proporciona, como su nombre, dirección, correo electrónico, número de teléfono, fecha de nacimiento, detalles de pago, así como los mensajes que envía a nuestro Servicio de Atención al Cliente. Además, obtenemos datos analíticos que usted proporciona directa o indirectamente a través de nuestro sitio web y redes sociales, incluyendo registros de cuenta, visitas al sitio web, datos de redes sociales como hashtags, publicaciones, menciones o referencias a nuestra marca, cookies del sitio web, y sus acciones o respuestas frente a nuestras campañas de marketing.'
      ]
    },
  ]
  fechaUltimaActualizacion = this.ENV.fechaUltimaActualizacionPrivacidad

}
