import { Component, ElementRef, inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { environment } from '../../../../../../../environments/env';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { ButtonComponent } from '../../../../../../shared/ui/button/button.component';
import { ChosePlanSummary, SummaryEnum } from '../../../../../../shared/models/summary.model';

@Component({
  selector: 'app-creatinas',
  standalone: true,
  imports: [CurrencyPipe, ButtonComponent, NgOptimizedImage, RouterLink, CommonModule],
  templateUrl: './creatinas.component.html',
  styleUrl: './creatinas.component.css'
})
export class CreatinasComponent {
  @ViewChild('Subscription', { static: false }) subscriptionElement!: ElementRef<HTMLDetailsElement>;
  @ViewChild('OnePurchase', { static: false }) onePurchaseElement!: ElementRef<HTMLDetailsElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  ENV = environment
  productName = '';
  productPriceOnePurchase = 0;
  productPriceSubscription = 0;
  productServicesAndWeight = '';
  credits = this.ENV.creditoRegaloPorCompraMes;
  reviews = 17;
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

  ngOnInit() {    
    this.isSelectSubscription = true;
    this.slug = this.route.snapshot.params['slug'];
    // this.productService.getProduct(slug).subscribe(product => {
    //   this.product = product;
    // });
    if(this.slug === 'creatina-250g') {
      this.isFreeCreatine = false;
      this.isOutOfStock = false;
      this.productName = 'Creatina Monohidratada 250g';
      this.productPriceOnePurchase = this.ENV.precioCreatinaOnePurchase;
      this.productPriceSubscription = this.ENV.precioCreatinaSubscription;
      this.productServicesAndWeight = this.ENV.creatinaSubscription250+'g. '+this.ENV.nroServicios250g+' servicios.';
      this.credits = this.ENV.creditoRegaloPorCompraMes
      this.reviews = 17;
      this.recurrencia = '30 días';
      this.principalImgFront = 'package-image.png';
      // this.principalImgBack = 'package-image-back.png';
      this.model3dUrl = '250g';
      this.previewmodel3d = 'preview-3d-image.png';
    }
    else if(this.slug === 'creatina-100g') {
      this.isFreeCreatine = true;
      this.isOutOfStock = false;
      this.productName = 'Creatina Monohidratada 100g';
      this.productPriceOnePurchase = 0;
      this.productPriceSubscription = 0;
      this.productServicesAndWeight = this.ENV.creatinaFreeGramos+'g. '+this.ENV.nroServicios100g+' servicios.';
      this.credits = this.ENV.creditoRegaloPorCompraAño
      this.reviews = 17;
      this.principalImgFront = 'package-image.png';
      this.model3dUrl = '250g';
      this.previewmodel3d = 'preview-3d-image.png';
    }
    else if(this.slug === 'creatina-3kg') {
      this.isFreeCreatine = false;
      this.isOutOfStock = true;
      this.productName = 'Creatina Monohidratada 3kg';
      this.productPriceOnePurchase = this.ENV.precioCreatina3kgOnePurchase;
      this.productPriceSubscription = this.ENV.precioCreatina3kgSubscription;
      this.productServicesAndWeight = this.ENV.creatina3kg+'kg. '+this.ENV.nroServicios3kg+' servicios.';
      this.credits = this.ENV.creditoRegaloPorCompraAño
      this.reviews = 17;
      this.recurrencia = 'año';
      this.model3dUrl = '3kg';
      this.principalImgFront = 'package-image-3000.png';
      this.previewmodel3d = 'preview-3d-image.png';
    }
    else{
      this.router.navigate(['./404']);
    }
  }

  selectTap(tapNumber: number) {
    this.tapSelected = tapNumber;
  }

  onLoadmodel3dUrl() {
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
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

  nextStep() {
    if (this.isSelectSubscription) {

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

  ngAfterViewInit(){
    if (isPlatformBrowser(this.platformId)){
      this.subscriptionElement.nativeElement.open = true;
    }
  }
}
