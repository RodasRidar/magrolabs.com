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
import { TransferState, makeStateKey } from "@angular/core";

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
  private transferState = inject(TransferState);

  private nextUrl = '';

  ENV = environment
  isSelectSubscription = false;
  isSelectOnePurchase = false;
  stepEnum = StepEnum

  averageRating = 4.5; // Valor por defecto
  totalReviews = 0;
  
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
    let summary = this._summaryService.getSummary()
    this.loadSEO();
    
    // Definir keys para Transfer State
    const AVERAGE_RATING_KEY = makeStateKey<number>('plans-average-rating');
    const TOTAL_REVIEWS_KEY = makeStateKey<number>('plans-total-reviews');
    
    if (isPlatformServer(this.platformId)) {
      // En el servidor: cargar reviews y guardar en Transfer State
      this.loadReviews().then(() => {
        this.transferState.set(AVERAGE_RATING_KEY, this.averageRating);
        this.transferState.set(TOTAL_REVIEWS_KEY, this.totalReviews);
      });
    } else {
      // En el cliente: recuperar desde Transfer State
      const savedRating = this.transferState.get(AVERAGE_RATING_KEY, 4.5);
      const savedReviews = this.transferState.get(TOTAL_REVIEWS_KEY, 0);
      
      this.averageRating = savedRating;
      this.totalReviews = savedReviews;
      
      console.log(`Cliente - Reviews recuperadas: ${this.totalReviews}, Rating: ${this.averageRating}`);
    }
    this._route.queryParams.subscribe(params => {
      this.nextUrl = params['next'] || '';
      // console.log('nextUrl', this.nextUrl);
      // if (this.nextUrl == '') {
      // this._router.navigate(['/registro'], { queryParams: { next: 'crear-cuenta' }});
      // }
    });

    let aux = <ChosePlanSummary>{}
    aux.selection = SummaryEnum.CREATINA_250G_SUBSCRIPTION
    this._summaryService.setChoosePlan(aux)

    if (summary?.chosePlan?.selection === SummaryEnum.CREATINA_250G_SUBSCRIPTION) {
      this.isSelectSubscription = true;
      this.isSelectOnePurchase = false;
    }
    else if (summary?.chosePlan?.selection === SummaryEnum.CREATINA_250G_ONE_PURCHASE) {
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

  // chosePlan(chosePlan: ChosePlanSummary) {
  //   this._summaryService.setChoosePlan(chosePlan)
  //   if (this.nextUrl !== '') {
  //     this._router.navigate(['registro/' + this.nextUrl]);
  //   }
  //   else {
  //     this._router.navigate(['registro/crear-cuenta'])
  //   }
  // }

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
    const description = 'Elige tu plan de suscripción a tu medida y comienza a disfrutar de la mejor creatina con envío gratis.';
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

  private loadReviews(): Promise<void> {
    console.log('loadReviews - Solo ejecutándose en servidor (SSR)');
    // Producto ID para creatina
    const productId = '00000001-50eb-4ac3-aa94-1b64fbf32b9c';
    //TODO QUITAR EL MAS5
    return new Promise((resolve, reject) => {
      this._reviewService.getAllReviews({product_id: productId, is_approved: true}).subscribe({
        next: (response) => {
          console.log('Reviews cargadas desde servidor:', response);
          if (response.data && response.data.reviews && response.data.reviews.length > 0) {
            const reviews = response.data.reviews;
            this.totalReviews = reviews.length + 5; 
            
            // Calcular promedio de rating
            const totalStars = reviews.reduce((sum: number, review: any) => sum + review.stars, 0);
            const calculatedRating = Number((totalStars / reviews.length).toFixed(1));
            this.averageRating = calculatedRating;
            
            console.log(`SSR - Reviews: ${this.totalReviews}, Rating promedio: ${this.averageRating}`);
          }
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar reviews en SSR:', error);
          // Mantener valores por defecto en caso de error
          resolve(); // Resolver aunque haya error para continuar
        }
      });
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      let summary = this._summaryService.getSummary()
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
