import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../../../../environments/env';
import { SeoService } from '../../../../../../shared/services/seo.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../../../../shared/ui/breadcrumb/breadcrumb.component';

type FilterCategory = 'sale' | 'new-arrivals';
type FilterSize = '100gr' | '250gr' | '3kg';

interface Product {
  route: string;
  imgSrc: string;
  imgAlt: string;
  title: string;
  subtitle: string;
  categories: FilterCategory[];
  sizes: FilterSize[];
}

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, NgOptimizedImage, BreadcrumbComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexComponent implements OnInit {
  private readonly _seo = inject(SeoService);

  ENV = environment;

  // Filtros
  activeMobileFilter = signal<'categories' | 'sizes' | null>(null);
  selectedCategories = signal<FilterCategory[]>([]);
  selectedSizes = signal<FilterSize[]>([]);

  readonly products: Product[] = [
    {
      route: 'creatinas/creatina-monohidratada-100-gr',
      imgSrc: '100gr_front_mockup_2000x2000.webp',
      imgAlt: 'Creatina 100% monohidratada oferta especial',
      title: `Creatina Monohidratada ${environment.creatinaFreeGramos} gr`,
      subtitle: `${environment.creatinaFreeGramos} gr`,
      categories: ['sale'],
      sizes: ['100gr'],
    },
    {
      route: 'creatinas/creatina-monohidratada-250-gr',
      imgSrc: '250gr_front_mockup_2000x2000.webp',
      imgAlt: 'Creatina monohidratada Magrolabs 250 gr',
      title: 'Creatina Monohidratada 250 gr',
      subtitle: '250 gr',
      categories: ['new-arrivals'],
      sizes: ['250gr'],
    },
  ];

  filteredProducts = computed(() => {
    const cats = this.selectedCategories();
    const sizes = this.selectedSizes();
    return this.products.filter(p => {
      const catMatch = cats.length === 0 || p.categories.some(c => cats.includes(c));
      const sizeMatch = sizes.length === 0 || p.sizes.some(s => sizes.includes(s));
      return catMatch && sizeMatch;
    });
  });

  toggleCategory(cat: FilterCategory): void {
    this.selectedCategories.update(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  toggleSize(size: FilterSize): void {
    this.selectedSizes.update(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  }

  isCategorySelected(cat: FilterCategory): boolean {
    return this.selectedCategories().includes(cat);
  }

  isSizeSelected(size: FilterSize): boolean {
    return this.selectedSizes().includes(size);
  }

  clearFilters(): void {
    this.selectedCategories.set([]);
    this.selectedSizes.set([]);
  }

  get hasActiveFilters(): boolean {
    return this.selectedCategories().length > 0 || this.selectedSizes().length > 0;
  }

  readonly breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', link: '/' },
    { label: 'Tienda' },
  ];

  get activeCategoriesCount(): number {
    return this.selectedCategories().length;
  }

  get activeSizesCount(): number {
    return this.selectedSizes().length;
  }

  openMobileFilter(filter: 'categories' | 'sizes'): void {
    this.activeMobileFilter.set(filter);
  }

  closeMobileFilter(): void {
    this.activeMobileFilter.set(null);
  }

  ngOnInit(): void {
    this.loadSEO();
  }

  private loadSEO(): void {
    const title = 'Tienda Magrolabs - Suplementos de Alta Calidad';
    const description = 'Descubre nuestra línea completa de suplementos de alta calidad. Creatina monohidratada, proteínas y más productos para potenciar tu rendimiento físico.';
    const URL = 'https://magrolabs.com/productos';
    const image = 'https://magrolabs.com/articulos-fit.png';
    const keywords = [
      'suplementos deportivos',
      'creatina peru',
      'suplementos gimnasio',
      'creatina monohidrato',
      'proteinas',
      'suplementos fitness',
      'nutrición deportiva'
    ];

    // Configuración básica de SEO
    this._seo.setTitle(title);
    this._seo.setCanonicalURL(URL);
    this._seo.setDescription(description);
    this._seo.setKeywords(keywords.join(', '));
    this._seo.setIndexFollow(true);

    // Configuración para IA (Gemini, ChatGPT, Claude)
    this._seo.setAICrawlers(true);
    
    this._seo.setAIMetadata({
      summary: 'Magrolabs ofrece suplementos deportivos de grado farmacéutico, incluyendo creatina monohidrato 99.9% pura. Modelo de suscripción flexible con envío gratis en Lima.',
      contentType: 'product-catalog',
      audience: 'atletas, deportistas, personas fitness-conscious en Perú',
      purpose: 'comercial-informativo',
      entityType: 'ProductCatalog'
    });

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
      'twitter:site': '@magrolabs',
      'twitter:creator': '@magrolabs',
      'twitter:url': URL,
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
      'twitter:image:alt': 'Tienda Magrolabs - Suplementos de Alta Calidad',
    });

    // Breadcrumbs para mejor contexto de navegación en IA
    this._seo.setBreadcrumbStructuredData([
      { name: 'Inicio', url: 'https://magrolabs.com' },
      { name: 'Tienda', url: URL }
    ]);

    // Organization Schema para marca
    this._seo.setOrganizationStructuredData({
      name: 'Magrolabs',
      url: 'https://magrolabs.com',
      logo: 'https://magrolabs.com/favicon.png',
      description: 'Líder en suplementos deportivos premium en Perú',
      contactPoint: {
        telephone: `+${this.ENV.telefonoAtencionClientes}`,
        contactType: 'customer service'
      },
      sameAs: [
        'https://www.facebook.com/magrolabs',
        'https://www.instagram.com/magrolabs',
        'https://twitter.com/magrolabs',
        'https://www.tiktok.com/@magrolabs'
      ]
    });

    // Hreflang para SEO internacional
    this._seo.setHreflangs([
      { lang: 'es', url: URL },
      { lang: 'es-pe', url: URL },
      { lang: 'x-default', url: URL },
    ]);

    // ItemList Schema optimizado para IA - Catálogo de productos
    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Tienda Magrolabs',
      description: 'Catálogo completo de suplementos deportivos premium',
      url: URL,
      numberOfItems: 1,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'Product',
            '@id': 'https://magrolabs.com/productos/creatinas/creatina-monohidratada-250-gr',
            name: 'Creatina Monohidrato Premium 250g',
            description: 'Creatina 100% monohidratada de máxima pureza para aumentar fuerza y masa muscular',
            image: 'https://magrolabs.com/package-image.png',
            brand: {
              '@type': 'Brand',
              name: 'Magrolabs'
            },
            manufacturer: {
              '@type': 'Organization',
              name: 'Magrolabs'
            },
            category: 'Suplementos Deportivos',
            sku: 'creatina-monohidratada-250-gr',
            weight: {
              '@type': 'QuantitativeValue',
              value: 250,
              unitCode: 'GRM'
            },
            offers: {
              '@type': 'Offer',
              '@id': 'https://magrolabs.com/productos/creatinas/creatina-monohidratada-250-gr#offer',
              price: this.ENV.precioCreatinaSubscription.toString(),
              priceCurrency: 'PEN',
              availability: 'https://schema.org/InStock',
              url: 'https://magrolabs.com/productos/creatinas/creatina-monohidratada-250-gr',
              seller: {
                '@type': 'Organization',
                name: 'Magrolabs'
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
          }
        }
      ]
    };

    this._seo.setStructuredData(itemListSchema);
  }
}
