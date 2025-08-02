import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/env';
import { title } from 'process';

@Component({
  selector: 'app-cambio',
  standalone: true,
  imports: [],
  templateUrl: './cambio.component.html',
  styleUrl: './cambio.component.css'
})
export class CambioComponent {

  ENV = environment
  list = [
    {
      title: '¿Cuándo puedo hacer una solicitud de cambio?',
      description: 'Ofrecemos una garantía de satisfacción de '+ this.ENV.garantíaDeSatisfacción+' días: si no has recibido tu entrega, si recibiste un producto incorrecto o si surge algún problema dentro de los 90 días, puedes solicitar un nuevo envío poniendo en contacto con nosotros. En Magrolabs, priorizamos tu experiencia y queremos que siempre tengas lo que necesitas para rendir al máximo. Para más información, consulta la sección de Servicio de Atención al Cliente.'
    },
    {
      title: '¿Cómo presento una solicitud de cambio?',
      description: '¿No has recibido tu pedido después de los '+this.ENV.plazoDeEntregaDiasHabiles.max+' días hábiles? No te preocupes. Puedes presentar fácilmente una solicitud de cambio contáctandote directamente con nosotros y estaremos encantados de ayudarte.'
    },
    {
      title: '¿Cómo devuelvo un producto incorrecto?',
      description: 'En Magrolabs, no es necesario devolver un producto incorrecto. Si el producto llegó en buen estado, puedes compartirlo o regalarlo a alguien más. Nosotros no solicitamos devoluciones ni realizamos reembolsos en estos casos. En cambio, te enviaremos una nueva entrega del producto correcto sin costo adicional para ti.'
    },
    {
      title : '¿Cómo devuelvo un producto de la Webshop?',
      description: 'Magrolabs ha implementado un programa de lealtad en el que los clientes pueden solicitar la devolución de productos a través de el contacto de atención al cliente de WhatsApp, completando un formulario y enviando el paquete con el formulario adjunto. Los gastos de devolución serán cubiertos por el cliente. Solo se aceptan productos no usados y con la etiqueta original. Una vez recibida la devolución, se reembolsará el crédito en un plazo de '+this.ENV.diasReembolsoCreditosLoyaltyWebshop+' días, el cual podrá ser utilizado para adquirir otros productos dentro del programa de lealtad. No se permiten cambios solo devoluciones.'
    }
  ]
}
