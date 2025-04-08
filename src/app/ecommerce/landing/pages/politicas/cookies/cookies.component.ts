import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/env';

@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [],
  templateUrl: './cookies.component.html',
  styleUrl: './cookies.component.css'
})
export class CookiesComponent {  
  ENV = environment
  list = [
    {
      title: '¿Qué son las cookies?',
      description: [
        'Las cookies son pequeños archivos de datos almacenados en tu computador o dispositivo móvil por un sitio web. Transmiten información sobre tu uso de cada sitio web a tu equipo y/o a los terceros que colocaron la cookie.'
      ]
    },
    {
      title: '¿Cómo usamos las cookies?',
      description: [
        'Nuestros sitios y aplicaciones utilizan tanto cookies de sesión como persistentes para permitir diversas funcionalidades, como iniciar sesión y utilizar nuestras plataformas, almacenar tus preferencias y configuraciones, analizar su funcionamiento, personalizar tu experiencia, ofrecer publicidad basada en tus intereses y cumplir con fines legales. Además, podemos emplear tecnologías similares, como identificadores únicos de dispositivos (por ejemplo, direcciones IP) y softwares de terceros integrados en nuestras aplicaciones móviles. En ciertos casos, estas cookies y tecnologías similares también pueden ser utilizadas por terceros.'
      ]
    },
    {
      title: 'Tipos de cookies',
      description: [
        'Las cookies que utilizamos se clasifican en las siguientes categorías:',
        '1. Cookies estrictamente necesarias: Estas cookies son esenciales para el funcionamiento de nuestro sitio web y no pueden ser desactivadas en nuestros sistemas. Generalmente, solo se configuran en respuesta a acciones realizadas por ti, como configurar tus preferencias de privacidad, iniciar sesión o completar formularios.',
        '2. Cookies de rendimiento: Estas cookies nos permiten contar las visitas y las fuentes de tráfico, para que podamos medir y mejorar el rendimiento de nuestro sitio. Nos ayudan a saber qué páginas son las más y menos populares y a ver cómo los visitantes navegan por el sitio. Toda la información que recogen estas cookies es agregada y, por lo tanto, anónima. Si no permites estas cookies, no sabremos cuándo has visitado nuestro sitio y no podremos monitorear su rendimiento.',
        '3. Cookies de funcionalidad: Estas cookies permiten que nuestro sitio web ofrezca una mejor funcionalidad y personalización. Pueden ser configuradas por nosotros o por terceros cuyos servicios hemos agregado a nuestras páginas. Si no permites estas cookies, es posible que algunas o todas estas funcionalidades no funcionen correctamente.',
        '4. Cookies de publicidad: Estas cookies pueden ser configuradas a través de nuestro sitio por nuestros socios publicitarios. Pueden ser utilizadas por estas empresas para crear un perfil de tus intereses y mostrarte anuncios relevantes en otros sitios. No almacenan información personal directamente, pero se basan en la identificación única de tu navegador y dispositivo de Internet. Si no permites estas cookies, recibirás publicidad menos dirigida.'
      ]
    },
    {
      title: '¿Qué tipo de problemas puede tener un cliente que desactiva las cookies?',
      description: [
        'Si desactiva las cookies, el sitio web no podrá adaptar los contenidos a sus preferencias personales ni realizar análisis sobre los visitantes y el tráfico, lo que dificultará la medición del comportamiento de los usuarios y la mejora de la experiencia. Además, la web no podrá distinguir si usted es una persona o una aplicación automatizada que publica spam. Dado que todas las redes sociales utilizan cookies, al desactivarlas no podrá acceder a ninguna de ellas. También podría perder el historial de productos guardados en la bolsa de compra, su wishlist y otras funcionalidades personalizadas.'
      ],
    }
  ]
  fechaUltimaActualizacion = this.ENV.fechaUltimaActualizacionPrivacidad


}
