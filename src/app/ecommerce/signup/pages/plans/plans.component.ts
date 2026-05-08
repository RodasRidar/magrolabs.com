import { Component, inject, PLATFORM_ID, signal, ViewChild } from "@angular/core";
import { StepComponent } from "../../components/step/step.component";
import { StepEnum } from "../../models/step.model";
import { Information } from "../../components/information/information.component";
import { SummaryService } from "../../../../shared/services/summary-service.service";
import { TiktokAnalyticsService } from "../../../../shared/services/tiktok-analytics.service";
import { MetaAnalyticsService } from "../../../../shared/services/meta-analytics.service";
import { ChosePlanSummary, SummaryEnum } from "../../../../shared/models/summary.model";
import { ActivatedRoute, Router } from "@angular/router";
import { SeoService } from "../../../../shared/services/seo.service";
import { ButtonComponent } from "../../../../shared/ui/button/button.component";
import { StarRatingComponent } from "../../../../shared/ui/star-rating/star-rating.component";
import { ReviewService } from "../../../../shared/services/review.service";
import { environment } from "../../../../../environments/env";
import { CommonModule, CurrencyPipe, isPlatformBrowser, isPlatformServer } from "@angular/common";
import { PurchaseBenefit, PurchaseOptionComponent } from '../../../../shared/ui/purchase-option/purchase-option.component';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [StepComponent, ButtonComponent, StarRatingComponent, CurrencyPipe, CommonModule, PurchaseOptionComponent],
  templateUrl: './plans.component.html',
})

export class PlansComponent {
  @ViewChild('subscriptionOption') subscriptionOption!: PurchaseOptionComponent;
  @ViewChild('onePurchaseOption') onePurchaseOption!: PurchaseOptionComponent;

  readonly onePurchaseBenefits: PurchaseBenefit[] = [
    {
      svgPath: 'M276-168q-50 0-85-35t-35-85H72l24-72h84q17-22 42.24-35 25.23-13 53.76-13 28.53 0 53.76 13Q355-382 372-360h196l84-336H216l8-24q8-22 26.5-35t41.5-13h452l-36 144h84l120 168-48 168h-48q0 50-35 85t-85 35q-50 0-85-35t-35-85H396q0 50-35 85t-85 35Zm384-264h170l3-11-78-109h-65l-30 120Zm-12-248 4-16-84 336 4-16 34-136 42-168ZM24-424l18-72h198l-18 72H24Zm72-136 18-72h234l-18 72H96Zm180 320q20.4 0 34.2-13.8Q324-267.6 324-288q0-20.4-13.8-34.2Q296.4-336 276-336q-20.4 0-34.2 13.8Q228-308.4 228-288q0 20.4 13.8 34.2Q255.6-240 276-240Zm420 0q20.4 0 34.2-13.8Q744-267.6 744-288q0-20.4-13.8-34.2Q716.4-336 696-336q-20.4 0-34.2 13.8Q648-308.4 648-288q0 20.4 13.8 34.2Q675.6-240 696-240Z',
      text: 'Envío gratis a Lima Metropolitana.',
    },
    {
      svgPath: 'm438-452-57-57q-11-11-28-11t-28 11q-11 11-11 28t11 28l85 85q12 12 28 12t28-12l170-170q11-11 11-28t-11-28q-11-11-28-11t-28 11L438-452Zm42 372q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-400Zm0 316q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Z',
      text: 'Garantía de satisfacción de 30 días.',
    },
    {
      svgPath: 'M520-496v-144q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640v159q0 8 3 15.5t9 13.5l132 132q11 11 28 11t28-11q11-11 11-28t-11-28L520-496Zm-40 416q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z',
      text: 'Recíbelo en 48 horas hábiles.',
    },
  ];

