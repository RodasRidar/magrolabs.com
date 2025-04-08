import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/env';

@Component({
  selector: 'app-terminos-y-condiciones',
  standalone: true,
  imports: [],
  templateUrl: './terminos-y-condiciones.component.html',
  styleUrl: './terminos-y-condiciones.component.css'
})
export class TerminosYCondicionesComponent {
  ENV = environment
  list = [
    {
      title: 'Artículo 1 - Definiciones',
      description: [
        '',
        ''
      ]
    },
    {
      title: 'Artículo 2 - Identidad del empresario',
      description: [
        '',
        ''
      ]
    },
    {
      title: 'Artículo 3 - Aplicabilidad',
      description: [
        '',
        ''
      ]
    },
    {
      title: 'Artículo 4 - La oferta',
      description: [
        '',
        ''
      ]
    },
    {
      title: 'Artículo 5 - El acuerdo',
      description: [
        '',
        ''
      ]
    },
    {
      title: 'Artículo 6 - Derecho de desistimiento en la entrega de productos',
      description: [
        '',
        ''
      ]
    },
    {
      title: 'Artículo 7 - Costes en caso de retirada',
      description: [
        '',
        ''
      ]
    },
    {
      title: 'Artículo 8 - Exclusión del derecho de revocación',
      description: [
        '',
        ''
      ]
    },
    {
      title: 'Artículo 9 - El precio',
      description: [
        '',
        ''
      ]
    },
    {
      title: 'Artículo 10 - Conformidad y garantía',
      description: [
        '',
        ''
      ]
    },
    {
      title: 'Artículo 11 - Entrega y realización',
      description: [
        '',
        ''
      ]
    },
    {
      title: 'Artículo 12 - Duración de las transacciones',
      description: [
        '',
        ''
      ]
    },
    {
      title: 'Artículo 13 - Pago',
      description: [
        '',
        ''
      ]
    },
    {
      title: 'Artículo 14 - Procedimiento de reclamación',
      description: [
        '',
        ''
      ]
    },
    {
      title: 'Artículo 15 - Litigios',
      description: [
        '',
        ''
      ]
    },
    {
      title: 'Artículo 16 - Disposiciones adicionales o divergentes',
      description: [
        '',
        ''
      ]
    },
  ]

  fechaUltimaActualizacion = this.ENV.fechaUltimaActualizacionTerminosCondiciones

}
