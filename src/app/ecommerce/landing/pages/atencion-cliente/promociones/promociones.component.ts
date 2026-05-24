import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/env';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';

@Component({
    selector: 'app-promociones',
    imports: [IconComponent],
    templateUrl: './promociones.component.html',
    styleUrl: './promociones.component.css'
})
export class PromocionesComponent {
ENV = environment
list = [
  {
    title: this.ENV.campanaPrimeraCreatina.textos.promocionTitulo,
    description: this.ENV.campanaPrimeraCreatina.textos.promocionRespuesta(this.ENV.plazoDeEntregaHorasCreatinaFree.max, this.ENV.diasNormalesDePruebaOperiodoDeReflexion),
  },
  {
    title: this.ENV.campanaPrimeraCreatina.textos.faqTituloRecepcion,
    description: this.ENV.campanaPrimeraCreatina.textos.faqRespuestaRecepcion(this.ENV.plazoDeEntregaHorasCreatinaFree.min, this.ENV.plazoDeEntregaHorasCreatinaFree.max) + ' Durante los primeros '+this.ENV.diasNormalesDePruebaOperiodoDeReflexion +' días, puedes probar tranquilamente tu creatina de 100 gramos, este es tu período de prueba.',
  }
]
}