  readonly subscriptionBenefits: PurchaseBenefit[] = [
    {
      svgPath: 'm384-312 264-168-264-168v336Zm96.28 216Q401-96 331-126t-122.5-82.5Q156-261 126-330.96t-30-149.5Q96-560 126-629.5q30-69.5 82.5-122T330.96-834q69.96-30 149.5-30t149.04 30q69.5 30 122 82.5T834-629.28q30 69.73 30 149Q864-401 834-331t-82.5 122.5Q699-156 629.28-126q-69.73 30-149 30Zm-.28-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z',
      text: `Iniciarás con una creatina de prueba a solo S/${environment.campanaPrimeraCreatina.precio}.`,
    },
    {
      svgPath: 'M444-189v-270L216-591v270l228 132Zm72 0 228-131v-270L516-459v270Zm-72 84L180-258q-17.1-9.88-26.55-26.06Q144-300.23 144-320v-320q0-19.77 9.45-35.94Q162.9-692.12 180-702l264-153q17.13-10 36.07-10Q499-865 516-855l264 153q17.1 9.88 26.55 26.06Q816-659.77 816-640v320q0 19.77-9.45 35.94Q797.1-267.88 780-258L516-105q-17.13 10-36.07 10Q461-95 444-105Zm188-505 83-47-236-135-80 47 233 135Zm-152 88 82-47-237-134-80 46 235 135Z',
      size: 20,
      text: `Te enviaremos ${environment.campanaPrimeraCreatina.gramos}g para que pruebes la calidad.`,
    },
    {
      svgPath: 'M662-60 520-202l56-56 85 85 170-170 56 57L662-60ZM296-280l-56-56 64-64-64-64 56-56 64 64 64-64 56 56-64 64 64 64-56 56-64-64-64 64ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v254l-80 81v-175H200v400h250l79 80H200Zm0-560h560v-80H200v80Zm0 0v-80 80Z',
      text: `El periodo de prueba dura ${environment.diasNormalesDePruebaOperiodoDeReflexion} días.`,
    },
    {
      svgPath: 'M314-115q-104-48-169-145T80-479q0-26 2.5-51t8.5-49l-46 27-40-69 191-110 110 190-70 40-54-94q-11 27-16.5 56t-5.5 60q0 97 53 176.5T354-185l-40 70Zm306-485v-80h109q-46-57-111-88.5T480-800q-55 0-104 17t-90 48l-40-70q50-35 109-55t125-20q79 0 151 29.5T760-765v-55h80v220H620ZM594 0 403-110l110-190 69 40-57 98q118-17 196.5-107T800-480q0-11-.5-20.5T797-520h81q1 10 1.5 19.5t.5 20.5q0 135-80.5 241.5T590-95l44 26-40 69Z',
      text: `Pasada la prueba, tu suscripción de S/${environment.precioCreatinaSubscription} se activará.`,
    },
    {
      svgPath: 'M276-168q-50 0-85-35t-35-85H72l24-72h84q17-22 42.24-35 25.23-13 53.76-13 28.53 0 53.76 13Q355-382 372-360h196l84-336H216l8-24q8-22 26.5-35t41.5-13h452l-36 144h84l120 168-48 168h-48q0 50-35 85t-85 35q-50 0-85-35t-35-85H396q0 50-35 85t-85 35Zm384-264h170l3-11-78-109h-65l-30 120Zm-12-248 4-16-84 336 4-16 34-136 42-168ZM24-424l18-72h198l-18 72H24Zm72-136 18-72h234l-18 72H96Zm180 320q20.4 0 34.2-13.8Q324-267.6 324-288q0-20.4-13.8-34.2Q296.4-336 276-336q-20.4 0-34.2 13.8Q228-308.4 228-288q0 20.4 13.8 34.2Q255.6-240 276-240Zm420 0q20.4 0 34.2-13.8Q744-267.6 744-288q0-20.4-13.8-34.2Q716.4-336 696-336q-20.4 0-34.2 13.8Q648-308.4 648-288q0 20.4 13.8 34.2Q675.6-240 696-240Z',
      size: 20,
      text: 'Enviaremos tu creatina 250g cada mes (envío gratis).',
    },
    {
      svgPath: 'M480-48q-113 0-207.5-52.5T120-241v121H48v-240h240v72H175q48 76 128 122t177 46q75 0 140.5-28.5t114-77q48.5-48.5 77-114T840-480h72q0 90-34 168.5t-92.5 137Q727-116 648.5-82T480-48Zm-33-168v-48q-21-5-58.5-27T333-376l63-26q2 6 20 42.5t70 36.5q26 0 50.5-14.5T561-384q0-27-20.5-43.5T475-460q-31-11-78.5-35.5T349-585q0-3 13-49t86-62v-48h66v47q53 9 74.5 40t25.5 44l-59 25q-3-10-19-30t-53-20q-20 0-44 11.5T415-586q0 27 24.5 41t75.5 31q67 23 89.5 56.5T627-384q0 37-15 60t-34.5 36.5Q558-274 539.5-269t-26.5 6v47h-66ZM48-480q0-90 34-168.5t92.5-137Q233-844 311.5-878T480-912q113 0 207.5 52.5T840-719v-121h72v240H672v-72h113q-48-76-128-122t-177-46q-75 0-140.5 28.5t-114 77q-48.5 48.5-77 114T120-480H48Z',
      text: '+10 MP cada mes (canjealo por artículos exclusivos).',
    },
    {
      svgPath: 'm339-288 141-141 141 141 51-51-141-141 141-141-51-51-141 141-141-141-51 51 141 141-141 141 51 51ZM480-96q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480q0-80 30-149.5t82.5-122Q261-804 331-834t149-30q80 0 149.5 30t122 82.5Q804-699 834-629.5T864-480q0 79-30 149t-82.5 122.5Q699-156 629.5-126T480-96Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z',
      size: 20,
      text: 'Cancela o pausa tu suscripción cuando quieras.',
    },
  ];

