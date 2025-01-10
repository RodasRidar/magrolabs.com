import { Component, ElementRef, inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { environment } from '../../../../../../../environments/env';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { ButtonComponent } from '../../../../../../shared/ui/button/button.component';
import { ChosePlanSummary, SummaryEnum } from '../../../../../../shared/models/summary.model';
import { ShoppingCartService } from '../../../../../../shared/services/cart-service.service';
import { SummaryService } from '../../../../../../shared/services/summary-service.service';
import { SeoService } from '../../../../../../shared/services/seo.service';
import { SinceDatePipe } from '../../../../../../shared/pipes/since-date.pipe';

@Component({
  selector: 'app-creatinas',
  standalone: true,
  imports: [CurrencyPipe, ButtonComponent, NgOptimizedImage, RouterLink, CommonModule, SinceDatePipe],
  templateUrl: './creatinas.component.html',
  styleUrl: './creatinas.component.css'
})
export class CreatinasComponent {
  writeReview() {
    throw new Error('Method not implemented.');
  }
  @ViewChild('Subscription', { static: false }) subscriptionElement!: ElementRef<HTMLDetailsElement>;
  @ViewChild('OnePurchase', { static: false }) onePurchaseElement!: ElementRef<HTMLDetailsElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private _shoppingCartService = inject(ShoppingCartService);
  private _summaryService = inject(SummaryService);
  private _seo = inject(SeoService)



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

  reviewDate1 = new Date('2024-12-27')
  reviewDate2 = new Date('2025-01-04')
  reviewDate3 = new Date('2025-01-05')
  reviewDate4 = new Date('2025-01-06')
  reviewDate5 = new Date('2025-01-07')
  reviewDate6 = new Date('2025-01-08')

  ngOnInit() {

    this.isSelectSubscription = true;
    this.slug = this.route.snapshot.params['slug'];
    // this.productService.getProduct(slug).subscribe(product => {
    //   this.product = product;
    // });
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
      // this.principalImgBack = 'package-image-back.png';
      this.model3dUrl = '250g';
      this.previewmodel3d = 'preview-3d-image.png';
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
    }
    else {
      this.router.navigate(['./404']);
    }

    this.loadSEO();
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
          // discountPercentage: 20,
          // is_on_sale: true
        },
        quantity: 1
      });
      setTimeout(() => {
        this._shoppingCartService.openCart();
      }, 500);
      // this._summaryService.setChoosePlan({
      //   selection: SummaryEnum.CREATINA_250G_SUBSCRIPTION,
      //   descriptionOne: 'Monohidratada 100%',
      //   descriptionTwo: 'Plan mensual de S/47',
      //   descrptionThree: 'Creatina 100g (gratis)',
      //   quantity: 1
      // })

      // this._router.navigate(['registro/verificacion']);
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
      // this._summaryService.setChoosePlan({
      //   selection: SummaryEnum.CREATINA_250G_ONE_PURCHASE,
      //   descriptionOne: 'Monohidratada 100%',
      //   descriptionTwo: 'Compra única de S/59',
      //   quantity: 1
      // })

      // this._router.navigate(['registro/verificacion']);
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
    
    // this._seo.meta.updateTag({ property: 'product:pretax_price:amount', content: '119.00' }, 'property="product:pretax_price:amount"');
    // this._seo.meta.updateTag({ property: 'product:pretax_price:currency', content: 'PEN' }, 'property="product:pretax_price:currency"');
    this._seo.meta.updateTag({ property: 'product:condition', content: 'new' }, 'property="product:condition"');
    this._seo.meta.updateTag({ property: 'product:availability', content: this.isOutOfStock ? 'out of stock' : 'in stock' }, 'property="product:availability"');
    this._seo.meta.updateTag({ property: 'product:brand', content: 'Magrolabs' }, 'property="product:brand"');
    this._seo.meta.updateTag({ property: 'product:category', content: 'Suplementos' }, 'property="product:category"');
    // this._seo.meta.updateTag({ property: 'product:retailer_item_id', content: '1' }, 'property="product:retailer_item_id"');

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
