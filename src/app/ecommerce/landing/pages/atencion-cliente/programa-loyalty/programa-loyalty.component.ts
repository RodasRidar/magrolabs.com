import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/env';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';

@Component({
    selector: 'app-programa-loyalty',
    imports: [IconComponent],
    templateUrl: './programa-loyalty.component.html',
    styleUrl: './programa-loyalty.component.css'
})
export class ProgramaLoyaltyComponent {
  ENV = environment
  list = [
    {
      title: '¿Para quién es el Programa de Lealtad?',
      description: 'El Programa de Lealtad de Magrolabs es nuestro programa de fidelización para todos nuestros clientes registrados. Al unirte, acumulas Magropuntos automáticamente y sin costo alguno. Cada mes, recibes '+this.ENV.creditoRegaloPorCompraMes +' Magropuntos en nuestra Webshop de Lealtad, que puedes usar para comprar nuestros productos exclusivos. ¡Mientras más tiempo seas parte del programa, más beneficios recibirás!',
    },
    {
      title: '¿Cómo funciona el Programa de Lealtad?',
      description: 'Al registrarte en Magrolabs, participas automáticamente en el Programa de Lealtad. Recibes '+this.ENV.creditoRegaloPorCompraMes +' Magropuntos mensualmente que se deposita en tu cuenta Magrolabs después de una compra exitosa. Los Magropuntos se acumulan en Magrolabs y puedes canjearlos por productos exclusivos. Puedes ganar Magropuntos extra invitando amigos con tu enlace personal (hasta '+(2*this.ENV.creditoRegaloPorCompraMes) +' Magropuntos por referir). Los Magropuntos no son reembolsables en efectivo ni se pueden transferir entre cuentas. Si cancelas, los Magropuntos caducan. Si pausas, los Magropuntos se congelan. Los costos de envío deben pagarse en efectivo.',
    },
    {
      title: '¿Qué puedo hacer con los Magropuntos?',
      description: 'Puedes canjear los Magropuntos acumulados por productos exclusivos de Magrolabs, como ropa deportiva, accesorios o suplementos seleccionados. No se puede canjear por dinero ni usar para pagar suscripciones. Los Magropuntos tampoco se pueden combinar entre cuentas.',
    },
    {
      title: '¿Puedo conseguir Magropuntos extra?',
      description: '¡Sí! Comparte tu enlace personal desde tu cuenta Magrolabs con amigos y conocidos. Por cada nuevo registro que realice una compra, recibes 10 Magropuntos adicionales, hasta un máximo de 20 Magropuntos por referir. Puedes compartir sin límites mientras acumulas más beneficios.',
    },
    {
      title: '¿Qué puedo hacer con los Magropuntos?',
      description: 'Puedes canjear los Magropuntos acumulados por artículos exclusivos en la Webshop de Magrolabs, como ropa deportiva, accesorios y productos seleccionados. Los Magropuntos no se pueden canjear por efectivo ni utilizar para pagos pendientes de una suscripción, y no pueden combinarse entre varias cuentas.',
    },
    {
      title: '¿Qué sucede si hago una pausa?',
      description: 'Durante tu período de pausa, congelamos tus Magropuntos. Conservas tus Magropuntos acumulados, pero no recibes Magropuntos mensualmente mientras estás en pausa. Durante este período, no puedes canjear tus Magropuntos en la tienda web para obtener artículos exclusivos.',
    },
    {
      title: '¿Qué pasa con mis Magropuntos si cancelo o pauso mi suscripción?',
      description: 'Si cancelas tu suscripción, perderás los Magropuntos acumulados. Si pausas tu suscripción, conservarás los Magropuntos, pero no podrás usarlos ni seguir acumulando mientras esté en pausa. Los Magropuntos se reactivarán cuando reanudes tu suscripción.',
    },
    {
      title: '¿Puedo comprar productos usando solo Magropuntos?',
      description: 'Sí, puedes usar tus Magropuntos acumulados para comprar los productos de la Webshop de Magrolabs. Sin embargo, los gastos de envío no se cubren con Magropuntos y deben pagarse con dinero real durante el proceso de compra.',
    }
    
  ];
  
}
