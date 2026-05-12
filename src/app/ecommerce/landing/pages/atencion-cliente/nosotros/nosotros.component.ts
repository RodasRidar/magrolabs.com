import { Component, inject, OnInit } from '@angular/core';
import { environment } from '../../../../../../environments/env';
import { SeoService } from '../../../../../shared/services/seo.service';

@Component({
    selector: 'app-nosotros',
    imports: [],
    templateUrl: './nosotros.component.html'
})
export class NosotrosComponent implements OnInit {
  private readonly _seo = inject(SeoService);
  
  ENV = environment;

  ngOnInit(): void {
    this.loadSEO();
  }

  private loadSEO(): void {
    const title = 'Nosotros | Magrolabs';
    const description = 'Conoce a Magrolabs, empresa peruana de suplementos deportivos comprometida con la calidad, sostenibilidad y el bienestar de nuestros clientes. Nuestra misión es revolucionar la suplementación deportiva con productos premium y eco-amigables.';
    const URL = 'https://magrolabs.com/atencion-cliente/nosotros';
    const image = 'https://magrolabs.com/image-meta_55.webp';
    const keywords = 'Magrolabs, sobre nosotros, empresa peruana, suplementos eco-amigables, misión, visión, valores, sostenibilidad, suplementos deportivos Perú';

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
      'twitter:image:alt': 'Magrolabs - Suplementos Eco-Amigables',
    });

    // Hreflang para SEO internacional
    this._seo.setHreflangs([
      { lang: 'es', url: URL },
      { lang: 'en', url: URL },
      { lang: 'es-pe', url: URL },
      { lang: 'x-default', url: URL },
    ]);

    // Structured Data (JSON-LD) para Organization
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Magrolabs',
      url: 'https://magrolabs.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://magrolabs.com/logo-magrolabs.png'
      },
      description: description,
      foundingDate: '2023',
      foundingLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Lima',
          addressCountry: 'PE'
        }
      },
      sameAs: [
        'https://www.instagram.com/magrolabs',
        'https://www.facebook.com/magrolabs'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+51-961-737-705',
        contactType: 'customer service',
        email: 'hola@magrolabs.com',
        availableLanguage: ['Spanish']
      }
    };

    this._seo.setStructuredData(structuredData);
  }
}
