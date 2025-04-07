import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/env';

@Component({
  selector: 'app-programa-loyalty',
  standalone: true,
  imports: [],
  templateUrl: './programa-loyalty.component.html',
  styleUrl: './programa-loyalty.component.css'
})
export class ProgramaLoyaltyComponent {
  ENV = environment
  list = [
    {
      title: '¿Para quién es el Programa Loyalty?',
      description: 'El Programa Loyalty de Magrolabs es para todos nuestros clientes registrados. Al unirte, acumulas créditos automáticamente y sin costo alguno. Cada mes, recibes crédito en nuestra tienda que puedes usar para tus próximas compras. ¡Mientras más tiempo seas parte del programa, más beneficios recibirás!',
    },
    {
      title: '¿Cómo funciona el Programa Loyalty?',
      description: 'Al registrarte en Magrolabs, participas automáticamente en el Programa Loyalty. Recibes S/'+this.ENV.creditoRegaloPorCompraMes +' crédito en crédito mensual que se deposita en tu cuenta después de una compra exitosa. El crédito se acumula en tu billetera virtual y puedes canjearlo por productos exclusivos. Puedes ganar crédito extra invitando amigos con tu enlace personal (hasta S/'+(2*this.ENV.creditoRegaloPorCompraMes) +' por referidos). El crédito no es reembolsable en efectivo ni se puede transferir entre cuentas. Si cancelas, el crédito caduca. Si pausas, el crédito se congela. Los costos de envío deben pagarse en efectivo.',
    },
    {
      title: '¿Qué puedo hacer con el crédito?',
      description: 'Puedes canjear el crédito acumulado por productos exclusivos de Magrolabs, como ropa deportiva, accesorios o suplementos seleccionados. No se puede canjear por dinero ni usar para pagar suscripciones. El crédito tampoco se puede combinar entre cuentas.',
    },
    {
      title: '¿Puedo conseguir crédito extra?',
      description: '¡Sí! Comparte tu enlace personal desde tu cuenta Magrolabs con amigos y conocidos. Por cada nuevo registro que realice una compra, recibes S/10 de crédito adicional, hasta un máximo de S/20 por mes. Comparte sin límites y acumula más beneficios.',
    },
    {
      title: '¿Qué puedo hacer con el crédito?',
      description: 'Puedes canjear el crédito acumulado por artículos exclusivos en la tienda de Magrolabs, como ropa deportiva, accesorios y productos seleccionados. El crédito no se puede canjear por efectivo ni utilizar para pagos pendientes de una suscripción, y no puede combinarse entre varias cuentas.',
    },
    {
      title: '¿Qué sucede si hago una pausa?',
      description: 'Durante tu período de pausa, congelamos tu crédito. Conservas tu crédito acumulado, pero no recibes crédito mensualmente mientras estás en pausa. Durante este período, no puedes canjear tu crédito en la tienda web para obtener artículos exclusivos.',
    },
    {
      title: '¿Qué pasa con mi crédito si cancelo o pauso mi suscripción?',
      description: 'Si cancelas tu suscripción, perderás el crédito acumulado. Si pausas tu suscripción, conservarás el crédito, pero no podrás usarlo ni seguir acumulando mientras esté en pausa. El crédito se reactivará cuando reanudes tu suscripción.',
    },
    {
      title: '¿Puedo comprar productos usando solo crédito?',
      description: 'Sí, puedes usar exclusivamente el crédito acumulado para comprar productos de la tienda de Magrolabs. Sin embargo, los gastos de envío no se cubren con crédito y deben pagarse con dinero real durante el proceso de compra.',
    }
    
  ];
  
}
