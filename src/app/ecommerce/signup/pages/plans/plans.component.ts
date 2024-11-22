import { Component, inject } from "@angular/core";
import { PricingComponent } from "../../components/pricing/pricing.component";
import { StepComponent } from "../../components/step/step.component";
import { StepEnum } from "../../models/step.model";
import { Information, InformationComponent } from "../../components/information/information.component";
import { SummaryService } from "../../../../shared/services/summary-service.service";
import { ChosePlanSummary } from "../../../../shared/models/summary.model";
import { ActivatedRoute, Router } from "@angular/router";
import { SeoService } from "../../../../shared/services/seo.service";

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [StepComponent, PricingComponent, InformationComponent],
  templateUrl: './plans.component.html',
})

export class PlansComponent {
  private _summaryService = inject(SummaryService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private _seo = inject(SeoService);

  private nextUrl = '';

  ngOnInit(): void {
    this.loadSEO();
    this._route.queryParams.subscribe(params => {
      this.nextUrl = params['next'] || ''; 
    });
  }

  stepEnum = StepEnum
  informationList: Information[] = [
    {
      name: 'Recibe 10 soles de crédito de compra cada mes.'
    },
    {
      name: 'Acumula automáticamente, sin costo adicional.'
    },
    {
      name: 'Canjea tus créditos por artículos exclusivos.'
    }
  ]

  chosePlan(chosePlan: ChosePlanSummary) {
    this._summaryService.setChoosePlan(chosePlan)
    if(this.nextUrl !== '') {
      this._router.navigate(['registro/' + this.nextUrl]);
    }
    else{
      this._router.navigate(['registro/crear-cuenta'])
    }
  }

  private loadSEO() {
    const description = 'Escoge tu plan de suscripción a tu medidad y comienza a disfrutar de la mejor creatina con envió gratis.';
    const title = 'Registro | Escoge tu plan';
    const URL = 'https://magrolabs.com/registro';
    // const image = 'https://i.ibb.co/cN8Xncy/Imagen-meta-optimized.png';
    const image = 'https://magrolabs.com/image-meta.png';


    this._seo.title.setTitle(title);
    this._seo.setCanonicalURL(URL);
    this._seo.meta.updateTag({ name: 'description', content: description });
    this._seo.setIndexFollow();

    this._seo.setKeywords('registro, plan, suscripción, creatina');

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

const routes = [
  {
    path: '',
    component: PlansComponent,
    loadChildren: () => import('./plans.component').then(m => m.PlansComponent)
  }
];
