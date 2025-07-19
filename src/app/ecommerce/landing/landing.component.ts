import { Component, inject } from '@angular/core';
import { NavbarComponent, NavbarTypeEnum } from './components/navbar/navbar.component';
import { HeroComponent } from '././components/hero/hero.component';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/services/seo.service';
import { environment } from '../../../environments/env';
import { FooterComponent } from "./components/footer/footer.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NavbarComponent, HeroComponent, RouterLink, FooterComponent, ButtonComponent],
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
    const description = '¿Por qué Magrolabs? S/'+this.ENV.precioCreatinaSubscription+' por mes. La primera creatina es gratis - '+this.ENV.diasNormalesDePruebaOperiodoDeReflexion+' días para pensártelo. Un plan de creatina de alta calidad ajustado a tus necesidades y con envío gratis.';
    const title = 'Magrolabs Creatina';
    const URL = 'https://magrolabs.com';
    const image = 'https://magrolabs.com/image-meta.webp';

    this._seo.title.setTitle(title);
    this._seo.setCanonicalURL(URL);
    this._seo.meta.updateTag({ name: 'description', content: description });
    this._seo.setIndexFollow();

    this._seo.setKeywords('magrolabs, magrolab, magrolap, magro labs,magro laps, magrolaps, magrolap, creatina, suplementos, gym, fitness, salud, deporte, nutricion, entrenamiento, musculacion, crossfit, fisicoculturismo, bienestar, saludable,' +
      'gimnasio, suscripción, creatina recurrente, creatina monohidratada, creatina 100%, creatina 3kg, creatina 250g, creatina 250gr,' +
      'creatina por subscripcion, calidad, peru, perú, envío gratis, gratis, envio, lima');

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
      'twitter:image:alt': 'Creatina Magrolabs - Alta Calidad',
    });

    this._seo.setHreflangs([
      { lang: 'es', url: URL },
      { lang: 'en', url: URL },
      { lang: 'es-pe', url: URL },
      { lang: 'x-default', url: URL },
    ]);
  }
}