  private _summaryService = inject(SummaryService);
  private _tiktokAnalytics = inject(TiktokAnalyticsService);
  private _metaAnalytics = inject(MetaAnalyticsService);
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
    totalReviews: 12,
    averageRating: 5,
    starDistribution: {
      5: 12,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
    percentages: {
      5: 100,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    }
  };

  // Flag para saber si los datos ya se actualizaron
  reviewStatsUpdated = false;
  
  informationList: Information[] = [
    {
      name: 'Recibe ' + this.ENV.creditoRegaloPorCompraMes + ' Magropuntos cada mes.'
    },
    {
      name: 'Acumula automáticamente, sin costo adicional.'
    },
    {
      name: 'Canjea tus Magropuntos por artículos exclusivos.'
    }
  ]
  preparandoDate: string = '';
  enviadoDate: string = '';
  entregadoDate: string = '';

  ngOnInit(): void {
    const summary = this._summaryService.getSummary();
    this.loadSEO();
    this.setupRouteParams();
    this.initializePlanSelection(summary);
    this.setDatesForTracking();
  }
  setDatesForTracking() {
    // Obtener la hora actual en Perú (UTC-5)
    const now = new Date();
    const peruTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Lima' }));
    const dayOfWeek = peruTime.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const currentHour = peruTime.getHours();
    
    let preparandoText = 'Hoy';
    let enviadoText = 'Hoy';
    let entregadoText = 'Mañana';

    // Reglas de negocio
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Lunes a Viernes
      if (currentHour <= 16) {
        // Menor o igual a las 4 PM
        preparandoText = 'Hoy';
        enviadoText = 'Hoy';
        entregadoText = 'Mañana';
      } else {
        // Mayor a las 4 PM
        preparandoText = 'Hoy';
        enviadoText = 'Mañana';
        entregadoText = 'Mañana';
      }
    } else if (dayOfWeek === 6) {
      // Sábado
      if (currentHour <= 13) {
        // Menor o igual a la 1 PM
        preparandoText = 'Hoy';
        enviadoText = 'Lunes';
        entregadoText = 'Martes';
      } else {
        // Mayor a la 1 PM (usando la misma lógica que domingo)
        preparandoText = 'Hoy';
        enviadoText = 'Lunes';
        entregadoText = 'Martes';
      }
    } else if (dayOfWeek === 0) {
      // Domingo
      preparandoText = 'Lunes';
      enviadoText = 'Lunes';
      entregadoText = 'Martes';
    }

