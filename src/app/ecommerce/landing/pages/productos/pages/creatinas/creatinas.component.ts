import { Component, ElementRef, inject, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { environment } from '../../../../../../../environments/env';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { ButtonComponent } from '../../../../../../shared/ui/button/button.component';
import { ChosePlanSummary, SummaryEnum } from '../../../../../../shared/models/summary.model';
import { ShoppingCartService } from '../../../../../../shared/services/cart-service.service';
import { SummaryService } from '../../../../../../shared/services/summary-service.service';
import { SeoService } from '../../../../../../shared/services/seo.service';
import { SinceDatePipe } from '../../../../../../shared/pipes/since-date.pipe';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../../../shared/services/auth.service';
import { ReviewService } from '../../../../../../shared/services/review.service';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { ReviewsListComponent } from '../../../../../../shared/ui/reviews-list/reviews-list.component';
import { ReviewSkeletonComponent } from '../../../../../../shared/ui/review-skeleton/review-skeleton.component';
import { StarRatingComponent } from '../../../../../../shared/ui/star-rating/star-rating.component';
import { OrderService } from '../../../../../../shared/services/order.service';
import { SubscriptionService } from '../../../../../../shared/services/subscription.service';
import { forkJoin } from 'rxjs';
import { OrderStatus } from '../../../../../../shared/interfaces/order.interfaces';
import { TiktokAnalyticsService } from '../../../../../../shared/services/tiktok-analytics.service';

@Component({
  selector: 'app-creatinas',
  standalone: true,
  imports: [CurrencyPipe, ButtonComponent, NgOptimizedImage, RouterLink, CommonModule, ReactiveFormsModule, ReviewsListComponent, ReviewSkeletonComponent, StarRatingComponent],
  templateUrl: './creatinas.component.html',
  styleUrl: './creatinas.component.css'
})
export class CreatinasComponent {
  @ViewChild('Subscription', { static: false }) subscriptionElement!: ElementRef<HTMLDetailsElement>;
  @ViewChild('OnePurchase', { static: false }) onePurchaseElement!: ElementRef<HTMLDetailsElement>;

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
  private _orderService = inject(OrderService);
  private _subscriptionService = inject(SubscriptionService);
  private _tiktokAnalytics = inject(TiktokAnalyticsService);

  ENV = environment
  productName = '';
  productPriceOnePurchase = 0;
  productPriceSubscription = 0;
  productServicesAndWeight = '';
  credits = this.ENV.creditoRegaloPorCompraMes;
  reviews = 6;
  recurrencia = '30 días';
  principalImgFront = ''
  principalImgBack = ''
  previewmodel3d = ''
  model3dUrl = ''
  tapSelected = 2;

  isOutOfStock = false;
  isFreeCreatine = false;
  isLogged = false;
  slug = '';
  isSelectSubscription = false;
  isSelectOnePurchase = false;
  isLoading = true;

  // Modal review properties
  isReviewModalOpen = false;
  isSubmittingReview = false;
  isCheckingReviewPermission = false;
  selectedRating = 0;
  hoveredRating = 0;
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

  // Review form
  reviewForm = this._formBuilder.group({
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.maxLength(250), Validators.minLength(10)]]
  });

  // Los schemas JSON-LD ahora se generan dinámicamente en setAdvancedStructuredData()
  // para evitar duplicación del campo "brand" reportada por Google Search Console

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
    this._authService.isAuthenticated$.subscribe(isAuth => {
      this.isLogged = isAuth;
    });
    
    this.isSelectSubscription = true;
    this.slug = this.route.snapshot.params['slug'];
    
    // Verificar si viene el parámetro review=true
    const reviewParam = this.route.snapshot.queryParams['review'];
    if (reviewParam === 'true' && this.isLogged) {
      // Verificar si el usuario puede escribir una reseña antes de abrir el modal
      this.checkUserCanReview();
    }

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
      this.principalImgFront = 'banner_2.png';
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
      this.principalImgFront = 'package-image.png';
      this.model3dUrl = '250g';
      this.previewmodel3d = '3d.png';
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
      this.previewmodel3d = '3d.png';
      // this._seo.setStructuredData(this.jsonLD_3Kg); // Removido para evitar duplicación con setAdvancedStructuredData
    }
    else {
      this.router.navigate(['./404']);
    }
    this.trackProductView();
    this.loadSEO();
  }

  writeReview() {
    if (!this.isLogged) {
      const returnUrl = `/productos/creatinas/${this.slug}?review=true`;
      this.router.navigate(['/login'], { queryParams: { returnUrl } });
      return;
    }

    // Verificar si el usuario puede escribir una reseña para este producto
    this.checkUserCanReview();
  }

  private checkUserCanReview() {
    const productId = this.getProductId();
    this.isCheckingReviewPermission = true;
    
    this._reviewService.canUserReviewProduct(productId).subscribe({
      next: (response) => {
        if (response.can_review) {
          this.openReviewModal();
        } else {
          const message = response.message || 'Debes haber recibido este producto para poder escribir una reseña.';
          this._toastService.error(
            'No puedes escribir una reseña',
            message
          );
        }
      },
      error: (error) => {
        console.error('Error al verificar si puede escribir reseña:', error);
        
        // Si el endpoint no existe (404), usar método alternativo
        if (error.status === 404) {
          this.checkUserCanReviewAlternative();
          return;
        }
        
        let errorMessage = 'No se pudo verificar si puedes escribir una reseña. Intenta nuevamente.';
        
        if (error.status === 401) {
          errorMessage = 'Necesitas iniciar sesión para escribir una reseña.';
        }
        
        this._toastService.error('Error', errorMessage);
      },
      complete: () => {
        this.isCheckingReviewPermission = false;
      }
    });
  }

  private checkUserCanReviewAlternative() {
    const productId = this.getProductId();
    
    // Verificar tanto órdenes como suscripciones en paralelo
    forkJoin({
      orders: this._orderService.getMyOrders(1, 100), // Obtener todas las órdenes
      subscriptions: this._subscriptionService.getMySubscriptions(1, 100) // Obtener todas las suscripciones
    }).subscribe({
      next: (response) => {
        const hasReceivedProduct = this.checkIfUserReceivedProduct(productId, response.orders, response.subscriptions);
        
        if (hasReceivedProduct) {
          this.openReviewModal();
        } else {
          this._toastService.error(
            'No puedes escribir una reseña',
            'Debes haber recibido este producto para poder escribir una reseña. Realiza una compra o suscríbete primero.'
          );
        }
      },
      error: (error) => {
        console.error('Error al verificar órdenes y suscripciones:', error);
        this._toastService.error(
          'Error',
          'No se pudo verificar tu historial de compras. Intenta nuevamente.'
        );
      },
      complete: () => {
        this.isCheckingReviewPermission = false;
      }
    });
  }

  private checkIfUserReceivedProduct(productId: string, ordersResponse: any, subscriptionsResponse: any): boolean {
    // Verificar en órdenes entregadas
    const deliveredOrders = ordersResponse.data?.orders?.filter((order: any) => 
      order.status === OrderStatus.DELIVERED
    ) || [];
    
    const hasProductInOrders = deliveredOrders.some((order: any) =>
      order.orderItems?.some((item: any) => item.product_id === productId)
    );
    
    if (hasProductInOrders) {
      return true;
    }
    
    // Verificar en suscripciones activas o que hayan tenido al menos un envío
    const activeOrPastSubscriptions = subscriptionsResponse.data?.subscriptions?.filter((subscription: any) =>
      subscription.status === 'ACTIVE' || 
      subscription.status === 'PAUSED' || 
      subscription.status === 'CANCELLED' ||
      subscription.status === 'TO_CANCEL'
    ) || [];
    
    // Para suscripciones, asumimos que si tiene una suscripción activa o pasada del producto, ha recibido al menos un envío
    const hasProductInSubscriptions = activeOrPastSubscriptions.some((subscription: any) =>
      subscription.subscription_plan?.product_id === productId ||
      subscription.product_id === productId
    );
    
    return hasProductInSubscriptions;
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

  public getProductId(): string {
    // Mapear el slug a un product_id (en un caso real esto vendría de una API o base de datos)
    const productIdMap: { [key: string]: string } = {
      'creatina-monohidratada-250-gr': '00000001-50eb-4ac3-aa94-1b64fbf32b9c',
      'creatina-monohidratada-100-gr': '00000002-50eb-4ac3-aa94-1b64fbf32b9c',
      'creatina-monohidratada-3-kg': '00000004-50eb-4ac3-aa94-1b64fbf32b9c'
    };
    
    return productIdMap[this.slug] || this.slug;
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

    this._reviewService.createReview(reviewData).subscribe({
      next: (response) => {
        console.log('Review creada exitosamente:', response);
        this._toastService.success(
          '¡Reseña enviada!', 
          'Tu reseña ha sido enviada exitosamente y será revisada antes de publicarse.'
        );
        this.closeReviewModal();
      },
      error: (error) => {
        console.error('Error al enviar review:', error);
        let errorMessage = 'Ocurrió un error al enviar tu reseña. Por favor, intenta nuevamente.';
        
        // Manejar errores específicos de la API
        if (error.status === 401) {
          errorMessage = 'Necesitas iniciar sesión para escribir una reseña.';
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

  chosePlan(chosePlan: ChosePlanSummary) {
    console.log(chosePlan);
  }

  agregarCarrito() {
    if (this.isSelectSubscription) {
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
      setTimeout(() => {
        this._shoppingCartService.openCart();
      }, 500);
    }
    else if (this.isSelectOnePurchase) {
      this._shoppingCartService.addProductToCart({
        product: {
          id: '2',
          name: this.productName,
          price: this.productPriceOnePurchase,
          imageUrl: this.principalImgFront,
          slug: this.slug
        },
        quantity: 1
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
      setTimeout(() => {
        this._shoppingCartService.openCart();
      }, 500);
    }
  }

  isButtonDisabled() {
    return !this.isSelectSubscription && !this.isSelectOnePurchase || this.isOutOfStock;
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId) && this.slug !== 'creatina-monohidratada-100-gr') {
      this.subscriptionElement.nativeElement.open = true;
    }
  }

  irRegistro() {
    if (this.slug === 'creatina-monohidratada-250-gr') {
      this._summaryService.setChoosePlan({
        selection: SummaryEnum.CREATINA_250G_SUBSCRIPTION,
        descriptionOne: 'Plan mensual de S/'+ this.ENV.precioCreatinaSubscription + '.',
        descriptionTwo: 'Ganas '+ this.ENV.creditoRegaloPorCompraMes + ' Magropuntos.',
        descrptionThree: 'Creatina ' + this.ENV.creatinaFreeGramos + 'gr (gratis) 🎁',
        descrptionFour: 'Periodo de prueba de '+ this.ENV.diasNormalesDePruebaOperiodoDeReflexion+' días.',
        quantity: 1
      })
    }
    else if (this.slug === 'creatina-monohidratada-500-gr') {
      this._summaryService.setChoosePlan({
        selection: SummaryEnum.CREATINA_500G_SUBSCRIPTION,
        descriptionOne: 'Plan mensual de S/'+ this.ENV.precioCreatina500gSubscription + '.',
        descriptionTwo: 'Ganas '+ this.ENV.creditoRegaloPorCompraMes + ' Magropuntos.',
        descrptionThree: 'Creatina ' + this.ENV.creatinaFreeGramos + 'gr (gratis) 🎁',
        descrptionFour: 'Periodo de prueba de '+ this.ENV.diasNormalesDePruebaOperiodoDeReflexion+' días.',
        quantity: 1,
      })
    }
    else if (this.slug === 'creatina-monohidratada-3-kg') {
      this._summaryService.setChoosePlan({
        selection: SummaryEnum.CREATINA_3KG_SUBSCRIPTION,
        descriptionOne: 'Plan mensual de S/'+ this.ENV.precioCreatina3kgSubscription + '.',
        descriptionTwo: 'Ganas '+ this.ENV.creditoRegaloPorCompraAño + ' Magropuntos.',
        descrptionThree: 'Creatina ' + this.ENV.creatinaFreeGramos + 'gr (gratis) 🎁',
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
      description = `🚀 Creatina monohidrato 99.9% pura 250g | Primera GRATIS | S/${this.ENV.precioCreatinaSubscription}/mes | ${this.ENV.nroServicios250g} servicios | ${this.ENV.creditoRegaloPorCompraMes} Magropuntos mensuales | Envío gratis Lima | ⭐ ${this.reviewStats.averageRating}/5 (${this.reviewStats.totalReviews} reviews)`;
      keywords = [
        'creatina monohidrato 250g', 'creatina suscripcion Peru', 'suplementos gym Lima',
        'creatina premium', 'creatina envio gratis', 'mejor creatina Peru',
        'suplementos deportivos', 'creatina fitness', 'magrolabs creatina 250gr',
        'creatina musculacion', 'suplemento fuerza', 'creatina crossfit'
      ];
    } else if (this.slug === 'creatina-monohidratada-100-gr') {
      title = `Creatina GRATIS 100g | Prueba sin costo | Envío gratuito - Magrolabs`;
      description = `🎁 Creatina monohidrato 100g COMPLETAMENTE GRATIS | ${this.ENV.nroServicios100g} servicios | Período de prueba ${this.ENV.diasNormalesDePruebaOperiodoDeReflexion} días | Envío gratis Lima | Sin compromisos | ⭐ ${this.reviewStats.averageRating}/5 (${this.reviewStats.totalReviews} reviews)`;
      keywords = [
        'creatina gratis Peru', 'muestra gratis creatina', 'prueba creatina sin costo',
        'creatina 100g gratis', 'suplementos gratis Lima', 'magrolabs gratis',
        'creatina trial', 'periodo prueba creatina', 'creatina sin compromiso'
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
      'twitter:data1': this.isFreeCreatine ? 'GRATIS' : `S/${this.productPriceSubscription}`,
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
          name: 'Productos',
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
        description: `Prueba gratis nuestra creatina premium sin costo ni compromiso durante ${this.ENV.diasNormalesDePruebaOperiodoDeReflexion} días`,
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
    const gtinMap: { [key: string]: string } = {
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
