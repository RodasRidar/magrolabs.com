import { Component, inject, OnInit } from '@angular/core';
import { environment } from '../../../../../../environments/env';
import { SeoService } from '../../../../../shared/services/seo.service';

@Component({
    selector: 'app-como-funciona',
    imports: [],
    templateUrl: './como-funciona.component.html',
    styleUrl: './como-funciona.component.css'
})
export class ComoFuncionaComponent implements OnInit {
  private readonly _seo = inject(SeoService);
  
  ENV = environment;

  ngOnInit(): void {
    this.loadSEO();
  }

  list = [
    {
      title: '¿Cómo puedo registrarme en Magrolabs?',
      description: 'Con la suscripción de Magrolabs, recibirás una creatina de 250 gr cada mes directamente en tu puerta, asegurándote de nunca quedarte sin energía ni rendimiento. Al registrarte, obtienes tu primer producto (100 gr) ' + this.ENV.campanaPrimeraCreatina.textos.ofertaMedia + ' para que lo pruebes durante ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion +
        ' días. Si no estás satisfecho, puedes cancelar sin costo dentro de ese período. Pasado ese tiempo, tu suscripción se activará automáticamente con una política de cancelación de un mes.',
    },
    {
      title: '¿Cómo funciona la primera creatina?',
      description: 'Al registrarte en Magrolabs, recibirás tu primer suplemento ' + this.ENV.campanaPrimeraCreatina.textos.ofertaMedia + ' para que lo pruebes sin compromiso. Queremos que estés seguro de tu elección, por eso te damos ' + 
      this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días de prueba para usarlo, evaluarlo y decidir. Durante este período, puedes cancelar tu suscripción en cualquier momento sin costo. Si decides continuar, tu suscripción se activará y recibirás la mejor creatina cada mes para mantener tu rendimiento al máximo.',
    },
    {
      title: '¿Que es Magrolabs?',
      description: 'Magrolabs nació con la idea de revolucionar la suplementación deportiva y hoy ofrece planes de suscripción mensuales adaptados a distintos estilos de vida y lo mejor de todo es que somos eco amigable 🌱. Como miembro, recibirás un suplemento único cada mes directamente en tu hogar. Ofrecemos planes para diferentes objetivos: desde creatina pura para fuerza y resistencia, hasta combinaciones funcionales para enfoque, energía o recuperación. ¿Quieres más de un producto? Después de registrarte, puedes añadir fácilmente suplementos adicionales a tu suscripción y mantener siempre tu rendimiento al máximo.',
    },
    {
      title: '¿Cómo funciona una suscripción de Magrolabs?',
      description: 'Magrolabs te ofrece una suscripción mensual única de suplementos. Como miembro, recibirás una cada mes, por una tarifa fija, un suplemento de alta calidad directamente en tu puerta. Puedes elegir entre diferentes planes según tus objetivos: fuerza, energía, enfoque o recuperación. ¡Tu primer suplemento es ' + this.ENV.campanaPrimeraCreatina.textos.ofertaMedia + '! Luego de recibirlo, tendrás un período de prueba de '
      + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días para decidir si deseas continuar. Durante ese tiempo, puedes cancelar sin costo alguno. Si decides seguir, tu suscripción se activará y cada mes se realizará el cobro automáticamente, con entregas puntuales para que nunca te falte lo que necesitas para rendir al máximo. También puedes sumar más productos cuando quieras.'
    },
    {
      title: '¿Cómo funciona el período de prueba?',
      description:'Después de recibir tu creatina de '+ this.ENV.creatinaFreeGramos + ' gr ' + this.ENV.campanaPrimeraCreatina.textos.ofertaMedia + ', comienza tu período de prueba de '+ this.ENV.diasNormalesDePruebaOperiodoDeReflexion +' días. Durante el período, puedes cancelar tu suscripción de forma gratuita en cualquier momento. Después de estos '+ this.ENV.diasNormalesDePruebaOperiodoDeReflexion +' días, tu suscripción se convertirá automáticamente en una suscripción de pago, y recibirás una creatina en tu puerta cada mes.'
    }
  ];

  private loadSEO(): void {
    const title = '¿Cómo Funciona Magrolabs? - Suscripción de Suplementos';
    const description = 'Descubre cómo funciona la suscripción mensual de Magrolabs. Obtén tu ' + this.ENV.campanaPrimeraCreatina.textos.heroOferta + ', pruébala por ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días y recibe suplementos de alta calidad cada mes.';
    const URL = 'https://magrolabs.com/atencion-cliente/como-funciona';
    const image = 'https://magrolabs.com/image-meta_55.webp';
    const keywords = 'cómo funciona Magrolabs, suscripción suplementos, creatina oferta, período de prueba, suplementos mensuales, Magrolabs Perú';

    // Configuración básica de SEO
    this._seo.setTitle(title);
    this._seo.setCanonicalURL(URL);
    this._seo.setDescription(description);
    this._seo.setKeywords(keywords);
    this._seo.setIndexFollow(true);

    // Open Graph para redes sociales
    this._seo.setOpenGraph({
      type: 'article',
      site_name: 'Magrolabs',
      title: title,
      description: description,
      image: image,
      url: URL,
      locale: 'es_PE',
    });

    // Twitter Cards
    this._seo.setTwitterCard({
      'twitter:card': 'summary_large_image',
      'twitter:url': URL,
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
      'twitter:image:alt': 'Cómo funciona la suscripción de Magrolabs',
    });

    // Hreflang para SEO internacional
    this._seo.setHreflangs([
      { lang: 'es', url: URL },
      { lang: 'en', url: URL },
      { lang: 'es-pe', url: URL },
      { lang: 'x-default', url: URL },
    ]);

    // Structured Data (JSON-LD) para Service (sin FAQPage para evitar duplicación)
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: title,
      url: URL,
      description: description,
      provider: {
        '@type': 'Organization',
        name: 'Magrolabs',
        url: 'https://magrolabs.com'
      },
      serviceType: 'Suplementos de Creatina por Suscripción',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: 'https://magrolabs.com'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Atención al Cliente',
            item: 'https://magrolabs.com/atencion-cliente'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Cómo Funciona',
            item: URL
          }
        ]
      },
      publisher: {
        '@type': 'Organization',
        name: 'Magrolabs',
        url: 'https://magrolabs.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://magrolabs.com/logo-magrolabs.png'
        }
      },
      about: {
        '@type': 'Service',
        name: 'Suscripción de Suplementos Magrolabs',
        description: 'Servicio de suscripción mensual de suplementos deportivos con período de prueba gratuito',
        provider: {
          '@type': 'Organization',
          name: 'Magrolabs'
        },
        offers: {
          '@type': 'Offer',
          description: this.ENV.campanaPrimeraCreatina.textos.heroOfertaMayuscula + ' con período de prueba de ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días',
          priceCurrency: 'PEN'
        }
      }
    };

    this._seo.setStructuredData(structuredData);
  }
}
