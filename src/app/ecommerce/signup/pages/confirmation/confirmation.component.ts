import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { StepComponent } from '../../components/step/step.component';
import { StepEnum } from '../../models/step.model';
import { Information, InformationComponent } from '../../components/information/information.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SummaryService } from '../../../../shared/services/summary-service.service';
import { SeoService } from '../../../../shared/services/seo.service';
import { environment } from '../../../../../environments/env';
import { ConfirmationStatus, SummaryEnum } from '../../../../shared/models/summary.model';
import { ShoppingCartService } from '../../../../shared/services/cart-service.service';
import { EmailService } from '../../../../shared/services/email.service';
import { TiktokAnalyticsService } from '../../../../shared/services/tiktok-analytics.service';
import { MetaAnalyticsService } from '../../../../shared/services/meta-analytics.service';
import { UrgencyBarComponent } from '../../../../shared/ui/urgency-bar/urgency-bar.component';
import { OrderService } from '../../../../shared/services/order.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { OrderResponse } from '../../../../shared/interfaces/order.interfaces';
import { catchError, of, switchMap } from 'rxjs';

@Component({
    selector: 'app-confirmation',
    imports: [StepComponent, ButtonComponent, CommonModule, InformationComponent, RouterLink],
    templateUrl: './confirmation.component.html',
    styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent {
  private _summaryService = inject(SummaryService)
  private _router = inject(Router)
  private _route = inject(ActivatedRoute)
  private _seo = inject(SeoService)
  private _shoppingCartService = inject(ShoppingCartService)
  private _emailService = inject(EmailService)
  private _tiktokAnalytics = inject(TiktokAnalyticsService)
  private _metaAnalytics = inject(MetaAnalyticsService)
  private _orderService = inject(OrderService)
  private _authService = inject(AuthService)
  private readonly platformId = inject(PLATFORM_ID)

  ENV = environment
  confirmationStatusEnum = ConfirmationStatus
  stepEnum = StepEnum;
  clientName = '';
  status = ConfirmationStatus.SUBSCRIPTION_SUCCESS;
  creditos = '{{ENV.creditoRegaloPorCompraMes}} Magropuntos';
  urlShared = '';
  shoppingCart = this._shoppingCartService.getShoppingCart();

  /**
   * Si está poblado, la pantalla muestra el modo "rico" con detalles del pedido.
   * Si null, fallback a la UI minimalista (suscripciones y casos sin orderId).
   */
  order = signal<OrderResponse | null>(null);
  /** True mientras buscamos la orden en el backend (skeleton). */
  loadingOrder = signal(false);

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

    this._route.queryParams.subscribe(params => {
      const status = params['status'] ?? (isPlatformBrowser(this.platformId) ? localStorage.getItem('status') : null);
      const orderIdParam: string | null = params['orderId'] ?? null;
      const isAuthenticated = this._authService.isAuthenticated();

      // Determinar si activamos modo rico (cliente con sesión + orden a consultar).
      // Caso especial: si llegamos con orderIdParam, intentamos modo rico aunque
      // isAuthenticated() sea false en este tick — el interceptor agregará el JWT
      // si las cookies se sincronizaron. Si la hidratación falla, caemos a fallback.
      const tryRichMode = (isAuthenticated || !!orderIdParam) && (orderIdParam || status == ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITH_REGISTRATION || status == ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITHOUT_REGISTRATION);

      if (tryRichMode) {
        this.hydrateOrderDetails(orderIdParam);
      } else {
        // Flujo legacy: requiere summary completo (típicamente suscripción)
        const summary = this._summaryService.getSummary();
        if (!summary?.address || !summary?.userData || !summary?.chosePlan) {
          this._router.navigate(['registro/verificacion']);
          return;
        }
        this.clientName = summary?.userData?.nombre ?? '';
        this.creditos = summary?.chosePlan?.selection ==
          SummaryEnum.CREATINA_3KG ? this.ENV.creditoRegaloPorCompraAño + ' Magropuntos'
          : this.ENV.creditoRegaloPorCompraMes + ' Magropuntos';
      }

      this.runStatusSideEffects(status, orderIdParam);
      this.cleanupAfterConfirmation();
    });
  }

  /**
   * Recupera la orden del backend (por orderId explícito o trayendo la última
   * del usuario autenticado) y puebla el signal `order` para activar la UI rica.
   * Si falla, deja `order` en null y el render cae al fallback minimalista.
   */
  private hydrateOrderDetails(orderIdParam: string | null): void {
    this.loadingOrder.set(true);

    const fetchByLastOrder$ = this._orderService.getMyOrders(1, 1).pipe(
      switchMap(list => {
        const first = list?.data?.orders?.[0];
        if (!first) return of(null);
        return this._orderService.getOrderById(first.id);
      })
    );

    const source$ = orderIdParam
      ? this._orderService.getOrderById(orderIdParam)
      : fetchByLastOrder$;

    source$.pipe(
      catchError(err => {
        console.warn('No se pudo hidratar detalles de la orden — se usa UI minimalista', err);
        return of(null);
      })
    ).subscribe(detail => {
      this.loadingOrder.set(false);
      const orderResp = (detail as any)?.data?.order ?? null;
      if (orderResp) {
        this.order.set(orderResp);
        // El nombre del cliente viene del propio backend para evitar depender de summary
        const customerFirstName = orderResp?.customer?.first_name ?? this._summaryService.getSummary()?.userData?.nombre ?? '';
        this.clientName = customerFirstName;
      } else {
        // Fallback con summary si lo hay
        this.clientName = this._summaryService.getSummary()?.userData?.nombre ?? '';
      }
    });
  }

  /**
   * Ejecuta los side-effects asociados al status (analytics, emails, modales,
   * decremento de unidades). Mismos comportamientos que el componente original.
   *
   * @param orderIdParam Si está presente, asumimos que el cliente llegó tras
   *   un checkout exitoso (modo CHARGE redirige acá con orderId). En ese caso,
   *   NO redirigimos a verificacion aunque order() aún no esté hidratada y
   *   isAuthenticated() retorne false momentáneamente — la hidratación async
   *   se encarga de poblar la UI rica.
   */
  private runStatusSideEffects(status: any, orderIdParam?: string | null): void {
    if (status == ConfirmationStatus.SUBSCRIPTION_SUCCESS) {
      this.trackCompleteSuscription();
      this.status = ConfirmationStatus.SUBSCRIPTION_SUCCESS;
      this.sendWelcomeEmail();
      const _s = this._summaryService.getSummary();
      this.urlShared = ('https://magrolabs.com/referido-por-amigo?codigo=' + (_s?.userData?.referralCode ?? '') + '&nombre=' + (_s?.userData?.nombre || this.clientName)).replace(/ /g, '%20');
      UrgencyBarComponent.decrementUnits();
    } else if (status == ConfirmationStatus.SUBSCRIPTION_SUCCESS_OUTSIDE_LIMA) {
      this.status = ConfirmationStatus.SUBSCRIPTION_SUCCESS_OUTSIDE_LIMA;
      this.trackCompleteSuscription();
      UrgencyBarComponent.decrementUnits();
    } else if (status == ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITH_REGISTRATION) {
      this.status = ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITH_REGISTRATION;
      this.sendOrderConfirmationEmail();
      this.trackPurchaseComplete();
      UrgencyBarComponent.decrementUnits();
    } else if (status == ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITHOUT_REGISTRATION) {
      this.status = ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITHOUT_REGISTRATION;
      this.trackPurchaseComplete();
      UrgencyBarComponent.decrementUnits();
    } else {
      // Sin status pero con orderId (modo rico): tratar como compra registrada.
      // Si hay orderIdParam confiamos en la hidratación async — no redirigimos
      // aunque order() y isAuthenticated() estén false en este tick.
      if (orderIdParam || this.order() || this._authService.isAuthenticated()) {
        this.status = ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITH_REGISTRATION;
        this.sendOrderConfirmationEmail();
        this.trackPurchaseComplete();
        UrgencyBarComponent.decrementUnits();
      } else {
        this._router.navigate(['registro/verificacion']);
      }
    }
  }

  /**
   * Limpia summary, carrito y localStorage preservando los datos de la
   * UrgencyBar.
   *
   * IMPORTANTE: usamos `clearSummaryOnly()` (no `clearSummary()`) para no
   * borrar las cookies de auth (`auth_token`, `refresh_token`, `user_data`)
   * que el checkout acaba de persistir vía `setSessionFromCheckout`. De lo
   * contrario el cliente perdería el autologin recién hecho y al ir a
   * /cuenta/pedidos el interceptor no podría adjuntar el JWT (401 → lista
   * vacía).
   */
  private cleanupAfterConfirmation(): void {
    this._summaryService.clearSummaryOnly();
    this._shoppingCartService.clearCart();

    if (!isPlatformBrowser(this.platformId)) return;

    const unitsAvailable = localStorage.getItem('unitsAvailable');
    const isLastChance = localStorage.getItem('isLastChance');
    const offerEndTime = localStorage.getItem('offerEndTime');

    localStorage.clear();

    if (unitsAvailable) localStorage.setItem('unitsAvailable', unitsAvailable);
    if (isLastChance) localStorage.setItem('isLastChance', isLastChance);
    if (offerEndTime) localStorage.setItem('offerEndTime', offerEndTime);
  }

  copyShareUrl(): void {
    navigator.clipboard.writeText(this.urlShared).then(
      () => alert('¡Enlace copiado al portapapeles!'),
      () => {}
    );
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
   * Devuelve un id corto y legible para mostrar en la UI a partir del UUID
   * completo de la orden. Ej: "abcd-1234".
   */
  shortOrderId(fullId: string | undefined | null): string {
    if (!fullId) return '';
    // Tomar primer y último bloques de 4 caracteres del UUID
    const clean = fullId.replace(/-/g, '');
    return clean.length >= 8 ? `${clean.slice(0, 8).toUpperCase()}` : fullId;
  }

  /** Etiqueta amigable para el método de pago de la orden. */
  paymentMethodLabel(method: string | undefined | null): string {
    switch (method) {
      case 'CREDIT_CARD': return 'Tarjeta de crédito';
      case 'DEBIT_CARD': return 'Tarjeta de débito';
      case 'BANK_TRANSFER': return 'Transferencia bancaria';
      case 'YAPE': return 'Yape';
      case 'PAGO_EFECTIVO': return 'PagoEfectivo';
      case 'PAYPAL': return 'PayPal';
      default: return 'Pago en línea';
    }
  }

  /** Etiqueta amigable para el estado de la orden. */
  orderStatusLabel(status: string | undefined | null): string {
    switch (status) {
      case 'PENDING_PAYMENT': return 'Pendiente de pago';
      case 'PAID': return 'Pagado';
      case 'PROCESSING': return 'En preparación';
      case 'SHIPPED': return 'En camino';
      case 'DELIVERED': return 'Entregado';
      case 'CANCELLED': return 'Cancelado';
      case 'REFUNDED': return 'Reembolsado';
      case 'REJECTED': return 'Rechazado';
      default: return status ?? '';
    }
  }

  /** Devuelve la URL de la imagen principal del producto, si existe. */
  productImage(orderItem: any): string | null {
    const img = orderItem?.product?.images?.[0]?.image_url;
    return img ?? null;
  }

  /**
   * Subtotal del pedido (sin envío ni descuento). Prioriza el campo
   * persistido `subtotal_amount` (escrito en checkout). Si no existe
   * (órdenes legacy pre-refactor), lo reconstruye sumando orderItems.
   */
  subtotal(): number {
    const o = this.order();
    if (o?.subtotal_amount != null) {
      return Number(o.subtotal_amount);
    }
    const items = o?.orderItems ?? [];
    return items.reduce((sum, it) => {
      const unit = (it as any).unit_price ?? (it as any).price ?? 0;
      return sum + Number(unit) * Number(it.quantity);
    }, 0);
  }

  /**
   * Monto en soles efectivamente descontado en este pedido.
   *
   * - Modo NUEVO: lee `discount_amount` directo (lo persistió checkout
   *   tras validar el cupón).
   * - Modo LEGACY: para órdenes anteriores al refactor, reconstruye desde
   *   el viejo `discount` (porcentaje) aplicado al subtotal.
   */
  discountAmount(): number {
    const o = this.order();
    if (!o) return 0;
    if (o.discount_amount != null) {
      return Number(o.discount_amount);
    }
    const legacyPct = Number((o as any).discount ?? 0);
    if (!legacyPct) return 0;
    return Math.round((this.subtotal() * legacyPct) / 100);
  }

  /**
   * Etiqueta para mostrar junto al descuento, ej. "Cupón MAGRO9".
   * Vacío si la orden no tiene cupón.
   */
  discountLabel(): string {
    const o = this.order();
    if (!o?.code_discount) return 'Descuento';
    return `Cupón ${o.code_discount}`;
  }

  /**
   * Sub-etiqueta del descuento (badge): "10%" o "S/.9.10" según el tipo.
   * Vacío si el tipo no está disponible (orden legacy o sin cupón).
   */
  discountBadge(): string {
    const o = this.order();
    if (!o || !o.discount_type || o.discount_value == null) return '';
    const value = Number(o.discount_value);
    if (o.discount_type === 'PERCENTAGE') {
      return `${value}%`;
    }
    return `S/.${value.toFixed(2)}`;
  }

  /**
   * Envía email de bienvenida al usuario
   */
  private sendWelcomeEmail(): void {
    const summary = this._summaryService.getSummary();
    const userEmail = summary?.userData?.email ?? (this.order() as any)?.customer?.email;

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
        }
      });
  }

  /**
   * Envía email de confirmación de orden al usuario
   */
  private sendOrderConfirmationEmail(): void {
    const summary = this._summaryService.getSummary();
    const userEmail = summary?.userData?.email ?? (this.order() as any)?.customer?.email;

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
