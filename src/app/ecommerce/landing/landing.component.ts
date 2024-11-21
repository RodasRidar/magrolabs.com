import { Component, inject } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { HeroComponent } from './hero/hero.component';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NavbarComponent, HeroComponent, RouterLink],
  templateUrl: './landing.component.html'
})
export class LandingComponent {
  private _seo = inject(SeoService)
  ngOnInit(): void {
    this.loadSEO();
  }

  private loadSEO() {
    const description = '¿Por qué Magrolabs? S/33 por mes. La primera creatina es gratis - 14 días para pensártelo. Un plan de creatina de alta calidad ajustado a tus necesidades y con envío gratis.';
    const title = 'Magrolabs Creatina 100% Monohidratada';
    const URL = 'https://magrolabs.com';
    const image = 'https://i.ibb.co/cN8Xncy/Imagen-meta-optimized.png';

    this._seo.title.setTitle(title);
    this._seo.setCanonicalURL(URL);
    this._seo.meta.updateTag({ name: 'description', content: description });
    this._seo.setIndexFollow();

    this._seo.setKeywords('magrolabs, creatina, proteina, suplementos, gym, fitness, salud, deporte, nutricion, entrenamiento, musculacion, crossfit, fisicoculturismo, bienestar, saludable,' +
      'gimnasio, subscripción, creatina recurrente, creatina monohidratada, creatina 100%, creatina 3kg, creatina 250g, creatina 250gr,' +
      'creatina por subscripcion, calidad, peru, perú, envío gratis, gratis, envio, lima');

    this._seo.setOpenGraph({
      type: 'website',
      site_name: 'Magrolabs',
      title: title,
      description: description,
      image: image,
      url: URL,
      locale: 'es_la',
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