    this.preparandoDate = preparandoText;
    this.enviadoDate = enviadoText;
    this.entregadoDate = entregadoText;
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
    // Tracking Meta Analytics
    this._metaAnalytics.trackCustomEvent('ViewContent', {
      content_name: 'Plan Suscripción Creatina 250gr',
      content_ids: ['creatina-250gr-suscripcion'],
      content_type: 'subscription',
      value: this.ENV.precioCreatinaSubscription,
      currency: 'PEN',
      content_category: 'suscripcion_mensual'
    });
      this.isSelectSubscription = true;
      this.isSelectOnePurchase = false;
    } else if (summary?.chosePlan?.selection === SummaryEnum.CREATINA_250G_ONE_PURCHASE) {
    this._metaAnalytics.trackCustomEvent('ViewContent', {
      content_name: 'Compra Única Creatina 250gr',
      content_ids: ['creatina-monohidratada-250-gr'],
      content_type: 'product',
      value: this.ENV.precioCreatinaOnePurchase,
      currency: 'PEN'
    });
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

    // Track plan selection
    this._tiktokAnalytics.trackViewContent({
      contents: [{
        content_id: 'creatina-250gr-suscripcion',
        content_type: 'product',
        content_name: 'Plan Suscripción Creatina 250gr'
      }],
      value: this.ENV.precioCreatinaSubscription,
      currency: 'PEN'
    });

    // Tracking Meta Analytics
    this._metaAnalytics.trackCustomEvent('ViewContent', {
      content_name: 'Plan Suscripción Creatina 250gr',
      content_ids: ['creatina-250gr-suscripcion'],
      content_type: 'subscription',
      value: this.ENV.precioCreatinaSubscription,
      currency: 'PEN',
      content_category: 'suscripcion_mensual'
    });

    this.subscriptionOption?.expand();
    this.onePurchaseOption?.collapse();
  }

  selectOnePurchase($event: any) {
    if (this.isSelectOnePurchase) {
      $event.preventDefault();
    }

    this.isSelectSubscription = false;
    this.isSelectOnePurchase = true;

    // Track plan selection
    this._tiktokAnalytics.trackViewContent({
      contents: [{
        content_id: 'creatina-monohidratada-250-gr',
        content_type: 'product',
        content_name: 'Compra Única Creatina 250gr'
      }],
      value: this.ENV.precioCreatinaOnePurchase,
      currency: 'PEN'
    });

    // Tracking Meta Analytics
    this._metaAnalytics.trackCustomEvent('ViewContent', {
      content_name: 'Compra Única Creatina 250gr',
      content_ids: ['creatina-monohidratada-250-gr'],
      content_type: 'product',
      value: this.ENV.precioCreatinaOnePurchase,
      currency: 'PEN'
    });

    this.onePurchaseOption?.expand();
    this.subscriptionOption?.collapse();
  }

  nextStep() {
    if (this.isSelectSubscription) {
      this._summaryService.setChoosePlan({
        selection: SummaryEnum.CREATINA_250G_SUBSCRIPTION,
        descriptionOne: 'Plan mensual de S/'+ this.ENV.precioCreatinaSubscription + '.',
        descriptionTwo: 'Ganas '+ this.ENV.creditoRegaloPorCompraMes + ' Magropuntos 🎁 .',
        descrptionThree: this.ENV.campanaPrimeraCreatina.textos.descripcionCarrito(this.ENV.campanaPrimeraCreatina.gramos),
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
    const image = 'https://magrolabs.com/image-meta_55.webp';

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
      if (summary?.chosePlan?.selection === SummaryEnum.CREATINA_250G_ONE_PURCHASE) {
        this.onePurchaseOption?.expand();
        this.subscriptionOption?.collapse();
      } else {
        this.subscriptionOption?.expand();
        this.onePurchaseOption?.collapse();
      }
    }
  }
}
