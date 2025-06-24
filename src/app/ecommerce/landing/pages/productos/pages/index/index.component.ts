import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../../../../environments/env';
import { SeoService } from '../../../../../../shared/services/seo.service';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, NgOptimizedImage],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexComponent implements OnInit {
  private readonly _seo = inject(SeoService);
  
  ENV = environment;

  ngOnInit(): void {
    this.loadSEO();
  }

  private loadSEO(): void {
    const title = 'Productos Magrolabs - Suplementos de Alta Calidad';
    const description = 'Descubre nuestra línea completa de suplementos de alta calidad. Creatina monohidratada, proteínas y más productos para potenciar tu rendimiento físico.';
    const URL = 'https://magrolabs.com/productos';
    const image = 'https://magrolabs.com/articulos-fit.png';
    const keywords = 'suplementos deportivos, creatina monohidratada, proteína, suplementos Perú, productos Magrolabs, suplementación deportiva, rendimiento físico';

    // Configuración básica de SEO
    this._seo.setTitle(title);
    this._seo.setCanonicalURL(URL);
    this._seo.setDescription(description);
    this._seo.setKeywords(keywords);
    this._seo.setIndexFollow(true);

    // Open Graph para redes sociales
    this._seo.setOpenGraph({
      type: 'website',
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
      'twitter:image:alt': 'Productos Magrolabs - Suplementos de Alta Calidad',
    });

    // Hreflang para SEO internacional
    this._seo.setHreflangs([
      { lang: 'es', url: URL },
      { lang: 'en', url: URL },
      { lang: 'es-pe', url: URL },
      { lang: 'x-default', url: URL },
    ]);

    // Structured Data (JSON-LD) para productos
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description: description,
      url: URL,
      mainEntity: {
        '@type': 'ItemList',
        name: 'Productos Magrolabs',
        description: 'Catálogo completo de suplementos deportivos de alta calidad',
        itemListElement: [
          {
            '@type': 'Product',
            name: 'Creatina Monohidratada',
            description: 'Creatina de alta pureza para mejorar el rendimiento deportivo',
            brand: {
              '@type': 'Brand',
              name: 'Magrolabs'
            },
            category: 'Suplementos Deportivos',
            offers: {
              '@type': 'Offer',
              availability: 'https://schema.org/InStock',
              priceCurrency: 'PEN',
              seller: {
                '@type': 'Organization',
                name: 'Magrolabs'
              }
            }
          }
        ]
      },
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
            name: 'Productos',
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
      }
    };

    this._seo.setStructuredData(structuredData);
  }
}
