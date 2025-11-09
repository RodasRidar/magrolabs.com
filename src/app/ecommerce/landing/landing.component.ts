import { Component, inject } from '@angular/core';
import { NavbarComponent, NavbarTypeEnum } from './components/navbar/navbar.component';
import { HeroComponent } from '././components/hero/hero.component';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/services/seo.service';
import { environment } from '../../../environments/env';
import { FooterComponent } from "./components/footer/footer.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NavbarComponent, HeroComponent, RouterLink, FooterComponent, CommonModule],
  templateUrl: './landing.component.html'
})
export class LandingComponent {
  private _seo = inject(SeoService)
  ENV = environment
  navbarTypeEnum = NavbarTypeEnum
  
  ngOnInit(): void {
    this.loadSEO();
  }

  private loadSEO() {
    const description = `¿Por qué Magrolabs? S/${this.ENV.precioCreatinaSubscription} por mes. ${this.ENV.campanaPrimeraCreatina.textos.heroOfertaMayuscula} - ${this.ENV.diasNormalesDePruebaOperiodoDeReflexion} días para pensártelo. Un plan de creatina de alta calidad ajustado a tus necesidades y con envío gratis.`;
    const title = 'Magrolabs Creatina';
    const URL = 'https://magrolabs.com';
    const image = 'https://magrolabs.com/image-meta_79.webp';
    const keywords = [
      'creatina'
    ];

    // SEO básico optimizado
    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setKeywords(keywords.join(', '));
    this._seo.setCanonicalURL(URL);
    this._seo.setIndexFollow(true);

    // Open Graph optimizado para redes sociales
    this._seo.setOpenGraph({
      type: 'website',
      site_name: 'Magrolabs',
      title: title,
      description: description,
      image: image,
      url: URL,
      locale: 'es_PE',
      'image:width': '1200',
      'image:height': '628',
      'image:alt': `Creatina Monohidrato Premium Magrolabs - ${this.ENV.campanaPrimeraCreatina.textos.heroOfertaMayuscula}`
    });

    // Twitter Cards optimizado
    this._seo.setTwitterCard({
      'twitter:card': 'summary_large_image',
      'twitter:site': '@magrolabs',
      'twitter:creator': '@magrolabs',
      'twitter:url': URL,
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
      'twitter:image:alt': `Creatina Monohidrato Premium - ${this.ENV.campanaPrimeraCreatina.textos.heroOfertaMayuscula} con Magrolabs`
    });

    // Hreflang para SEO internacional
    this._seo.setHreflangs([
      { lang: 'es', url: URL },
      { lang: 'es-pe', url: URL },
      { lang: 'x-default', url: URL }
    ]);

    // Schema.org - Datos estructurados para Organization
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Magrolabs',
      alternateName: 'Magro Labs',
      url: URL,
      logo: `${URL}/favicon.png`,
      description: 'Líder en suplementos deportivos de alta calidad en Perú. Especialistas en creatina monohidrato premium.',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: `+${this.ENV.telefonoAtencionClientes}`,
        contactType: 'customer service',
        email: this.ENV.emailAtencionClientes,
        availableLanguage: 'Spanish'
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'PE',
        addressLocality: 'Lima'
      },
      sameAs: [
        'https://www.facebook.com/magrolabs',
        'https://www.instagram.com/magrolabs',
        'https://twitter.com/magrolabs',
        'https://www.tiktok.com/@magrolabs',
      ],
      foundingDate: '2025',
      numberOfEmployees: '1-20',
      industry: 'Health and Wellness',
      serviceArea: {
        '@type': 'Country',
        name: 'Peru'
      }
    };

         // Schema.org - Website
     const websiteSchema = {
       '@context': 'https://schema.org',
       '@type': 'WebSite',
       name: 'Magrolabs',
       alternateName: 'Magrolabs Perú',
       url: URL,
       description: description,
       publisher: {
         '@type': 'Organization',
         name: 'Magrolabs'
       },
       potentialAction: {
         '@type': 'SearchAction',
         target: {
           '@type': 'EntryPoint',
           urlTemplate: `${URL}/productos/creatinas/{search_term_string}`
         },
         'query-input': 'required name=search_term_string'
       }
     };

    // Schema.org - Producto principal (Creatina)
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${URL}/productos/creatinas/creatina-monohidratada-250-gr`,
      name: 'Creatina Monohidrato Premium 250g',
      description: 'Creatina 100% monohidratada, ideal para aumentar fuerza y masa muscular. Primera entrega gratuita.',
      image: [`${URL}/package-image.png`],
      brand: {
        '@type': 'Brand',
        name: 'Magrolabs',
        url: URL
      },
      manufacturer: {
        '@type': 'Organization',
        name: 'Magrolabs',
        url: URL
      },
      category: 'Suplementos Deportivos',
      sku: 'creatina-monohidratada-250-gr',
      gtin13: '7751234567890',
      mpn: 'MGRL-CREAT-250G',
      weight: {
        '@type': 'QuantitativeValue',
        value: 250,
        unitCode: 'GRM'
      },
      offers: {
        '@type': 'Offer',
        '@id': `${URL}/productos/creatinas/creatina-monohidratada-250-gr#offer`,
        price: this.ENV.precioCreatinaSubscription.toString(),
        priceCurrency: 'PEN',
        availability: 'https://schema.org/InStock',
        url: `${URL}/productos/creatinas/creatina-monohidratada-250-gr`,
        validFrom: '2024-01-01',
        validThrough: '2025-12-31',
        seller: {
          '@type': 'Organization',
          name: 'Magrolabs',
          url: URL
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: '0',
            currency: 'PEN'
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            businessDays: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            }
          }
        }
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: this.ENV.nroReviews.toString(),
        bestRating: '5',
        worstRating: '1'
      },
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Pureza',
          value: '99.9%'
        },
        {
          '@type': 'PropertyValue',
          name: 'Tipo',
          value: 'Monohidrato'
        },
        {
          '@type': 'PropertyValue',
          name: 'Gluten Free',
          value: 'Sí'
        }
      ]
    };

    // Schema.org - FAQ basado en las preguntas de la página
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: this.ENV.campanaPrimeraCreatina.textos.faqTituloOferta,
          acceptedAnswer: {
            '@type': 'Answer',
            text: this.ENV.campanaPrimeraCreatina.textos.faqRespuestaOferta
          }
        },
        {
          '@type': 'Question',
          name: this.ENV.campanaPrimeraCreatina.textos.faqTituloRecepcion,
          acceptedAnswer: {
            '@type': 'Answer',
            text: this.ENV.campanaPrimeraCreatina.textos.faqRespuestaRecepcion(this.ENV.plazoDeEntregaHorasCreatinaFree.min, this.ENV.plazoDeEntregaHorasCreatinaFree.max)
          }
        },
        {
          '@type': 'Question',
          name: '¿Hay un periodo de cancelación?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: this.ENV.campanaPrimeraCreatina.tipo === 'gratis' 
              ? `Después de recibir tu ${this.ENV.campanaPrimeraCreatina.textos.heroOferta}, tienes ${this.ENV.diasNormalesDePruebaOperiodoDeReflexion} días para probarla como período de prueba. Si cancelas durante este tiempo, no pagarás nada. Después aplicamos un período de cancelación mensual.`
              : `Después de recibir tu ${this.ENV.campanaPrimeraCreatina.textos.heroOferta}, tienes ${this.ENV.diasNormalesDePruebaOperiodoDeReflexion} días para probarla como período de prueba. Si cancelas durante este tiempo, solo pagarás los S/ ${this.ENV.campanaPrimeraCreatina.precio}. Después aplicamos un período de cancelación mensual.`
          }
        },
        {
          '@type': 'Question',
          name: '¿Cómo funciona el programa de lealtad?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Como miembro recibes automáticamente ${this.ENV.creditoRegaloPorCompraMes} Magropuntos cada mes para canjear por artículos exclusivos de Magrolabs sin costo adicional.`
          }
        }
      ]
    };

    // Schema.org - Oferta especial
    const specialOfferSchema = {
      '@context': 'https://schema.org',
      '@type': 'Offer',
      name: `${this.ENV.campanaPrimeraCreatina.textos.heroOfertaMayuscula} + Suscripción Premium`,
      description: this.ENV.campanaPrimeraCreatina.tipo === 'gratis'
        ? `Obtén tu primera creatina completamente gratis y únete a nuestra suscripción por solo S/${this.ENV.precioCreatinaSubscription} al mes`
        : `Obtén tu primera creatina por solo S/${this.ENV.campanaPrimeraCreatina.precio} y únete a nuestra suscripción por S/${this.ENV.precioCreatinaSubscription} al mes`,
      price: this.ENV.campanaPrimeraCreatina.precio.toString(),
      priceCurrency: 'PEN',
      availability: 'https://schema.org/InStock',
      url: `${URL}/registro`,
      validThrough: '2025-12-31',
      itemOffered: {
        '@type': 'Product',
        name: 'Creatina Monohidrato Premium 250g'
      },
      seller: {
        '@type': 'Organization',
        name: 'Magrolabs'
      },
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Período de prueba',
          value: `${this.ENV.diasNormalesDePruebaOperiodoDeReflexion} días`
        },
        {
          '@type': 'PropertyValue',
          name: 'Envío',
          value: 'Gratis a Lima Metropolitana'
        },
        {
          '@type': 'PropertyValue',
          name: 'Crédito mensual',
          value: `${this.ENV.creditoRegaloPorCompraMes} Magropuntos`
        }
      ]
    };

    // Aplicar todos los schemas
    this._seo.setStructuredData(organizationSchema);
    this._seo.setStructuredData(websiteSchema);
    this._seo.setStructuredData(productSchema);
    this._seo.setStructuredData(faqSchema);
    this._seo.setStructuredData(specialOfferSchema);
  }
}
