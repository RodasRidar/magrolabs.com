import { Component, inject } from '@angular/core';
import { NavbarComponent, NavbarTypeEnum } from "../../components/navbar/navbar.component";
import { environment } from '../../../../../environments/env';
import { RouterOutlet } from '@angular/router';
import { SeoService } from '../../../../shared/services/seo.service';

@Component({
  selector: 'app-loyalty-webshop',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet],
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
    const description = 'Cada miembro recibe S/10 de crédito al mes. Acumular crédito para compras es muy fácil, registrate ahora y recibe S/10 !';
                        
    const title = 'Magrolabs | Loyalty Webshop';
    const URL = 'https://magrolabs.com/loyalty-webshop';
    const image = 'https://magrolabs.com/loyalty-web-shop-banner_c.webp';


    this._seo.title.setTitle(title);
    this._seo.setCanonicalURL(URL);
    this._seo.meta.updateTag({ name: 'description', content: description });
    this._seo.setIndexFollow();

    this._seo.setKeywords('loyalty webshop, webshop, articulos de gym');

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
      'twitter:image:alt': 'Loyalty Webshop Imagen',
    });

    this._seo.setHreflangs([
      { lang: 'es', url: URL },
      { lang: 'en', url: URL },
      { lang: 'es-pe', url: URL },
      { lang: 'x-default', url: URL },
    ]);
  }
}

