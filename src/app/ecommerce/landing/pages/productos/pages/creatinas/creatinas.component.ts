import { AfterViewInit, Component, DestroyRef, ElementRef, inject, PLATFORM_ID, signal, ViewChild, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../../../../shared/services/product.service';
import { PurchaseBenefit, PurchaseOptionComponent } from '../../../../../../shared/ui/purchase-option/purchase-option.component';
import { environment } from '../../../../../../../environments/env';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { ButtonComponent } from '../../../../../../shared/ui/button/button.component';
import { InlineModalComponent } from '../../../../../../shared/ui/inline-modal/inline-modal.component';
import { ChosePlanSummary, SummaryEnum } from '../../../../../../shared/models/summary.model';
import { ShoppingCartService } from '../../../../../../shared/services/cart-service.service';
import { SummaryService } from '../../../../../../shared/services/summary-service.service';
import { SeoService } from '../../../../../../shared/services/seo.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../../../shared/services/auth.service';
import { ReviewService } from '../../../../../../shared/services/review.service';
import { CanReviewResponse } from '../../../../../../shared/interfaces/review.interfaces';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { ReviewsListComponent } from '../../../../../../shared/ui/reviews-list/reviews-list.component';
import { ReviewSkeletonComponent } from '../../../../../../shared/ui/review-skeleton/review-skeleton.component';
import { StarRatingComponent } from '../../../../../../shared/ui/star-rating/star-rating.component';
import { TiktokAnalyticsService } from '../../../../../../shared/services/tiktok-analytics.service';
import { MetaAnalyticsService } from '../../../../../../shared/services/meta-analytics.service';
import { StepComponent } from '../../../../../signup/components/step/step.component';
import { AccordionGroupComponent } from '../../../../../../shared/ui/accordion/accordion-group.component';
import { AccordionItemComponent } from '../../../../../../shared/ui/accordion/accordion-item.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../../../../shared/ui/breadcrumb/breadcrumb.component';
import { ProductQuantityComponent } from '../../../../../../shared/ui/product-quantity/product-quantity.component';

@Component({
    selector: 'app-creatinas',
    imports: [CurrencyPipe, ButtonComponent, InlineModalComponent, NgOptimizedImage, RouterLink, CommonModule, ReactiveFormsModule, ReviewsListComponent, ReviewSkeletonComponent, StarRatingComponent, StepComponent, AccordionGroupComponent, AccordionItemComponent, PurchaseOptionComponent, BreadcrumbComponent, ProductQuantityComponent],
    templateUrl: './creatinas.component.html',
    styleUrl: './creatinas.component.css'
})
export class CreatinasComponent implements AfterViewInit, OnInit {
  @ViewChild('subscriptionOption') subscriptionOption!: PurchaseOptionComponent;
  @ViewChild('onePurchaseOption') onePurchaseOption!: PurchaseOptionComponent;
  @ViewChild('imageCarousel', { static: false }) imageCarousel!: ElementRef<HTMLDivElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private _shoppingCartService = inject(ShoppingCartService);
  private _summaryService = inject(SummaryService);
  private _seo = inject(SeoService);
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _reviewService = inject(ReviewService);
  private _toastService = inject(ToastService);
  private _productService = inject(ProductService);
  private _tiktokAnalytics = inject(TiktokAnalyticsService);
  private destroyRef = inject(DestroyRef);
  private _metaAnalytics = inject(MetaAnalyticsService);

  ENV = environment
  productName = '';

  get breadcrumbItems(): BreadcrumbItem[] {
    return [
      { label: 'Inicio', link: '/' },
      { label: 'Tienda', link: '/productos' },
      { label: 'Creatina' },
      { label: this.productName },
    ];
  }
  productPriceOnePurchase = 0;
  productPriceSubscription = 0;
  productServicesAndWeight = '';
  credits = this.ENV.creditoRegaloPorCompraMes;
  reviews = 12;
  recurrencia = '30 días';
  principalImgFront = ''
  previewImgFront = ''
  previewImgBack = ''
  principalImgBack = ''
  previewmodel3d = ''
  model3dUrl = ''
  tapSelected = 1; // Por defecto muestra la imagen frontal
  currentImageIndex = 0; // Para el carrusel móvil

  isOutOfStock = false;
  isFreeCreatine = false;
  isLogged = false;
  slug = '';
  /**
   * Producto resuelto desde backend (id real) por slug. Sincrónico para
   * que el template y `app-reviews-list` puedan bindear sin Promises.
   * Cargado en `ngOnInit` apenas Angular conoce el slug del URL.
   */
  resolvedProductId = signal<string | null>(null);
  /**
   * Permiso de reseña del usuario actual sobre el producto canónico, resuelto
   * desde el backend. `null` = aún verificando (o usuario no logueado). El
   * template renderiza badge "Ya calificaste" / botón / mensaje según `reason`.
   */
  reviewPermission = signal<CanReviewResponse | null>(null);
  isSelectSubscription = signal<boolean>(false);
  isSelectOnePurchase = signal<boolean>(false);
  quantity = signal<number>(1);

  onQuantityChange(value: number) {
    this.quantity.set(value);
  }

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
  isLoading = true;

  // Modal review properties
  isReviewModalOpen = false;
  isSubmittingReview = false;
  isCheckingReviewPermission = false;
  selectedRating = 0;
  hoveredRating = 0;
  isLoadReviews = signal<boolean>(false);

  // Zoom properties
  isZoomActive = false;
  zoomBackgroundPosition = '0% 0%';

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

  // Review form
  reviewForm = this._formBuilder.group({
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.maxLength(250), Validators.minLength(10)]]
  });

  // Los schemas JSON-LD ahora se generan dinámicamente en setAdvancedStructuredData()
  // para evitar duplicación del campo "brand" reportada por Google Search Console

  preparandoDate = ''
  enviadoDate = ''
  entregadoDate = ''

  onLoadReviews(event: boolean) {
    this.isLoadReviews.set(event);
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



  ngOnInit() {
    this.slug = this.route.snapshot.params['slug'];

    // Slugs `deprecated-<uuid>` provienen del catálogo viejo (ej. clientes
    // entrando vía "Mis pedidos → Escribir reseña" de órdenes con producto
    // soft-deleted). El backend resuelve transparente al canónico — pedimos
    // ese slug actualizado y redirigimos manteniendo `?review=true`.
    if (this.slug.startsWith('deprecated-')) {
      this._productService.getBySlug(this.slug)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: r => {
            const canonicalSlug = r.data.product.slug;
            if (canonicalSlug && canonicalSlug !== this.slug) {
              this.router.navigate(['/productos/creatinas', canonicalSlug], {
                queryParams: this.route.snapshot.queryParams,
                replaceUrl: true,
              });
            } else {
              this.router.navigate(['./404']);
            }
          },
          error: () => this.router.navigate(['./404']),
        });
      return;
    }

    // Resolver productId desde backend vía slug. Se ejecuta también en
    // SSR (TransferState cachea el response al cliente) para que la
    // hidratación tenga el id ya disponible y los reviews pre-renderizen.
    this.resolveProductIdFromBackend();

    this._authService.isAuthenticated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isAuth => {
        this.isLogged = isAuth;
        this.refreshReviewPermission();
      });

    if (this.slug === 'creatina-monohidratada-250-gr') {
      this.isFreeCreatine = false;
      this.isOutOfStock = false;
      this.productName = 'Creatina Monohidratada 250 gr';
      this.productPriceOnePurchase = this.ENV.precioCreatinaOnePurchase;
      this.productPriceSubscription = this.ENV.precioCreatinaSubscription;
      this.productServicesAndWeight = this.ENV.creatinaSubscription250 + ' gr. ' + this.ENV.nroServicios250g + ' servicios.';
      this.credits = this.ENV.creditoRegaloPorCompraMes
      this.reviews = this.ENV.nroReviews;
      this.recurrencia = '30 días';
      this.principalImgFront = '250gr_front_mockup_2000x2000.webp';
      this.principalImgBack = '250gr_back_mockup_2000x2000.webp'; // Por ahora usa la misma imagen
      this.previewImgFront = '250gr_front_mockup_500x500.webp';
      this.previewImgBack = '250gr_back_mockup_500x500.webp'; // Por ahora usa la misma imagen
      this.model3dUrl = '250g';
      this.previewmodel3d = '3d.png';
      // this._seo.setStructuredData(this.jsonLD_250Gr); // Removido para evitar duplicación con setAdvancedStructuredData
    }
    else if (this.slug === 'creatina-monohidratada-100-gr') {
      this.isFreeCreatine = true;
      this.isOutOfStock = false;
      this.productName = 'Creatina Monohidratada 100 gr';
      this.productPriceOnePurchase = 0;
      this.productPriceSubscription = 0;
      this.productServicesAndWeight = this.ENV.creatinaFreeGramos + ' gr. ' + this.ENV.nroServicios100g + ' servicios.';
      this.credits = this.ENV.creditoRegaloPorCompraAño
      this.reviews = this.ENV.nroReviews;
      this.principalImgFront = '100gr_front_mockup_2000x2000.webp';
      this.principalImgBack = '100gr_back_mockup_2000x2000.webp';
      this.model3dUrl = '250g';
      this.previewmodel3d = '3d.png';
      this.previewImgFront = '100gr_front_mockup_500x500.webp';
      this.previewImgBack = '100gr_back_mockup_500x500.webp';
      // this._seo.setStructuredData(this.jsonLD_100Gr); // Removido para evitar duplicación con setAdvancedStructuredData
    }
    else if (this.slug === 'creatina-monohidratada-3-kg') {
      this.isFreeCreatine = false;
      this.isOutOfStock = true;
      this.productName = 'Creatina Monohidratada 3 kg';
      this.productPriceOnePurchase = this.ENV.precioCreatina3kgOnePurchase;
      this.productPriceSubscription = this.ENV.precioCreatina3kgSubscription;
      this.productServicesAndWeight = this.ENV.creatina3kg + ' kg. ' + this.ENV.nroServicios3kg + ' servicios.';
      this.credits = this.ENV.creditoRegaloPorCompraAño
      this.reviews = this.ENV.nroReviews;
      this.recurrencia = 'año';
      this.model3dUrl = '3kg';
      this.principalImgFront = 'package-image-3000.png';
      this.principalImgBack = 'package-image-3000.png'; // Por ahora usa la misma imagen
      this.previewImgFront = 'package-image-3000.png';
      this.previewImgBack = 'package-image-3000.png'; // Por ahora usa la misma imagen
      this.previewmodel3d = '3d.png';
      // this._seo.setStructuredData(this.jsonLD_3Kg); // Removido para evitar duplicación con setAdvancedStructuredData
    }
    else {
      this.router.navigate(['./404']);
    }
    this.trackProductView();
    this.loadSEO();
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
   * Handler del botón "Escribir reseña". Usa el `reviewPermission` ya
   * resuelto (sin hacer fetch en cada click). Si no está autenticado,
   * redirige a login con `returnUrl` para volver y abrir el modal.
   */
  writeReview() {
    if (!this.isLogged) {
      const returnUrl = `/productos/creatinas/${this.slug}?review=true`;
      this.router.navigate(['/login'], { queryParams: { returnUrl } });
      return;
    }

    const perm = this.reviewPermission();
    if (!perm) {
      // Aún resolviendo permiso — no debería pasar si el botón está disabled
      // mientras `isCheckingReviewPermission` es true, pero es safety net.
      return;
    }

    if (perm.can_review) {
      this.openReviewModal();
    } else {
      this._toastService.error('No puedes escribir una reseña', perm.message);
    }
  }

  /**
   * Consulta al backend si el usuario puede escribir reseña para el producto
   * canónico. Se invoca cuando se resuelve `resolvedProductId` o cuando cambia
   * el estado de autenticación. El resultado se guarda en `reviewPermission`
   * y el template lo lee directamente.
   *
   * Si veníamos de un login con `?review=true` y el permiso es OK, abre el
   * modal automáticamente.
   */
  private refreshReviewPermission(): void {
    const productId = this.resolvedProductId();
    if (!productId || !this.isLogged) {
      this.reviewPermission.set(null);
      return;
    }

    this.isCheckingReviewPermission = true;
    this._reviewService.canUserReviewProduct(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: perm => {
          this.reviewPermission.set(perm);
          const reviewParam = this.route.snapshot.queryParams['review'];
          if (reviewParam === 'true' && perm.can_review) {
            this.openReviewModal();
          }
        },
        error: err => {
          console.warn('No se pudo verificar permiso de reseña', err);
          this.reviewPermission.set(null);
        },
        complete: () => {
          this.isCheckingReviewPermission = false;
        }
      });
  }

  openReviewModal() {
    this.isReviewModalOpen = true;
    this.selectedRating = 0;
    this.hoveredRating = 0;
    this.reviewForm.reset();
    document.body.style.overflow = 'hidden';
  }

  closeReviewModal() {
    this.isReviewModalOpen = false;
    this.selectedRating = 0;
    this.hoveredRating = 0;
    this.reviewForm.reset();
    document.body.style.overflow = 'auto';
    
    // Limpiar el parámetro review de la URL si existe
    const urlTree = this.router.createUrlTree([], {
      queryParams: { review: null },
      queryParamsHandling: 'merge'
    });
    this.router.navigateByUrl(urlTree);
  }

  setRating(rating: number) {
    this.selectedRating = rating;
    this.reviewForm.patchValue({ rating });
  }

  setHoveredRating(rating: number) {
    this.hoveredRating = rating;
  }

  resetHoveredRating() {
    this.hoveredRating = 0;
  }

  getRatingDisplay(star: number): number {
    return this.hoveredRating > 0 ? this.hoveredRating : this.selectedRating;
  }

  get remainingCharacters(): number {
    const comment = this.reviewForm.get('comment')?.value || '';
    return 250 - comment.length;
  }

  get isCommentValid(): boolean {
    const comment = this.reviewForm.get('comment')?.value || '';
    return comment.length >= 10 && comment.length <= 250;
  }

  get isFormValid(): boolean {
    return this.selectedRating > 0 && this.isCommentValid;
  }

  /**
   * Obtiene un array de estrellas para mostrar en el template
   * @param rating Calificación de la review
   * @returns Array de objetos con información de las estrellas
   */
  getStarsArray(rating: number): { filled: boolean; index: number }[] {
    return Array.from({ length: 5 }, (_, index) => ({
      filled: index < rating,
      index: index + 1
    }));
  }

  /**
   * Resuelve el productId desde BD vía slug. Lo carga UNA VEZ en
   * `ngOnInit` y lo guarda en el signal `resolvedProductId`. El template
   * y los callers leen el valor sincrónicamente — esto es importante
   * para SSR (server-side render produce el HTML con el id ya resuelto)
   * y para evitar el error de tipo `Promise<string>` en bindings.
   *
   * Si todavía no se ha resuelto (request en vuelo) devuelve `this.slug`
   * como fallback temporal — el `<app-reviews-list>` aceptará un id
   * inválido y mostrará lista vacía, y al resolverse el backend se
   * actualizará reactivamente.
   */
  public getProductId(): string {
    return this.resolvedProductId() ?? this.slug;
  }

  /** Resuelve el productId desde backend y lo guarda en el signal. */
  private resolveProductIdFromBackend(): void {
    if (!this.slug) return;
    this._productService.getBySlug(this.slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: r => {
          this.resolvedProductId.set(r.data.product.id);
          this.refreshReviewPermission();
        },
        error: err => {
          console.warn(`No se pudo resolver productId para slug "${this.slug}"`, err);
          // Mantiene null; getProductId() devuelve slug como fallback.
        },
      });
  }

  submitReview() {
    if (!this.isFormValid || this.isSubmittingReview) {
      return;
    }

    this.isSubmittingReview = true;

    const reviewData = {
      product_id: this.getProductId(),
      rating: this.selectedRating,
      title: 'Reseña de ' + this.productName,
      comment: this.reviewForm.get('comment')?.value || ''
    };

    this._reviewService.createReview(reviewData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this._toastService.success(
            '¡Reseña enviada!',
            'Tu reseña ha sido enviada exitosamente y será revisada antes de publicarse.'
          );
          this.closeReviewModal();
          // Refrescar permiso para que el botón cambie a "Ya calificaste"
          this.refreshReviewPermission();
        },
        error: (error) => {
          console.error('Error al enviar review:', error);
          let errorMessage = 'Ocurrió un error al enviar tu reseña. Por favor, intenta nuevamente.';

          if (error.status === 401) {
            errorMessage = 'Necesitas iniciar sesión para escribir una reseña.';
          } else if (error.status === 409) {
            errorMessage = 'Ya escribiste una reseña para este producto.';
            // Sincronizar UI con el estado real
            this.refreshReviewPermission();
          } else if (error.status === 400) {
            errorMessage = 'Los datos de la reseña no son válidos. Verifica la información.';
          } else if (error.status === 404) {
            errorMessage = 'El producto no fue encontrado.';
          }

          this._toastService.error('Error al enviar reseña', errorMessage);
        },
        complete: () => {
          this.isSubmittingReview = false;
        }
      });
  }

  selectTap(tapNumber: number) {
    this.tapSelected = tapNumber;
  }

  onLoadmodel3dUrl() {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  // Zoom methods
  onMouseEnterImage() {
    this.isZoomActive = true;
  }

  onMouseLeaveImage() {
    this.isZoomActive = false;
  }

  onMouseMoveImage(event: MouseEvent) {
    if (!this.isZoomActive) return;

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Calcular la posición del mouse relativa al contenedor
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    this.zoomBackgroundPosition = `${x}% ${y}%`;
  }

  // Carousel methods
  onCarouselScroll(event: Event) {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const carousel = event.target as HTMLElement;
    const scrollPosition = carousel.scrollLeft;
    const itemWidth = carousel.offsetWidth;
    
    // Calcular índice actual basado en la posición del scroll
    const index = Math.round(scrollPosition / itemWidth);
    this.currentImageIndex = index;
  }

  scrollToImage(index: number) {
    if (!isPlatformBrowser(this.platformId) || !this.imageCarousel) return;
    
    const carousel = this.imageCarousel.nativeElement;
    const itemWidth = carousel.offsetWidth;
    
    carousel.scrollTo({
      left: itemWidth * index,
      behavior: 'smooth'
    });
    
    this.currentImageIndex = index;
  }

  selectSubscription($event?: any) {
    if ($event) $event.preventDefault();

    this._metaAnalytics.trackCustomEvent('ViewContent', {
      content_name: 'Plan Suscripción Creatina 250gr',
      content_ids: ['creatina-250gr-suscripcion'],
      content_type: 'subscription',
      value: this.ENV.precioCreatinaSubscription,
      currency: 'PEN',
      content_category: 'suscripcion_mensual'
    });

    this.isSelectSubscription.set(true);
    this.isSelectOnePurchase.set(false);
    this.subscriptionOption?.expand();
    this.onePurchaseOption?.collapse();
  }

  selectOnePurchase($event?: any) {
    if ($event) $event.preventDefault();

    this._metaAnalytics.trackCustomEvent('ViewContent', {
      content_name: 'Compra Única Creatina 250gr',
      content_ids: ['creatina-monohidratada-250-gr'],
      content_type: 'product',
      value: this.ENV.precioCreatinaOnePurchase,
      currency: 'PEN'
    });

    this.isSelectSubscription.set(false);
    this.isSelectOnePurchase.set(true);
    this.onePurchaseOption?.expand();
    this.subscriptionOption?.collapse();
  }

  chosePlan(chosePlan: ChosePlanSummary) {
    console.log(chosePlan);
  }

  agregarCarrito() {
    if (this.isSelectSubscription()) {
      this._shoppingCartService.addProductToCart({
        product: {
          id: '1',
          name: 'Subscripcion mensual de ' + this.productName,
          price: this.productPriceSubscription,
          imageUrl: this.principalImgFront,
          slug: this.slug,
        },
        quantity: 1
      });
      this._tiktokAnalytics.trackAddToCart({
        contents: [{
          content_id: this.slug,
          content_name: 'Subscripcion mensual de ' + this.productName,
          content_type: 'product',
        }],
        value: this.productPriceSubscription,
        currency: 'PEN'
      });

      // Tracking Meta Analytics
      this._metaAnalytics.trackAddToCart({
        value: this.productPriceSubscription,
        currency: 'PEN',
        content_name: 'Subscripcion mensual de ' + this.productName,
        content_ids: [this.slug],
        content_type: 'product',
        contents: [{
          id: this.slug,
          quantity: 1,
          item_price: this.productPriceSubscription
        }]
      });

      setTimeout(() => {
        this._shoppingCartService.openCart();
      }, 500);
    }
    else if (this.isSelectOnePurchase()) {
      this._shoppingCartService.addProductToCart({
        product: {
          id: '00000009-50eb-4ac3-aa94-1b64fbf32b9c',
          name: this.productName,
          price: this.productPriceOnePurchase,
          imageUrl: this.principalImgFront,
          slug: this.slug
        },
        quantity: this.quantity()
      });
      this._tiktokAnalytics.trackAddToCart({
        contents: [{
          content_id: this.slug,
          content_name: this.productName,
          content_type: 'product',
        }],
        value: this.productPriceOnePurchase,
        currency: 'PEN'
      });

      // Tracking Meta Analytics
      this._metaAnalytics.trackAddToCart({
        value: this.productPriceOnePurchase,
        currency: 'PEN',
        content_name: this.productName,
        content_ids: [this.slug],
        content_type: 'product',
        contents: [{
          id: this.slug,
          quantity: this.quantity(),
          item_price: this.productPriceOnePurchase
        }]
      });

      this.quantity.set(1);
      setTimeout(() => {
        this._shoppingCartService.openCart();
      }, 500);
    }
  }

  isButtonDisabled() {
    return !this.isSelectSubscription() && !this.isSelectOnePurchase() || this.isOutOfStock;
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const selParam = this.route.snapshot.queryParams['sel'];
    if (selParam === '2') {
      this.selectSubscription();
    } else {
      this.selectOnePurchase();
    }
  }

  irRegistro() {
    if (this.slug === 'creatina-monohidratada-250-gr') {
      this._summaryService.setChoosePlan({
        selection: SummaryEnum.CREATINA_250G_SUBSCRIPTION,
        descriptionOne: 'Plan mensual de S/'+ this.ENV.precioCreatinaSubscription + '.',
        descriptionTwo: 'Ganas '+ this.ENV.creditoRegaloPorCompraMes + ' Magropuntos 🎁 .',
        descrptionThree: this.ENV.campanaPrimeraCreatina.textos.descripcionCarrito(this.ENV.campanaPrimeraCreatina.gramos),
        descrptionFour: 'Periodo de prueba de '+ this.ENV.diasNormalesDePruebaOperiodoDeReflexion+' días.',
        quantity: 1
      })
    }
    else if (this.slug === 'creatina-monohidratada-500-gr') {
      this._summaryService.setChoosePlan({
        selection: SummaryEnum.CREATINA_500G_SUBSCRIPTION,
        descriptionOne: 'Plan mensual de S/'+ this.ENV.precioCreatina500gSubscription + '.',
        descriptionTwo: 'Ganas '+ this.ENV.creditoRegaloPorCompraMes + ' Magropuntos 🎁 .',
        descrptionThree: this.ENV.campanaPrimeraCreatina.textos.descripcionCarrito(this.ENV.campanaPrimeraCreatina.gramos),
        descrptionFour: 'Periodo de prueba de '+ this.ENV.diasNormalesDePruebaOperiodoDeReflexion+' días.',
        quantity: 1,
      })
    }
    else if (this.slug === 'creatina-monohidratada-3-kg') {
      this._summaryService.setChoosePlan({
        selection: SummaryEnum.CREATINA_3KG_SUBSCRIPTION,
        descriptionOne: 'Plan mensual de S/'+ this.ENV.precioCreatina3kgSubscription + '.',
        descriptionTwo: 'Ganas '+ this.ENV.creditoRegaloPorCompraAño + ' Magropuntos 🎁 .',
        descrptionThree: this.ENV.campanaPrimeraCreatina.textos.descripcionCarrito(this.ENV.campanaPrimeraCreatina.gramos),
        descrptionFour: 'Periodo de prueba de '+ this.ENV.diasNormalesDePruebaOperiodoDeReflexion+' días.',
        quantity: 1
      })
    }

    this.router.navigate(['registro/crear-cuenta']);
  }

  private loadSEO() {
    const URL = 'https://magrolabs.com/productos/creatinas/' + this.slug;
    const image = 'https://magrolabs.com/' + this.principalImgFront;
    
    let title: string;
    let description: string;
    let keywords: string[];

    // Configuración SEO específica por producto
    if (this.slug === 'creatina-monohidratada-250-gr') {
      title = `Creatina Monohidrato 250g | S/${this.ENV.precioCreatinaSubscription}/mes | Envío Gratis - Magrolabs`;
      description = `🚀 Creatina monohidrato 99.9% pura 250g | ${this.ENV.campanaPrimeraCreatina.textos.descripcionSEO} | S/${this.ENV.precioCreatinaSubscription}/mes | ${this.ENV.nroServicios250g} servicios | ${this.ENV.creditoRegaloPorCompraMes} Magropuntos mensuales | Envío gratis Lima | ⭐ ${this.reviewStats.averageRating}/5 (${this.reviewStats.totalReviews} reviews)`;
      keywords = [
        'creatina'
      ];
    } else if (this.slug === 'creatina-monohidratada-100-gr') {
      title = `Creatina ${this.ENV.campanaPrimeraCreatina.gramos}g ${this.ENV.campanaPrimeraCreatina.textos.ofertaConPrecio} | Prueba ahora | Envío gratuito - Magrolabs`;
      description = `🎁 Creatina monohidrato ${this.ENV.campanaPrimeraCreatina.gramos}g ${this.ENV.campanaPrimeraCreatina.textos.ofertaMedia} | ${this.ENV.nroServicios100g} servicios | Período de prueba ${this.ENV.diasNormalesDePruebaOperiodoDeReflexion} días | Envío gratis Lima | Sin compromisos | ⭐ ${this.reviewStats.averageRating}/5 (${this.reviewStats.totalReviews} reviews)`;
      keywords = [
        'creatina'
      ];
    } else if (this.slug === 'creatina-monohidratada-3-kg') {
      title = `Creatina Monohidrato 3kg | S/${this.ENV.precioCreatina3kgSubscription}/año | ${this.ENV.nroServicios3kg} servicios - Magrolabs`;
      description = `💪 Creatina monohidrato 3kg premium | S/${this.ENV.precioCreatina3kgSubscription}/año | ${this.ENV.nroServicios3kg} servicios | ${this.ENV.creditoRegaloPorCompraAño} Magropuntos anuales | Máximo ahorro | ⭐ ${this.reviewStats.averageRating}/5 (${this.reviewStats.totalReviews} reviews)`;
      keywords = [
        'creatina 3kg Peru', 'creatina bulk', 'creatina mayor cantidad',
        'suplementos al por mayor', 'creatina anual', 'mejor precio creatina',
        'creatina 3000g', 'suplementos gym profesional', 'creatina entrenadores'
      ];
    } else {
      title = this.productName + ' - Magrolabs';
      description = 'Creatina monohidrato premium de alta calidad para mejorar tu rendimiento deportivo.';
      keywords = ['creatina', 'suplementos', 'magrolabs'];
    }

    // SEO básico optimizado
    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setKeywords(keywords.join(', '));
    this._seo.setCanonicalURL(URL);
    this._seo.setIndexFollow(true);

    // Open Graph optimizado para redes sociales
    this._seo.setOpenGraph({
      type: 'product',
      site_name: 'Magrolabs',
      title: title,
      description: description,
      image: image,
      url: URL,
      locale: 'es_PE',
      'image:width': '1200',
      'image:height': '630',
      'image:alt': `${this.productName} - Creatina Premium Magrolabs`,
      'product:price:amount': this.isFreeCreatine ? '0' : this.productPriceSubscription.toString(),
      'product:price:currency': 'PEN',
      'product:availability': this.isOutOfStock ? 'out of stock' : 'in stock',
      'product:condition': 'new',
      'product:brand': 'Magrolabs',
      'product:category': 'Suplementos Deportivos'
    });

    // Twitter Card optimizado
    this._seo.setTwitterCard({
      'twitter:card': 'summary_large_image',
      'twitter:site': '@magrolabs',
      'twitter:creator': '@magrolabs',
      'twitter:url': URL,
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
      'twitter:image:alt': `${this.productName} - Creatina Premium Magrolabs`,
      'twitter:label1': 'Precio',
      'twitter:data1': this.isFreeCreatine ? this.ENV.campanaPrimeraCreatina.textos.ofertaCorta : `S/${this.productPriceSubscription}`,
      'twitter:label2': 'Disponibilidad',
      'twitter:data2': this.isOutOfStock ? 'Próximamente' : 'En stock'
    });

    // Hreflang para SEO internacional
    this._seo.setHreflangs([
      { lang: 'es', url: URL },
      { lang: 'es-pe', url: URL },
      { lang: 'x-default', url: URL }
    ]);

    // Datos estructurados avanzados
    this.setAdvancedStructuredData(URL, image, title, description);
  }

  /**
   * Configura datos estructurados avanzados específicos por producto
   */
  private setAdvancedStructuredData(url: string, image: string, title: string, description: string) {
    // Schema principal del producto optimizado
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': url,
      name: this.productName,
      description: description,
      image: [image],
      url: url,
      sku: this.slug,
      gtin13: this.getGTIN13(),
      brand: {
        '@type': 'Brand',
        name: 'Magrolabs',
        url: 'https://magrolabs.com'
      },
      manufacturer: {
        '@type': 'Organization',
        name: 'Magrolabs',
        url: 'https://magrolabs.com'
      },
      category: 'Suplementos Deportivos > Creatina',
      additionalType: 'https://schema.org/DietarySupplement',
      weight: {
        '@type': 'QuantitativeValue',
        value: this.getProductWeight(),
        unitCode: 'GRM'
      },
      offers: this.getOfferSchema(url, image),
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: this.reviewStats.averageRating.toString(),
        reviewCount: this.reviewStats.totalReviews.toString(),
        bestRating: '5',
        worstRating: '1'
      },
      additionalProperty: this.getProductProperties(),
      potentialAction: {
        '@type': 'BuyAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: url,
          actionPlatform: [
            'http://schema.org/DesktopWebPlatform',
            'http://schema.org/MobileWebPlatform'
          ]
        },
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: this.isFreeCreatine ? '0' : this.productPriceSubscription,
          priceCurrency: 'PEN'
        }
      }
    };

    // Breadcrumb Schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
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
          name: 'Tienda',
          item: 'https://magrolabs.com/productos'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Creatinas',
          item: 'https://magrolabs.com/productos/creatinas'
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: this.productName,
          item: url
        }
      ]
    };

    // Aplicar todos los schemas
    this._seo.setStructuredData(productSchema);
    this._seo.setStructuredData(breadcrumbSchema);

    // Schema adicional para producto gratis
    if (this.isFreeCreatine) {
      const freeOfferSchema = {
        '@context': 'https://schema.org',
        '@type': 'Offer',
        '@id': `${url}#free-offer`,
        name: `${this.productName} - Muestra Gratuita`,
        description: `Prueba nuestra creatina premium durante ${this.ENV.diasNormalesDePruebaOperiodoDeReflexion} días`,
        price: '0',
        priceCurrency: 'PEN',
        availability: 'https://schema.org/InStock',
        url: 'https://magrolabs.com/registro',
        validThrough: '2025-12-31',
        itemOffered: {
          '@type': 'Product',
          name: this.productName,
          image: [image]
        },
        seller: {
          '@type': 'Organization',
          name: 'Magrolabs'
        },
        additionalProperty: [
          {
            '@type': 'PropertyValue',
            name: 'Período de prueba',
            value: `${this.ENV.diasNormalesDePruebaOperiodoDeReflexion} días`
          },
          {
            '@type': 'PropertyValue',
            name: 'Envío',
            value: 'Gratis a Lima Metropolitana'
          }
        ]
      };
      this._seo.setStructuredData(freeOfferSchema);
    }
  }

  /**
   * Genera el GTIN13 según el producto
   */
  private getGTIN13(): string {
    const gtinMap: Record<string, string> = {
      'creatina-monohidratada-250-gr': '7751234567890',
      'creatina-monohidratada-100-gr': '7751234567891',
      'creatina-monohidratada-3-kg': '7751234567892'
    };
    return gtinMap[this.slug] || '7751234567890';
  }

  /**
   * Obtiene el peso del producto en gramos
   */
  private getProductWeight(): number {
    if (this.slug === 'creatina-monohidratada-250-gr') return 250;
    if (this.slug === 'creatina-monohidratada-100-gr') return 100;
    if (this.slug === 'creatina-monohidratada-3-kg') return 3000;
    return 250;
  }

  /**
   * Genera el schema de ofertas según el producto
   */
  private getOfferSchema(url: string, image: string) {
    const baseOffer = {
      '@type': 'Offer',
      '@id': `${url}#offer`,
      price: this.isFreeCreatine ? '0' : this.productPriceSubscription.toString(),
      priceCurrency: 'PEN',
      availability: this.isOutOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: this.isFreeCreatine ? 'https://magrolabs.com/registro' : url,
      seller: {
        '@type': 'Organization',
        name: 'Magrolabs'
      },
      validFrom: '2024-01-01',
      validThrough: '2025-12-31',
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
    };

    // Agregar offer adicional para compra única si aplica
    if (!this.isFreeCreatine && !this.isOutOfStock) {
      return [
        baseOffer,
        {
          '@type': 'Offer',
          '@id': `${url}#one-time-offer`,
          name: 'Compra única',
          price: this.productPriceOnePurchase.toString(),
          priceCurrency: 'PEN',
          availability: 'https://schema.org/InStock',
          url: url,
          seller: {
            '@type': 'Organization',
            name: 'Magrolabs'
          },
          itemOffered: {
            '@type': 'Product',
            name: this.productName,
            image: [image]
          }
        }
      ];
    }

    return baseOffer;
  }

  /**
   * Genera propiedades adicionales del producto
   */
  private getProductProperties() {
    return [
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
        name: 'Servicios',
        value: this.productServicesAndWeight
      },
      {
        '@type': 'PropertyValue',
        name: 'Gluten Free',
        value: 'Sí'
      },
      {
        '@type': 'PropertyValue',
        name: 'Magropuntos mensuales',
        value: `${this.credits} Magropuntos`
      }
    ];
  }

  private trackProductView() {
    this._tiktokAnalytics.trackViewContent({
      contents: [{
        content_id: this.slug,
        content_type: 'product',
        content_name: this.productName
      }],
      value: this.productPriceSubscription,
      currency: 'PEN'
    });
  }

}
