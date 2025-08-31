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

  ENV = environment
  confirmationStatusEnum = ConfirmationStatus
  stepEnum = StepEnum;
  clientName = '';
  status = ConfirmationStatus.SUBSCRIPTION_SUCCESS;
  creditos = '{{ENV.creditoRegaloPorCompraMes}} Magropuntos';
  shoppingCart = this._shoppingCartService.getShoppingCart();

  informationExitoList: Information[] = [
    { name: 'Tu periodo de prueba comienza despues de recibir tu creatina.' },
    { name: 'Te avisaremos cuando finalice tu periodo de prueba.' },
    { name: 'Entrega estimada de la creatina gratis: ' + this.ENV.plazoDeEntregaDiasHabilesCreatinaFree.min + ' a ' + this.ENV.plazoDeEntregaDiasHabilesCreatinaFree.max + ' días hábiles.' },
  ]

  informationErrorList: Information[] = [
    { name: 'El email de confirmación está en camino, si no lo recibes puedes revisar tu bandeja de spam.' },
    { name: 'Tu periodo de prueba comienza despues de recibir tu creatina.' },
    { name: 'En las proximas 48 horas nos pondremos en contacto vía Whatsapp.' },
    { name: 'Te avisaremos cuando hagamos envíos a tu ciudad.' },
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
    parrafo2: 'Revisamos que tu domicilio no esta dentro de la zona de cobertura, pronto estaremos por tu ciudad. Por el momento no es posible enviarte tu creatina gratis. ' +
      'Aún así, nos pondremos en contacto contigo para confirmar tu domicilio.',
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
        this.trackCompleteSuscription(false);
        this.openWelcomeModal();
        this.status = ConfirmationStatus.SUBSCRIPTION_SUCCESS;
        this.sendWelcomeEmail();
      }
      else if (status == ConfirmationStatus.SUBSCRIPTION_SUCCESS_OUTSIDE_LIMA) {
        this.status = ConfirmationStatus.SUBSCRIPTION_SUCCESS_OUTSIDE_LIMA;
        this.trackCompleteSuscription(true);
      }
      else if (status == ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITH_REGISTRATION) {
        this.status = ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITH_REGISTRATION;
        // Enviar email de confirmación de orden
        this.sendOrderConfirmationEmail();
        this.trackPurchaseComplete();
      }
      else if (status == ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITHOUT_REGISTRATION) {
        this.status = ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITHOUT_REGISTRATION;
        this.trackPurchaseComplete();
      }
      else {
        this._router.navigate(['registro/verificacion']);
      }
      this._summaryService.clearSummary();
      this._shoppingCartService.clearCart();
      localStorage.clear();
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
    let result = new Date();
    result.setDate(result.getDate() + days);
    return result.toLocaleDateString();
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

      this._tiktokAnalytics.trackPurchase({
        contents: contents,
        value: this.shoppingCart.total || 0,
        currency: 'PEN'
      });
    }
  }

  private trackCompleteSuscription(isOutsideLimaMetropolitana: boolean){
    this._tiktokAnalytics.trackCompleteRegistration({
      contents: [{
        content_id: 'registration',
        content_type: 'product_group',
        content_name: isOutsideLimaMetropolitana ? 'Registro Completado (Fuera de Lima Metropolitana)' : 'Registro Completado'
      }]
    });
  }
}
