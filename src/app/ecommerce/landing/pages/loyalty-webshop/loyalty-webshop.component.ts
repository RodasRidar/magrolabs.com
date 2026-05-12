import { Component, inject } from '@angular/core';
import { NavbarComponent, NavbarTypeEnum } from "../../components/navbar/navbar.component";
import { environment } from '../../../../../environments/env';
import { RouterOutlet } from '@angular/router';
import { SeoService } from '../../../../shared/services/seo.service';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
    selector: 'app-loyalty-webshop',
    imports: [NavbarComponent, RouterOutlet, FooterComponent],
    templateUrl: './loyalty-webshop.component.html',
    styleUrl: './loyalty-webshop.component.css'
})
export class LoyaltyWebshopComponent {

  private readonly _seo = inject(SeoService);
  navbarTypeEnum = NavbarTypeEnum;
  ENV = environment
  isOutOfStock: any;
  productPriceSubscription: any;

  ngOnInit() {
    this.loadSEO();
  }

  private loadSEO() {
    const description = 'Cada miembro recibe 10 Magropuntos al mes. Acumular Magropuntos para compras es muy fácil, regístrate ahora y recibe 10 Magropuntos !';

    const title = 'Magrolabs | Webshop';
    const URL = 'https://magrolabs.com/loyalty-webshop';
    const image = 'https://magrolabs.com/loyalty-web-shop-banner_c.webp';


    this._seo.title.setTitle(title);
    this._seo.setCanonicalURL(URL);
    this._seo.meta.updateTag({ name: 'description', content: description });
    this._seo.setIndexFollow();

    this._seo.setKeywords('Webshop, articulos de gym');

    this._seo.setOpenGraph({
      type: 'website',
      site_name: 'Magrolabs',
      title: title,
      description: description,
      image: image,
      url: URL,
      locale: 'es_PE',
    });

    this._seo.setTwitterCard({
      'twitter:card': 'summary_large_image',
      'twitter:url': URL,
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
      'twitter:image:alt': 'Webshop Imagen',
    });

    this._seo.setHreflangs([
      { lang: 'es', url: URL },
      { lang: 'en', url: URL },
      { lang: 'es-pe', url: URL },
      { lang: 'x-default', url: URL },
    ]);
  }
}

