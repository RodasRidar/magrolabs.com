import { Component, ElementRef, inject, PLATFORM_ID, signal, ViewChild } from "@angular/core";
import { StepComponent } from "../../components/step/step.component";
import { StepEnum } from "../../models/step.model";
import { Information } from "../../components/information/information.component";
import { SummaryService } from "../../../../shared/services/summary-service.service";
import { ChosePlanSummary, SummaryEnum } from "../../../../shared/models/summary.model";
import { ActivatedRoute, Router } from "@angular/router";
import { SeoService } from "../../../../shared/services/seo.service";
import { ButtonComponent } from "../../../../shared/ui/button/button.component";
import { StarRatingComponent } from "../../../../shared/ui/star-rating/star-rating.component";
import { ReviewService } from "../../../../shared/services/review.service";
import { environment } from "../../../../../environments/env";
import { CommonModule, CurrencyPipe, isPlatformBrowser, isPlatformServer } from "@angular/common";

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [StepComponent, ButtonComponent, StarRatingComponent, CurrencyPipe, CommonModule],
  templateUrl: './plans.component.html',
})

export class PlansComponent {
  @ViewChild('Subscription', { static: false }) subscriptionElement!: ElementRef<HTMLDetailsElement>;
  @ViewChild('OnePurchase', { static: false }) onePurchaseElement!: ElementRef<HTMLDetailsElement>;

  private _summaryService = inject(SummaryService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private _seo = inject(SeoService);
  private _reviewService = inject(ReviewService);
  private platformId = inject(PLATFORM_ID);

  private nextUrl = '';

  ENV = environment
  isSelectSubscription = false;
  isSelectOnePurchase = false;
  stepEnum = StepEnum

  // Sistema de reviews similar a creatinas.component.ts
  isLoadReviews = signal<boolean>(false);
  
  // Review statistics - valores por defecto
  reviewStats = {
    totalReviews: 6,
    averageRating: 4.5,
    starDistribution: {
      5: 4,
      4: 2,
      3: 0,
      2: 0,
      1: 0,
    },
    percentages: {
      5: 67,
      4: 33,
      3: 0,
      2: 0,
      1: 0,
    }
  };

  // Flag para saber si los datos ya se actualizaron
  reviewStatsUpdated = false;
  
  informationList: Information[] = [
    {
      name: 'Recibe ' + this.ENV.creditoRegaloPorCompraMes + ' soles de crédito de compra cada mes.'
    },
    {
      name: 'Acumula automáticamente, sin costo adicional.'
    },
    {
      name: 'Canjea tus créditos por artículos exclusivos.'
    }
  ]

  ngOnInit(): void {
    const summary = this._summaryService.getSummary();
    this.loadSEO();
    this.setupRouteParams();
    this.initializePlanSelection(summary);
  }

  /**
   * Recibe las estadísticas de reviews del componente hijo
   */
  onReviewStatsReceived(stats: any) {
    this.reviewStats = stats;
    this.reviewStatsUpdated = true;
    console.log('Review stats received in parent:', stats);
  }

  /**
   * Notifica cuando las reviews se han cargado completamente
   */
  onReviewsLoaded(loaded: boolean) {
    this.isLoadReviews.set(loaded);
    console.log('Reviews loaded:', loaded);
  }

  onLoadReviews(event: boolean) {
    this.isLoadReviews.set(event);
  }

  private setupRouteParams(): void {
    this._route.queryParams.subscribe(params => {
      this.nextUrl = params['next'] || '';
    });
  }

  private initializePlanSelection(summary: any): void {
    const aux = <ChosePlanSummary>{};
    aux.selection = SummaryEnum.CREATINA_250G_SUBSCRIPTION;
    this._summaryService.setChoosePlan(aux);

    if (summary?.chosePlan?.selection === SummaryEnum.CREATINA_250G_SUBSCRIPTION) {
      this.isSelectSubscription = true;
      this.isSelectOnePurchase = false;
    } else if (summary?.chosePlan?.selection === SummaryEnum.CREATINA_250G_ONE_PURCHASE) {
      this.isSelectSubscription = false;
      this.isSelectOnePurchase = true;
    } else {
      this.isSelectSubscription = true;
      this.isSelectOnePurchase = false;
    }
  }

  selectSubscription($event: any) {
    if (this.isSelectSubscription) {
      $event.preventDefault();
    }

    this.isSelectSubscription = true;
    this.isSelectOnePurchase = false;

    if (this.onePurchaseElement) {
      this.onePurchaseElement.nativeElement.open = false;
    }
  }

  selectOnePurchase($event: any) {
    if (this.isSelectOnePurchase) {
      $event.preventDefault();
    }

    this.isSelectSubscription = false;
    this.isSelectOnePurchase = true;

    if (this.subscriptionElement) {
      this.subscriptionElement.nativeElement.open = false;
    }
  }

  nextStep() {
    if (this.isSelectSubscription) {
      this._summaryService.setChoosePlan({
        selection: SummaryEnum.CREATINA_250G_SUBSCRIPTION,
        descriptionOne: 'Plan mensual de S/'+ this.ENV.precioCreatinaSubscription + '.',
        descriptionTwo: 'Ganas S/'+ this.ENV.creditoRegaloPorCompraMes + ' de crédito.',
        descrptionThree: 'Creatina ' + this.ENV.creatinaFreeGramos + 'gr (gratis) 🎁',
        descrptionFour: 'Periodo de prueba de '+ this.ENV.diasNormalesDePruebaOperiodoDeReflexion+' días.',
        quantity: 1
      })
    }
    else if (this.isSelectOnePurchase) {
      this._summaryService.setChoosePlan({
        selection: SummaryEnum.CREATINA_250G_ONE_PURCHASE,
        descriptionOne: 'Monohidratada 100%',
        descriptionTwo: 'Compra única de S/'+ this.ENV.precioCreatinaOnePurchase + '.',
        quantity: 1
      })
    }

    if (this.nextUrl !== '') {
      this._router.navigate(['registro/' + this.nextUrl]);
    }
    else {
      this._router.navigate(['registro/crear-cuenta'])
    }
  }

  private loadSEO() {
    const description = 'Elige tu plan de suscripción a tu medida y comienza a disfrutar de la mejor creatina con envío gratis.';
    const title = 'Registro | Escoge tu plan';
    const URL = 'https://magrolabs.com/registro';
    const image = 'https://magrolabs.com/image-meta.webp';

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

  isButtonDisabled() {
    return !this.isSelectSubscription && !this.isSelectOnePurchase;
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const summary = this._summaryService.getSummary();
      if (summary?.chosePlan?.selection === SummaryEnum.CREATINA_250G_SUBSCRIPTION) {
        this.subscriptionElement.nativeElement.open = true;
      }
      else if (summary?.chosePlan?.selection === SummaryEnum.CREATINA_250G_ONE_PURCHASE) {
        this.onePurchaseElement.nativeElement.open = true;
      }
      else {
        this.subscriptionElement.nativeElement.open = true;
      }
    }
  }
}
