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
  tapSelected = 1;

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

  jsonLD_250Gr = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "Creatina Monohidratada 250 gr",
    "image": [
      "https://magrolabs.com/package-image.png"
    ],
    "description": "Creatina Monohidratada de 250 gr ecofriendly para mejorar el rendimiento durante entrenamientos intensos.",
    "sku": "CREATINA250GR",
    "brand": {
      "@type": "Brand",
      "name": "Magrolabs"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4",
      "reviewCount": "6"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://magrolabs.com/productos/creatinas/creatina-monohidratada-250-gr",
      "priceCurrency": "PEN",
      "price": this.ENV.precioCreatinaSubscription,
      "availability": "https://schema.org/InStock"
    }
  };

  jsonLD_100Gr = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "Creatina Monohidratada 100 gr",
    "image": [
      "https://magrolabs.com/package-image.png"
    ],
    "description": "Creatina Monohidratada de 100 gr ecofriendly para mejorar el rendimiento durante entrenamientos intensos.",
    "sku": "CREATINA100GR",
    "brand": {
      "@type": "Brand",
      "name": "Magrolabs"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4",
      "reviewCount": "6"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://magrolabs.com/productos/creatinas/creatina-monohidratada-100-gr",
      "priceCurrency": "PEN",
      "price": "0.00",
      "availability": "https://schema.org/InStock"
    }
  };

  jsonLD_3Kg = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "Creatina Monohidratada 3 kg",
    "image": [
      "https://magrolabs.com/package-image.png"
    ],
    "description": "Creatina Monohidratada de 3 kg ecofriendly para mejorar el rendimiento durante entrenamientos intensos.",
    "sku": "CREATINA3GR",
    "brand": {
      "@type": "Brand",
      "name": "Magrolabs"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4",
      "reviewCount": "6"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://magrolabs.com/productos/creatinas/creatina-monohidratada-3-kg",
      "priceCurrency": "PEN",
      "price": this.ENV.precioCreatina3kgSubscription,
      "availability": "https://schema.org/InStock"
    }
  };

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
      this.principalImgFront = 'package-image.png';
      this.model3dUrl = '250g';
      this.previewmodel3d = 'preview-3d-image.png';
      this._seo.setStructuredData(this.jsonLD_250Gr);
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
      this.previewmodel3d = 'preview-3d-image.png';
      this._seo.setStructuredData(this.jsonLD_100Gr);
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
      this.previewmodel3d = 'preview-3d-image.png';
      this._seo.setStructuredData(this.jsonLD_3Kg);
    }
    else {
      this.router.navigate(['./404']);
    }
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
        descriptionTwo: 'Ganas S/'+ this.ENV.creditoRegaloPorCompraMes + ' de crédito.',
        descrptionThree: 'Creatina ' + this.ENV.creatinaFreeGramos + 'gr (gratis) 🎁',
        descrptionFour: 'Periodo de prueba de '+ this.ENV.diasNormalesDePruebaOperiodoDeReflexion+' días.',
        quantity: 1
      })
    }
    else if (this.slug === 'creatina-monohidratada-500-gr') {
      this._summaryService.setChoosePlan({
        selection: SummaryEnum.CREATINA_500G_SUBSCRIPTION,
        descriptionOne: 'Plan mensual de S/'+ this.ENV.precioCreatina500gSubscription + '.',
        descriptionTwo: 'Ganas S/'+ this.ENV.creditoRegaloPorCompraMes + ' de crédito.',
        descrptionThree: 'Creatina ' + this.ENV.creatinaFreeGramos + 'gr (gratis) 🎁',
        descrptionFour: 'Periodo de prueba de '+ this.ENV.diasNormalesDePruebaOperiodoDeReflexion+' días.',
        quantity: 1,
      })
    }
    else if (this.slug === 'creatina-monohidratada-3-kg') {
      this._summaryService.setChoosePlan({
        selection: SummaryEnum.CREATINA_3KG_SUBSCRIPTION,
        descriptionOne: 'Plan mensual de S/'+ this.ENV.precioCreatina3kgSubscription + '.',
        descriptionTwo: 'Ganas S/'+ this.ENV.creditoRegaloPorCompraAño + ' de crédito.',
        descrptionThree: 'Creatina ' + this.ENV.creatinaFreeGramos + 'gr (gratis) 🎁',
        descrptionFour: 'Periodo de prueba de '+ this.ENV.diasNormalesDePruebaOperiodoDeReflexion+' días.',
        quantity: 1
      })
    }

    this.router.navigate(['registro/crear-cuenta']);
  }

  private loadSEO() {
    const description = '¡Pruébala gratis! Experimenta una suplementación fácil y sostenible con nuestra creatina de alta calidad (envío gratis).';
    const title = this.productName + ' Magrolabs.';
    const URL = 'https://magrolabs.com/productos/creatinas/' + this.slug;
    const image = 'https://magrolabs.com/' + this.principalImgFront;

    this._seo.title.setTitle(title);
    this._seo.setCanonicalURL(URL);
    this._seo.meta.updateTag({ name: 'description', content: description });
    this._seo.setIndexFollow();

    this._seo.setKeywords('creatina monohidratada ' + this.ENV.creatinaSubscription250 + ' gr, suscripción, creatina');

    this._seo.setOpenGraph({
      type: 'product',
      site_name: 'Magrolabs',
      title: title,
      description: description,
      image: image,
      url: URL,
      locale: 'es_PE',
    });
    
    this._seo.meta.updateTag({ property: 'product:condition', content: 'new' }, 'property="product:condition"');
    this._seo.meta.updateTag({ property: 'product:availability', content: this.isOutOfStock ? 'out of stock' : 'in stock' }, 'property="product:availability"');
    this._seo.meta.updateTag({ property: 'product:brand', content: 'Magrolabs' }, 'property="product:brand"');
    this._seo.meta.updateTag({ property: 'product:category', content: 'Suplementos' }, 'property="product:category"');

    this._seo.meta.updateTag({ property: 'product:plural_title', content: title }, 'property="product:plural_title"');
    this._seo.meta.updateTag({ property: 'product:price:amount', content: this.productPriceSubscription.toString() }, 'property="product:price:amount"');
    this._seo.meta.updateTag({ property: 'product:price:currency', content: 'PEN' }, 'property="product:price:currency"');

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
