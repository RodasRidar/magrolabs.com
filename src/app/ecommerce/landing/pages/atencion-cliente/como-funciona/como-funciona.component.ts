import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/env';
import { title } from 'process';

@Component({
  selector: 'app-como-funciona',
  standalone: true,
  imports: [],
  templateUrl: './como-funciona.component.html',
  styleUrl: './como-funciona.component.css'
})
export class ComoFuncionaComponent {
  ENV = environment
  list = [
    {
      title: '¿Cómo puedo registrarme en Magrolabs?',
      description: 'Con la suscripción de Magrolabs, recibirás una creatina de 250 gr cada mes directamente en tu puerta, asegurándote de nunca quedarte sin energía ni rendimiento. Al registrarte, obtienes tu primer producto (100 gr) totalmente gratis para que lo pruebes durante ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion +
        ' días. Si no estás satisfecho, puedes cancelar sin costo dentro de ese período. Pasado ese tiempo, tu suscripción se activará automáticamente con una política de cancelación de un mes.',
    },
    {
      title: '¿Cómo funciona la primera creatina gratis?',
      description: 'Al registrarte en Magrolabs, recibirás tu primer suplemento totalmente gratis para que lo pruebes sin compromiso. Queremos que estés seguro de tu elección, por eso te damos ' + 
      this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días de prueba para usarlo, evaluarlo y decidir. Durante este período, puedes cancelar tu suscripción en cualquier momento sin costo. Si decides continuar, tu suscripción se activará y recibirás la mejor creatina cada mes para mantener tu rendimiento al máximo.',
    },
    {
      title: '¿Que es Magrolabs?',
      description: 'Magrolabs nació con la idea de revolucionar la suplementación deportiva y hoy ofrece planes de suscripción mensuales adaptados a distintos estilos de vida y lo mejor de todo es que somos ecofriendly 🌱. Como miembro, recibirás un suplemento único cada mes directamente en tu hogar. Ofrecemos planes para diferentes objetivos: desde creatina pura para fuerza y resistencia, hasta combinaciones funcionales para enfoque, energía o recuperación. ¿Quieres más de un producto? Después de registrarte, puedes añadir fácilmente suplementos adicionales a tu suscripción y mantener siempre tu rendimiento al máximo.',
    },
    {
      title: '¿Cómo funciona una suscripción de Magrolabs?',
      description: 'Magrolabs te ofrece una suscripción mensual única de suplementos. Como miembro, recibirás una cada mes, por una tarifa fija, un suplemento de alta calidad directamente en tu puerta. Puedes elegir entre diferentes planes según tus objetivos: fuerza, energía, enfoque o recuperación. ¡Tu primer suplemento es totalmente gratis! Luego de recibirlo, tendrás un período de prueba de '
      + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días para decidir si deseas continuar. Durante ese tiempo, puedes cancelar sin costo alguno. Si decides seguir, tu suscripción se activará y cada mes se realizará el cobro automáticamente, con entregas puntuales para que nunca te falte lo que necesitas para rendir al máximo. También puedes sumar más productos cuando quieras.'
    },
    {
      title: '¿Cómo funciona el período de prueba?',
      description:'Después de recibir tu creatina de '+ this.ENV.creatinaFreeGramos + ' gr gratis, comienza tu período de prueba de '+ this.ENV.diasNormalesDePruebaOperiodoDeReflexion +' días. Durante el período, puedes cancelar tu suscripción de forma gratuita en cualquier momento. Después de estos '+ this.ENV.diasNormalesDePruebaOperiodoDeReflexion +' días, tu suscripción se convertirá automáticamente en una suscripción de pago, y recibirás una creatina en tu puerta cada mes.'
    }
  ]

}
