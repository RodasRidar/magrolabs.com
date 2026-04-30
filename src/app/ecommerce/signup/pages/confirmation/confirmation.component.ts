import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { StepComponent } from '../../components/step/step.component';
import { StepEnum } from '../../models/step.model';
import { Information, InformationComponent } from '../../components/information/information.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SummaryService } from '../../../../shared/services/summary-service.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalData, ModalTypeEnum, ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { SeoService } from '../../../../shared/services/seo.service';
import { environment } from '../../../../../environments/env';
import { ConfirmationStatus, SummaryEnum } from '../../../../shared/models/summary.model';
import { ShoppingCartService } from '../../../../shared/services/cart-service.service';
import { EmailService } from '../../../../shared/services/email.service';
import { TiktokAnalyticsService } from '../../../../shared/services/tiktok-analytics.service';
import { MetaAnalyticsService } from '../../../../shared/services/meta-analytics.service';
import { UrgencyBarComponent } from '../../../../shared/ui/urgency-bar/urgency-bar.component';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [StepComponent, ButtonComponent, CommonModule, InformationComponent, RouterLink],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent {
  private _summaryService = inject(SummaryService)
  private _router = inject(Router)
  private _route = inject(ActivatedRoute)
  private _dialog = inject(MatDialog)
  private _seo = inject(SeoService)
  private _shoppingCartService = inject(ShoppingCartService)
  private _emailService = inject(EmailService)
  private _tiktokAnalytics = inject(TiktokAnalyticsService)
  private _metaAnalytics = inject(MetaAnalyticsService)

  ENV = environment
  confirmationStatusEnum = ConfirmationStatus
  stepEnum = StepEnum;
  clientName = '';
  status = ConfirmationStatus.SUBSCRIPTION_SUCCESS;
  creditos = '{{ENV.creditoRegaloPorCompraMes}} Magropuntos';
  shoppingCart = this._shoppingCartService.getShoppingCart();

  informationExitoList: Information[] = [
    { name: `Tu periodo de prueba comienza despues de recibir tu creatina de prueba.` },
    { name: 'Te avisaremos cuando finalice tu periodo de prueba.' },
    { name: `Entrega estimada: ${this.ENV.plazoDeEntregaHorasCreatinaFree.min} a ${this.ENV.plazoDeEntregaHorasCreatinaFree.max} horas.` },
  ]

  informationErrorList: Information[] = [
    { name: 'El email de confirmación está en camino, si no lo recibes puedes revisar tu bandeja de spam.' },
    { name: `Tu periodo de prueba comienza despues de recibir tu creatina de prueba.` },
    { name: 'En las proximas 48 horas nos pondremos en contacto vía Whatsapp.' },
    { name: 'Coordinaremos la entrega contigo.' },
  ]

  informationCompraExitoRegistroList: Information[] = [
    { name: 'Puedes darle seguimiento a tu pedido en tu cuenta de Magrolabs.' },
    { name: 'Enviaremos tu creatina lo antes posible.' },
    { name: 'Fecha de entrega estimada: ' + this.getDatePlusDays(this.ENV.plazoDeEntregaDiasHabiles.max) },
  ]

  informationCompraExitoSinRegistroList: Information[] = [
    { name: 'Te informaremos por correo cuando tu creatina este en camino.' },
    { name: 'Enviaremos tu creatina lo antes posible.' },
    { name: 'Fecha de entrega estimada: ' + this.getDatePlusDays(this.ENV.plazoDeEntregaDiasHabiles.max) },
  ]

  parrafoExito = {
    parrafo1: '¡Tu registro se ha completado con éxito!',
    parrafo2: 'El email de confirmación está en camino, si no lo recibes puedes revisar tu bandeja de spam.',
    parrafo3: 'Ten en cuenta que:',
  }

  parrafoError = {
    parrafo1: '¡El registro se ha completado con éxito, aunque tenemos noticias!',
    parrafo2: 'Revisamos que tu domicilio no esta dentro de Lima Metropolitana. ' +
      'Aún así, nos pondremos en contacto contigo para confirmar tu domicilio y coordinar la entrega.',
    parrafo3: 'Ten en cuenta que:',
  }

  parrafoCompraConRegistroExito = {
    parrafo1: '¡Tu compra y registro se ha completado con éxito!',
    parrafo2: 'El email de confirmación está en camino, si no lo recibes puedes revisar tu bandeja de spam.',
    parrafo3: 'Ten en cuenta que:',
  }

  parrafoCompraSinRegistroExito = {
    parrafo1: '¡Tu compra se ha completado con éxito!',
    parrafo2: 'El email de confirmación está en camino, si no lo recibes puedes revisar tu bandeja de spam.',
    parrafo3: 'Ten en cuenta que:',
  }

  ngOnInit() {
    this._seo.title.setTitle('Magrolabs | Bienvenido');
    this._seo.setCanonicalURL('magrolabs.com/registro/confirmacion');
    this._seo.setIndexFollow(false);

    let summary = this._summaryService.getSummary()

    if (!summary?.address || !summary?.userData || !summary?.chosePlan) {
      this._router.navigate(['registro/verificacion']);
      return;
    }

    this.creditos = summary?.chosePlan?.selection ==
      SummaryEnum.CREATINA_3KG ? this.ENV.creditoRegaloPorCompraAño + ' Magropuntos'
      : this.ENV.creditoRegaloPorCompraMes + ' Magropuntos';
    this.clientName = summary?.userData?.nombre ?? '';

    this._route.queryParams.subscribe(params => {
      let status = params['status'] ?? localStorage.getItem('status');
      if (status == ConfirmationStatus.SUBSCRIPTION_SUCCESS) {
        this.trackCompleteSuscription();
        this.openWelcomeModal();
        this.status = ConfirmationStatus.SUBSCRIPTION_SUCCESS;
        this.sendWelcomeEmail();
        // Decrementar unidades disponibles
        UrgencyBarComponent.decrementUnits();
      }
      else if (status == ConfirmationStatus.SUBSCRIPTION_SUCCESS_OUTSIDE_LIMA) {
        this.status = ConfirmationStatus.SUBSCRIPTION_SUCCESS_OUTSIDE_LIMA;
        this.trackCompleteSuscription();
        // Decrementar unidades disponibles
        UrgencyBarComponent.decrementUnits();
      }
      else if (status == ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITH_REGISTRATION) {
        this.status = ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITH_REGISTRATION;
        // Enviar email de confirmación de orden
        this.sendOrderConfirmationEmail();
        this.trackPurchaseComplete();
        // Decrementar unidades disponibles
        UrgencyBarComponent.decrementUnits();
      }
      else if (status == ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITHOUT_REGISTRATION) {
        this.status = ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITHOUT_REGISTRATION;
        this.trackPurchaseComplete();
        // Decrementar unidades disponibles
        UrgencyBarComponent.decrementUnits();
      }
      else {
        this._router.navigate(['registro/verificacion']);
      }
      this._summaryService.clearSummary();
      this._shoppingCartService.clearCart();
      
      // Preservar datos importantes antes de limpiar localStorage
      const unitsAvailable = localStorage.getItem('unitsAvailable');
      const isLastChance = localStorage.getItem('isLastChance');
      const offerEndTime = localStorage.getItem('offerEndTime');
      
      localStorage.clear();
      
      // Restaurar datos importantes
      if (unitsAvailable) localStorage.setItem('unitsAvailable', unitsAvailable);
      if (isLastChance) localStorage.setItem('isLastChance', isLastChance);
      if (offerEndTime) localStorage.setItem('offerEndTime', offerEndTime);
    });
  }

  openWelcomeModal() {
    const modalData: ModalData = {
      type: ModalTypeEnum.WELCOME,
      title: 'titulo',
      message: 'mensaje',
      referralCode: this._summaryService.getSummary()?.userData?.referralCode ?? '',
      friendName: this.clientName
    }

    const dialogRef = this._dialog.open(ModalComponent, {
      width: '500px',
      disableClose: true,
      data: modalData
    });

    dialogRef.componentInstance.activate();
  }

  //get the date in string plus a number through the parameter int
  getDatePlusDays(days: number): string {
    const today = new Date();
    let deliveryDate = new Date(today);
    let daysAdded = 0;
    
    while (daysAdded < days) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      // Saltar fines de semana (sábado = 6, domingo = 0)
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
        daysAdded++;
      }
    }
    
    return deliveryDate.toLocaleDateString();
  }

  /**
   * Envía email de bienvenida al usuario
   */
  private sendWelcomeEmail(): void {
    const summary = this._summaryService.getSummary();
    const userEmail = summary?.userData?.email;

    if (!userEmail) {
      console.warn('No se encontró email del usuario para enviar email de bienvenida');
      return;
    }

    this._emailService.sendWelcomeEmailWithValidation(userEmail)
      .subscribe({
        next: (response) => {
          console.log('Email de bienvenida enviado exitosamente:', response);
        },
        error: (error) => {
          console.error('Error al enviar email de bienvenida:', error);
          // No mostramos error al usuario ya que es un proceso en segundo plano
          // El usuario ya completó exitosamente su registro
        }
      });
  }

  /**
   * Envía email de confirmación de orden al usuario
   */
  private sendOrderConfirmationEmail(): void {
    const summary = this._summaryService.getSummary();
    const userEmail = summary?.userData?.email;

    if (!userEmail) {
      console.warn('No se encontró email del usuario para enviar email de confirmación de orden');
      return;
    }

    this._emailService.sendOrderConfirmationEmailWithValidation(userEmail)
      .subscribe({
        next: (response) => {
          console.log('Email de confirmación de orden enviado exitosamente:', response);
        },
        error: (error) => {
          console.error('Error al enviar email de confirmación de orden:', error);
          // No mostramos error al usuario ya que es un proceso en segundo plano
          // El usuario ya completó exitosamente su compra
        }
      });
  }

  private trackPurchaseComplete(): void {
    if (this.shoppingCart && this.shoppingCart.items) {
      const contents = this.shoppingCart.items.map(item => ({
        content_id: item.product.id.toString(),
        content_type: 'product' as const,
        content_name: item.product.name
      }));

      this._metaAnalytics.trackCompleteRegistration({
        content_name: 'Registro Completado',
        status: true,
        value: this.shoppingCart.total || 0,
        currency: 'PEN'
      });

      this._tiktokAnalytics.trackPurchase({
        contents: contents,
        value: this.shoppingCart.total || 0,
        currency: 'PEN'
      });

      this._metaAnalytics.trackPurchase({
        content_ids: this.shoppingCart.items.map(item => item.product.slug.toString()),
        content_type: 'product',
        content_category: 'compra_unica',
        value: this.shoppingCart.total || 0,
        currency: 'PEN',
        num_items: this.shoppingCart.items.length
      });

      this._metaAnalytics.trackCustomEvent('ViewContent', {
        content_name: 'Compra Única Creatina 250gr',
        content_ids: ['creatina-monohidratada-250-gr'],
        content_type: 'product',
        value: this.shoppingCart.total ,
        currency: 'PEN'
      });
    }
  }

  private trackCompleteSuscription() {

    this._metaAnalytics.trackCustomEvent('ViewContent', {
      content_name: 'Confirmación Suscripción Creatina 250gr',
      content_ids: ['creatina-250gr-suscripcion'],
      content_type: 'subscription',
      value: this.ENV.precioCreatinaSubscription,
      currency: 'PEN',
      content_category: 'suscripcion_mensual'
    });

    this._metaAnalytics.trackPurchase({
      content_ids: ['creatina-250gr-suscripcion'],
      content_type: 'subscription',
      content_category: 'suscripcion_mensual',
      value: this.ENV.precioCreatinaSubscription,
      currency: 'PEN'
    });

    this._tiktokAnalytics.trackCustomEvent('Subscribe', {
      value: this.ENV.precioCreatinaSubscription,
      currency: 'PEN'
    });
  }
}
