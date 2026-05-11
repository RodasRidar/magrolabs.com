import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StepEnum } from '../../models/step.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { StepComponent } from '../../components/step/step.component';
import { Router } from '@angular/router';
import { Information, InformationComponent } from '../../components/information/information.component';
import { SummaryService } from '../../../../shared/services/summary-service.service';
import { SeoService } from '../../../../shared/services/seo.service';
import { environment } from '../../../../../environments/env';
import { PaymentMethodComponent } from '../../../../shared/ui/payment-method/payment-method.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { CookieService } from 'ngx-cookie-service';
import { ConfirmationStatus, Summary, SummaryEnum, UserDataSummary } from '../../../../shared/models/summary.model';
import { FlowWidgetAddCardComponent } from '../../../../shared/ui/flow-widget-add-card/flow-widget-add-card.component';
import { AccordionGroupComponent } from '../../../../shared/ui/accordion/accordion-group.component';
import { FormFieldComponent } from '../../../../shared/ui/form-field/form-field.component';
import { AccordionItemComponent } from '../../../../shared/ui/accordion/accordion-item.component';
import { FlowService } from '../../../../shared/services/flow.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CreateCustomerRequest, EditCustomerRequest, FlowPaymentMethod, RegisterCardResponse } from '../../../../shared/models/flow.model';
import { switchMap, EMPTY, catchError, tap, finalize, throwError, Observable } from 'rxjs';
import { PaymentMethod } from '../../../../shared/interfaces/order.interfaces';
import { UserService } from '../../../../shared/services/user.service';
import { VerificationPaymentModalService } from '../../../../shared/services/verification-payment-modal.service';
import { MetaAnalyticsService } from '../../../../shared/services/meta-analytics.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { CheckoutSubscriptionService } from '../../../../shared/services/checkout-subscription.service';
import { CheckoutSubscriptionRequest, ChargeReference } from '../../../../shared/interfaces/checkout-subscription.interfaces';
import { SubscriptionCouponService } from '../../../../shared/services/subscription-coupon.service';
import { SubscriptionCouponAppliesTo, SubscriptionDiscountType } from '../../../../shared/interfaces/subscription-coupon.interfaces';
import { ShoppingCartService } from '../../../../shared/services/cart-service.service';
import { TiktokAnalyticsService } from '../../../../shared/services/tiktok-analytics.service';

@Component({
  selector: 'app-verification-payment',
  standalone: true,
  imports: [StepComponent, ButtonComponent, ReactiveFormsModule, CommonModule, InformationComponent, PaymentMethodComponent, FlowWidgetAddCardComponent, AccordionGroupComponent, AccordionItemComponent, FormFieldComponent],
  templateUrl: './verification-payment.component.html',
})
export class VerificationPaymentComponent {
  paymentMethod = signal<FlowPaymentMethod>(FlowPaymentMethod.DEBIT_CREDIT_CARD);
  ENV = environment
  isPaymentVerified = signal(false);
  isLoading = signal(false);
  promotionIsShow = signal(false);
  informationList = signal<Information[]>([
    {
      name: `Tu ${this.ENV.campanaPrimeraCreatina.textos.heroOferta} se preparará después de completar el registro`,
    },
    {
      name: 'Periodo de prueba de ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días',
    },
    {
      name: 'Cancela cuando quieras',
    }
  ]);
  flowToken = signal('');
  buttonName = signal('Pagar →');
  private platformId = inject(PLATFORM_ID)
  private _formBuilder = inject(FormBuilder)
  private _router = inject(Router)
  private _summaryService = inject(SummaryService)
  private _seo = inject(SeoService)
  private _toastService = inject(ToastService)
  private _cookieService = inject(CookieService)
  private _flowService = inject(FlowService)
  private _userService = inject(UserService)
  private _verificationPaymentModalService = inject(VerificationPaymentModalService)
  private _metaAnalyticsService = inject(MetaAnalyticsService);
  private _authService = inject(AuthService);
  private _checkoutSubscriptionService = inject(CheckoutSubscriptionService);
  private _subscriptionCouponService = inject(SubscriptionCouponService);
  private _shoppingCartService = inject(ShoppingCartService)
  private _tiktokAnalytics = inject(TiktokAnalyticsService);

  private readonly destroy$ = takeUntilDestroyed();
  labelCardRegisted = signal('**** **** **** ');
  enrolledCard = signal<{ last4: string; brand: string } | null>(null);
  stepEnum = StepEnum;
  isCreatinaSuscription = signal(false);
  isOutsideLimaMetropolitana = signal(false);

  // ─────────────────────────────────────────────────────────────────────
  // Cupón de creador (SubscriptionCoupons). El backend valida el code y
  // devuelve descuentos resueltos para primer cargo y/o recurrente.
  // ─────────────────────────────────────────────────────────────────────
  subDiscountCode = signal('');
  subDiscountApplied = signal(false);
  /** Soles a descontar del primer cargo (0 si no aplica al primero). */
  subDiscountFirstCharge = signal(0);
  /** Soles a descontar de la cuota mensual (0 si no aplica a recurrente). */
  subDiscountRecurring = signal(0);
  subDiscountType = signal<SubscriptionDiscountType | null>(null);
  subDiscountValue = signal(0);
  subDiscountAppliesTo = signal<SubscriptionCouponAppliesTo | null>(null);
  subDiscountCreatorName = signal<string | null>(null);
  subDiscountError = signal('');
  isApplyingSubDiscount = signal(false);

  /**
   * Precio base de la primera creatina (antes de aplicar cupón de creador).
   * Lee el mismo flag que `getFirstChargeAmount()` para que UI y backend
   * vean el mismo subtotal de partida.
   */
  firstCreatinePrice = (): number => {
    return this.getFirstChargeAmount();
  };

  /**
   * Total a pagar HOY por la primera creatina, descontado el cupón
   * (si el cupón aplica al primer cargo). Es lo que va al `chargeCustomer`
   * de Flow y al `Order.total_amount` en BD.
   */
  firstChargeTotalToPay = computed((): number => {
    return Math.max(0, this.firstCreatinePrice() - this.subDiscountFirstCharge());
  });

  /**
   * Total a pagar en cada cuota mensual, descontado el cupón recurrente.
   */
  recurringTotalToPay = computed((): number => {
    return Math.max(0, this.ENV.precioCreatinaSubscription - this.subDiscountRecurring());
  });

  form = this._formBuilder.group({
    promoCode: this._formBuilder.control('', [Validators.minLength(3), Validators.pattern(/^[A-Z0-9]{3,10}$/)],),
    cardNumber: this._formBuilder.nonNullable.control('', [Validators.required, Validators.pattern(/^[0-9]{15,16}|(([0-9]{4}\s){3}[0-9]{3,4})$/)]),
    cardName: this._formBuilder.nonNullable.control('', [Validators.required, Validators.pattern(/^[A-Z\s]{3,}$/)]),
    cardExpiration: this._formBuilder.nonNullable.control('', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/[0-9]{4}$/)]),
    cardCvv: this._formBuilder.nonNullable.control('', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]),
  })

  ngOnInit() {
    this._seo.title.setTitle('Magrolabs | Verificación de pago');
    this._seo.setCanonicalURL('magrolabs.com/registro/verificacion');
    this._seo.setIndexFollow(false);
    let summary = this._summaryService.getSummary();
    if (!summary?.address) {
      this._router.navigate(['registro/direccion']);
    }
    if (summary?.chosePlan?.selection === SummaryEnum.CREATINA_250G_SUBSCRIPTION) {
      this.isCreatinaSuscription.set(true);
    } else {
      this.isLoading.set(false);
      this._router.navigate(['/checkout']);
      this._shoppingCartService.addProductToCart({
        product: {
          id: '00000009-50eb-4ac3-aa94-1b64fbf32b9c',
          name: 'Creatina Monohidratada 250 gr',
          price: this.ENV.precioCreatinaOnePurchase,
          imageUrl: '250gr_front_mockup_2000x2000.webp',
          slug: 'creatina-monohidratada-250-gr'
        },
        quantity: 1
      });
      this._tiktokAnalytics.trackAddToCart({
        contents: [{
          content_id: 'creatina-monohidratada-250-gr',
          content_name: 'Creatina Monohidratada 250 gr',
          content_type: 'product',
        }],
        value: this.ENV.precioCreatinaOnePurchase,
        currency: 'PEN'
      });

      // Tracking Meta Analytics
      this._metaAnalyticsService.trackAddToCart({
        value: this.ENV.precioCreatinaOnePurchase,
        currency: 'PEN',
        content_name: 'Creatina Monohidratada 250 gr',
        content_ids: ['creatina-monohidratada-250-gr'],
        content_type: 'product',
        contents: [{
          id: 'creatina-monohidratada-250-gr',
          quantity: 1,
          item_price: this.ENV.precioCreatinaOnePurchase
        }]
      });
    }

    // Validar si la dirección está fuera de Lima Metropolitana
    this.validateAddressLocation(summary!);

    this._metaAnalyticsService.trackCustomEvent('ViewContent', {
      content_name: 'Verificacion Pago Suscripción Creatina 250gr',
      content_ids: ['creatina-250gr-suscripcion'],
      content_type: 'subscription',
      value: this.ENV.precioCreatinaSubscription,
      currency: 'PEN',
      content_category: 'suscripcion_mensual'
    });

  }

  /**
   * Valida si la dirección del usuario está fuera de Lima Metropolitana
   */
  private validateAddressLocation(summary: Summary): void {
    if (summary) {
      // Verificar si NO es Lima Metropolitana
      // Lima Metropolitana = departamento "Lima" y provincia "Lima"
      if (summary.address?.department?.toLowerCase() !== '3926' || summary.address?.provincia?.toLowerCase() !== '3927') {
        this.isOutsideLimaMetropolitana.set(true);
      } else {
        this.isOutsideLimaMetropolitana.set(false);
      }
    }
    // Nota: el cookie `promoCode` legacy (P252SOLESX) ya no se persiste.
    // Los cupones de creador no se rehidratan al refrescar la página; el
    // usuario debe re-aplicar el código si ocurre un refresh.

    if (isPlatformBrowser(this.platformId)) {
      this.registerUserFlowAndRegisterCard();
    }
    this.isPaymentVerified.set(summary?.userData?.isPaymentVerified ?? false);
    if (this.isPaymentVerified()) {
      this.cardAddedSuccessfully(true);
    }
  }

  nextStep() {
    this.isLoading.set(true);

    if (this.paymentMethod() === FlowPaymentMethod.RECURRENT_PAYMENT) {
      this.handleRecurrentPaymentOption();
      return;
    }

    if (this.isCreatinaSuscription()) {
      this.processSubscriptionViaEndpoint();
    } else {
      // Flujo One Purchase: este componente ya no maneja ese caso.
      // El CheckoutComponent moderno (/checkout) lo cubre por completo
      // con el endpoint consolidado /api/v1/checkout. Redirigimos al
      // carrito para que el usuario continúe por ese camino.
      this.isLoading.set(false);
      // this._toastService.info('Redirigiendo...', 'Te llevamos al carrito para completar tu compra.');
      this._router.navigate(['/checkout']);
    }
  }

  private handleRecurrentPaymentOption(): void {
    const userData = this._summaryService.getSummary()?.userData;
    if (userData?.isSignUpAcepted && userData?.password) {
      this._summaryService.setChoosePlan({
        selection: SummaryEnum.CREATINA_250G_SUBSCRIPTION,
        descriptionOne: 'Plan mensual de S/' + this.ENV.precioCreatinaSubscription + '.',
        descriptionTwo: 'Ganas ' + this.ENV.creditoRegaloPorCompraMes + ' Magropuntos 🎁 .',
        descrptionThree: this.ENV.campanaPrimeraCreatina.textos.descripcionCarrito(this.ENV.campanaPrimeraCreatina.gramos),
        descrptionFour: 'Periodo de prueba de ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días.',
        quantity: 1
      });
      this.ngOnInit();
    } else {
      this._toastService.warning('Ups!', 'Necesitas completar la contraseña para suscribirte.');
      this._summaryService.setChoosePlan({
        selection: SummaryEnum.CREATINA_250G_SUBSCRIPTION,
        descriptionOne: 'Plan mensual de S/' + this.ENV.precioCreatinaSubscription + '.',
        descriptionTwo: 'Ganas ' + this.ENV.creditoRegaloPorCompraMes + ' Magropuntos 🎁 .',
        descrptionThree: this.ENV.campanaPrimeraCreatina.textos.descripcionCarrito(this.ENV.campanaPrimeraCreatina.gramos),
        descrptionFour: 'Periodo de prueba de ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días.',
        quantity: 1
      });
      this._router.navigate(['registro/crear-cuenta'], { queryParams: { next: 'verificacion' } });
      localStorage.setItem('passwordSignal', 'true');
    }
    this.isLoading.set(false);
  }

  /**
   * Punto único de procesamiento de suscripción.
   *
   * Reemplaza la orquestación HTTP que antes hacían 3 métodos
   * (`processNewOrderSubscription`, `processExistingOrderSubscription`,
   * `processCancelAndCreateNewOrderSubscription`) por una sola llamada
   * al endpoint consolidado `/api/v1/checkout/subscription`. El backend
   * ejecuta el patrón saga completo: cleanup intento previo + cargo Flow
   * + tx con reintentos + sanity check + createSubscription Flow con
   * reintentos + auto-login con tokens.
   *
   * Decisión: si hay orderId previo, va en mode='update' (el backend
   * sobre-escribe la orden previa; en el caso "cancel-and-new" antiguo
   * el frontend hacía cancel previo, pero ahora confiamos en que el
   * backend reuse la orden).
   */

  // ─────────────────────────────────────────────────────────────────────
  // Cupón de creador — apply / remove / mapping de errores.
  // ─────────────────────────────────────────────────────────────────────

  /**
   * Aplica un código de cupón de creador llamando al backend.
   * El backend valida estado/fechas/usos/configuración y devuelve los
   * descuentos resueltos (firstCharge + recurring).
   */
  applySubDiscount(): void {
    const rawCode: string = this.form.get('promoCode')?.value ?? '';
    const code = rawCode.trim();
    if (!code) {
      this.subDiscountError.set('Por favor ingresa un código de descuento.');
      return;
    }

    this.isApplyingSubDiscount.set(true);
    this.subDiscountError.set('');

    this._subscriptionCouponService.validateCoupon({
      code,
      firstChargeAmount: this.getFirstChargeAmount(),
      recurringAmount: this.ENV.precioCreatinaSubscription,
    }).pipe(
      finalize(() => this.isApplyingSubDiscount.set(false)),
    ).subscribe({
      next: response => {
        const data = response.data;
        this.subDiscountCode.set(data.code);
        this.subDiscountType.set(data.discount_type);
        this.subDiscountValue.set(data.discount_value);
        this.subDiscountAppliesTo.set(data.applies_to);
        this.subDiscountFirstCharge.set(data.first_charge_discount_amount);
        this.subDiscountRecurring.set(data.recurring_discount_amount);
        this.subDiscountCreatorName.set(data.creator_name);
        this.subDiscountApplied.set(true);
        this.form.get('promoCode')?.disable();
        this.subDiscountError.set('');
        const label = data.code;
        this._toastService.success('¡Éxito!', `Cupón aplicado: ${label}`);
      },
      error: err => {
        this.subDiscountError.set(this.mapSubCouponError(err?.error?.error?.code));
        this.subDiscountApplied.set(false);
        this.subDiscountCode.set('');
        this.subDiscountFirstCharge.set(0);
        this.subDiscountRecurring.set(0);
        this.subDiscountType.set(null);
        this.subDiscountValue.set(0);
        this.subDiscountAppliesTo.set(null);
        this.subDiscountCreatorName.set(null);
      },
    });
  }

  /** Quita el cupón aplicado y limpia signals. */
  removeSubDiscount(): void {
    this.subDiscountCode.set('');
    this.subDiscountApplied.set(false);
    this.subDiscountFirstCharge.set(0);
    this.subDiscountRecurring.set(0);
    this.subDiscountType.set(null);
    this.subDiscountValue.set(0);
    this.subDiscountAppliesTo.set(null);
    this.subDiscountCreatorName.set(null);
    this.subDiscountError.set('');
    this.form.get('promoCode')?.setValue('');
    this.form.get('promoCode')?.enable();
    this._toastService.info('Información', 'Código de descuento eliminado');
  }

  /**
   * Mapea los códigos de error del backend a mensajes amigables.
   * Lista canónica en api.magrolabs.com/.../subscription-coupon.service.ts.
   */
  private mapSubCouponError(errorCode: string | undefined): string {
    switch (errorCode) {
      case 'SUBSCRIPTION_COUPON_NOT_FOUND':
        return 'Código de descuento inválido o no disponible.';
      case 'SUBSCRIPTION_COUPON_NOT_STARTED':
        return 'Este código aún no está activo.';
      case 'SUBSCRIPTION_COUPON_EXPIRED':
        return 'Este código ya expiró.';
      case 'SUBSCRIPTION_COUPON_USAGE_EXCEEDED':
        return 'Este código alcanzó su límite de usos.';
      case 'SUBSCRIPTION_COUPON_MIN_SUBTOTAL_NOT_MET':
        return 'No alcanzas el monto mínimo para usar este código.';
      case 'SUBSCRIPTION_COUPON_MISCONFIGURED':
        return 'Este código no está configurado correctamente. Contacta a soporte.';
      case 'INVALID_SUBSCRIPTION_COUPON_VALIDATE_PAYLOAD':
        return 'Datos inválidos para validar el código.';
      default:
        return 'No pudimos validar el código. Intenta nuevamente.';
    }
  }

  /** Etiqueta visible del cupón aplicado (badge). */
  subDiscountBadge(): string {
    const type = this.subDiscountType();
    const value = this.subDiscountValue();
    if (!type || value <= 0) return '';
    return type === 'PERCENTAGE' ? `${value}%` : `S/.${value.toFixed(2)}`;
  }

  private processSubscriptionViaEndpoint(): void {
    const summary = this._summaryService.getSummary();
    const userData = summary?.userData;
    const customerId = userData?.customerId;

    if (!customerId) {
      this._toastService.error('Ups!', 'Falta información de pago. Por favor, registra tu tarjeta.');
      this.isLoading.set(false);
      return;
    }

    const mode: 'new' | 'update' = userData?.orderId ? 'update' : 'new';

    // Si hay un chargeReference pendiente en localStorage (de un intento
    // anterior que falló tras cobrar), lo incluimos en el payload para
    // que el backend lo reuse via `validateChargeReference` en lugar de
    // re-cobrar al cliente.
    const pendingChargeRef = this.getPendingChargeReference();

    const request: CheckoutSubscriptionRequest = {
      customerId,
      flowPlanId: this.getFlowPlanId(),
      backendSubscriptionPlanId: '00000003-50eb-4ac3-aa94-1b64fbf32b9c',
      trialPeriodDays: this.ENV.plazoDeEntregaDiasHabilesCreatinaFree.max
        + this.ENV.diasNormalesDePruebaOperiodoDeReflexion,
      firstChargeAmount: this.getFirstChargeAmount(),
      firstChargeSubject: `Creatina de prueba ${this.ENV.campanaPrimeraCreatina.gramos}gr - Magrolabs`,
      firstChargeOptionals: {
        campaign_type: this.ENV.campanaPrimeraCreatina.tipo,
        product_weight: this.ENV.campanaPrimeraCreatina.gramos,
        is_first_creatine: true,
      },
      order: {
        mode,
        orderId: mode === 'update' ? userData?.orderId : undefined,
        shipping_address: summary?.address?.id ?? '',
        payment_method: this.mapPaymentMethod(),
        orderItems: [
          {
            product_id: '00000008-50eb-4ac3-aa94-1b64fbf32b9c', // Creatina 100gr (campaña primera creatina)
            quantity: 1,
          },
        ],
        // Cupón de creador (si el usuario lo aplicó vía applySubDiscount).
        // El backend re-valida server-side via SubscriptionCouponService.
        ...(this.subDiscountApplied()
          ? { code_discount: this.subDiscountCode() }
          : {}),
        isLoyaltyWebShow: false,
      },
      creditAmount: this.ENV.creditoRegaloPorCompraMes,
      ...(pendingChargeRef ? { chargeReference: pendingChargeRef } : {}),
    };

    if (pendingChargeRef) {
      console.info('Reusando chargeReference pendiente del intento anterior', pendingChargeRef);
    }

    this._checkoutSubscriptionService.processSubscription(request).pipe(
      catchError(err => {
        const code: string | undefined = err?.error?.error?.code;

        // Cargo Flow rechazado (tarjeta inválida, fondos insuficientes, etc.)
        // Borramos cualquier chargeReference previo: el cargo nuevo falló
        // de plano, no hay nada que reusar.
        if (code === 'FLOW_CHARGE_NOT_COMPLETED') {
          this.clearPendingChargeReference();
          this._toastService.error('Error de pago', 'No se pudo realizar el pago, intente con otra tarjeta');
          this.resetPaymentVerification();
          return EMPTY;
        }
        // Dirección de envío inválida (no debería ocurrir en este flujo).
        if (code === 'ADDRESS_NOT_FOUND') {
          this._toastService.error('Ups!', 'La dirección de envío no es válida.');
          return EMPTY;
        }
        // Cargo completado pero tx falló las 3 veces — admin notificado.
        // Guardamos el chargeReference para que el próximo intento del
        // cliente reuse el cargo sin re-cobrar.
        if (code === 'TX_FAILED_AFTER_CHARGE') {
          const ref: ChargeReference | undefined = err?.error?.error?.details?.chargeReference;
          if (ref) {
            this.savePendingChargeReference(ref);
            console.warn('chargeReference guardado para retry idempotente', ref);
          }
          this._toastService.error(
            'Ups!',
            'Tu pago se procesó pero hubo un problema al registrar la suscripción. Si vuelves a intentar, no se te cobrará de nuevo.',
          );
          return EMPTY;
        }
        return this.handleSubscriptionError(err);
      }),
      finalize(() => {
        this._summaryService.setUserData({
          ...this._summaryService.getSummary()?.userData as UserDataSummary,
          isSubscription: true,
        });
        this.isLoading.set(false);
      }),
    ).subscribe({
      next: response => {
        const data = response.data;

        // Éxito: limpiamos el chargeReference pendiente (ya se aplicó).
        this.clearPendingChargeReference();

        // Auto-login refresh: el backend devuelve tokens nuevos para que
        // la sesión post-suscripción quede con JWT vigente.
        if (data.tokens && userData) {
          this._authService.setSessionFromCheckout(data.tokens, {
            id: userData.id ?? '',
            email: userData.email ?? '',
            first_name: userData.nombre ?? '',
            last_name: userData.apellido ?? '',
            isSignUpAcepted: true,
          });
        }

        // Persistir orderId + subscriptionId del response para futuros
        // reentries (re-pago, modificación de plan, etc).
        this._summaryService.setUserData({
          ...this._summaryService.getSummary()?.userData as UserDataSummary,
          orderId: data.order.id,
          subscriptionId: data.subscription.id,
        });

        if (data.subscription.pendingFlowSync) {
          // El backend ya marcó la subscription para reconciliación; el
          // cliente NO ve fallo (la BD está consistente). Solo logueamos.
          console.warn(
            'Subscription marcada pendingFlowSync — job externo reconciliará en Flow',
            data.subscription.id,
          );
        }

        this.navigateToConfirmation();
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  // Persistencia local del chargeReference para retry idempotente.
  //
  // Si el backend devuelve TX_FAILED_AFTER_CHARGE, guardamos el
  // chargeReference (flowOrder + commerceOrder) en localStorage con TTL
  // de 1 hora. En el próximo intento del cliente, lo incluimos en el
  // payload para que el backend lo reuse via validateChargeReference
  // (sin re-cobrar). Si pasa el TTL o el cliente cierra el browser, el
  // chargeReference se pierde y el retry vuelve a cobrar (riesgo
  // asumido; el correo de alerta admin cubre ese borde).
  // ─────────────────────────────────────────────────────────────────────

  private readonly PENDING_CHARGE_REF_KEY = 'pendingSubscriptionChargeRef';
  private readonly PENDING_CHARGE_REF_TTL_MS = 60 * 60 * 1000; // 1 hora

  private getPendingChargeReference(): ChargeReference | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const raw = localStorage.getItem(this.PENDING_CHARGE_REF_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { ref: ChargeReference; ts: number };
      if (Date.now() - parsed.ts > this.PENDING_CHARGE_REF_TTL_MS) {
        localStorage.removeItem(this.PENDING_CHARGE_REF_KEY);
        return null;
      }
      return parsed.ref;
    } catch {
      return null;
    }
  }

  private savePendingChargeReference(ref: ChargeReference): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(
      this.PENDING_CHARGE_REF_KEY,
      JSON.stringify({ ref, ts: Date.now() }),
    );
  }

  private clearPendingChargeReference(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(this.PENDING_CHARGE_REF_KEY);
  }

  // ─────────────────────────────────────────────────────────────────────
  // Helpers factorizados del payload del endpoint consolidado.
  // ─────────────────────────────────────────────────────────────────────

  private getFirstChargeAmount(): number {
    const isTwoSoles = isPlatformBrowser(this.platformId)
      && localStorage.getItem('TEST-PROD-TWO-SOLES') === 'TEST-PROD-TWO-SOLES';
    return isTwoSoles ? 2 : this.ENV.campanaPrimeraCreatina.precio;
  }

  private getFlowPlanId(): string {
    const isTwoSoles = isPlatformBrowser(this.platformId)
      && localStorage.getItem('TEST-PROD-TWO-SOLES') === 'TEST-PROD-TWO-SOLES';
    return isTwoSoles ? this.ENV.flowPlanIdTest : this.ENV.flowCreatina250Gr2025_55_PlanId;
  }

  private mapPaymentMethod(): PaymentMethod {
    switch (this.paymentMethod()) {
      case FlowPaymentMethod.BANK_TRANSFER:
        return PaymentMethod.BANK_TRANSFER;
      case FlowPaymentMethod.PAGO_EFECTIVO:
        return PaymentMethod.PAGO_EFECTIVO;
      case FlowPaymentMethod.YAPE:
        return PaymentMethod.YAPE;
      default:
        return PaymentMethod.CREDIT_CARD;
    }
  }

  private handleSubscriptionError(error: any): Observable<never> {
    console.error('Error en el proceso de suscripción: ', error);
    this._toastService.error('Ups!', 'Error al procesar la suscripción. Por favor, intenta nuevamente.');
    return throwError(() => error);
  }

  private navigateToConfirmation(): void {
    // Cerrar el modal si fue levantado como modal
    if (this._verificationPaymentModalService.isOpen()) {
      this._verificationPaymentModalService.close();
      this._summaryService.clearSummaryOnly();
      this._toastService.success('¡Genial!', 'Suscripción creada correctamente.');
      return;
    }

    this._router.navigate(['registro/confirmacion'], {
      queryParams: { status: this.isOutsideLimaMetropolitana() ? ConfirmationStatus.SUBSCRIPTION_SUCCESS_OUTSIDE_LIMA : ConfirmationStatus.SUBSCRIPTION_SUCCESS }
    });
  }

  verifyPayment() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isPaymentVerified.set(true);
  }

  hasRequiredError(field: string) {
    const control = this.form.get(field);
    return control?.hasError('required') && control.touched;
  }

  formatCardNumber(): void {
    let cardNumber = this.form.get('cardNumber')?.value || '';
    cardNumber = cardNumber.replace(/\D/g, '');
    cardNumber = cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.form.get('cardNumber')?.setValue(cardNumber, { emitEvent: false });
  }

  selectPaymentMethod(paymentMethod: FlowPaymentMethod) {
    this.paymentMethod.set(paymentMethod);
    if (paymentMethod === FlowPaymentMethod.RECURRENT_PAYMENT) {
      this.buttonName.set('Continuar →');
    } else {
      this.buttonName.set('Pagar →');
    }
  }

  cardAddedSuccessfully($event: boolean) {
    if ($event) {
      this.trackAddPaymentInfo();
      setTimeout(() => {
        this.isPaymentVerified.set(true);
      }, 2000);
      const card = this._summaryService.getSummary()?.userData?.last4CardDigits + ' (' + this._summaryService.getSummary()?.userData?.creditCardType + ')';
      this.labelCardRegisted.update(label => label + card);
      this._toastService.success('Tarjeta registrada correctamente!', this.labelCardRegisted());
    }
    else {
      this._toastService.error('Ups!', 'Error al registrar la tarjeta. Por favor, intenta nuevamente.');
    }
  }

  registerUserFlowAndRegisterCard() {
    const userData = this._summaryService.getSummary()?.userData;

    if (userData?.id) {
      if (userData.customerId && this.isCreatinaSuscription()) {
        // Primero verificar si ya tiene tarjeta enrolada en Flow
        this._flowService.getCustomer(userData.customerId).pipe(
          catchError(() => EMPTY)
        ).subscribe(customer => {
          if (customer.last4CardDigits && customer.creditCardType) {
            // Ya tiene tarjeta — no mostrar widget
            this.enrolledCard.set({ last4: customer.last4CardDigits, brand: customer.creditCardType });
            this.labelCardRegisted.set(`**** **** **** ${customer.last4CardDigits} (${customer.creditCardType})`);
            this.isPaymentVerified.set(true);
          } else {
            // Sin tarjeta enrolada — flujo normal
            this.updateExistingCustomerWithFlow(userData.customerId!, userData);
          }
        });
      }
      else if (!userData.customerId && this.isCreatinaSuscription()) {
        this.createNewCustomerWithFlow(userData);
      }
      else {
        return;
      }
    }
  }

  private createNewCustomerWithFlow(userData: UserDataSummary) {
    const flowCustomerRequest: CreateCustomerRequest = {
      name: `${userData.nombre} ${userData.apellido}`,
      email: userData.email,
      externalId: userData.nroDocument,
    };

    this._flowService.createCustomer(flowCustomerRequest)
      .pipe(
        tap(response => {
          this._summaryService.setUserData({ ...userData, customerId: response.customerId });
          this.isLoading.set(false);
        }),
        switchMap(response => {
          return this._userService.updateUser(userData.id!, { flowCustomerId: response.customerId })
        }),
        switchMap(response => {
          console.log('Customer updated: ', response);
          return this._flowService.registerCard(this._summaryService.getSummary()?.userData?.customerId ?? '')
        }),
        catchError(err => {
          this.isLoading.set(false);
          console.error(err);
          this.handleCustomerError(err);
          return EMPTY;
        })
      )
      .subscribe({
        next: (response) => {
          this.flowToken.set((response as RegisterCardResponse).token);
          //this._toastService.success('¡Genial!', 'Todo listo, ahora puedes pagar.');
        }
      });
  }

  private updateExistingCustomerWithFlow(customerId: string, userData: UserDataSummary) {
    const customerRequest: EditCustomerRequest = {
      name: `${userData.nombre} ${userData.apellido}`,
      email: userData.email,
      externalId: userData.nroDocument,
      customerId: customerId,
    };

    this._flowService.editCustomer(customerRequest)
      .pipe(
        tap(() => {
          if (customerId) {
            userData.customerId = customerId;
          }
          this._summaryService.setUserData(userData);
          this.isLoading.set(false);
        }),
        switchMap(response => {
          return this._userService.updateUser(userData.id!, { flowCustomerId: response.customerId })
        }),
        switchMap(response => {
          //console.log('Customer updated: ', response);
          return this._flowService.registerCard(this._summaryService.getSummary()?.userData?.customerId ?? '')
        }),
        catchError(err => {
          console.error(err);
          this.handleCustomerError(err);
          return EMPTY;
        })
      )
      .subscribe({
        next: (response) => {
          this.flowToken.set((response as RegisterCardResponse).token);
          //this._toastService.success('¡Genial!', 'Todo listo, ahora puedes pagar.');
        }
      });
  }

  // Manejar errores de cliente
  private handleCustomerError(err: any) {
    this.isLoading.set(false);

    if (err.error?.code === 501) {
      if (err.error.message.includes('externalId')) {
        localStorage.setItem('isExternalIdExists', 'true');
        this._router.navigate(['registro/crear-cuenta'], { queryParams: { next: 'verificacion' } });
        this._toastService.error('Ups!', 'Ya existe una cuenta con el N° de documento ingresado.');
        //localStorage.setItem('isExternalIdExists', 'false');


      } else if (err.error.message.includes('email')) {
        localStorage.setItem('isEmailInvalid', 'true');
        this._router.navigate(['registro/crear-cuenta'], { queryParams: { next: 'verificacion' } });
        this._toastService.warning('Ups!', 'El correo ingresado no existe, por favor ingrese un correo válido.');
        //localStorage.setItem('isEmailInvalid', 'false');

      }
    } else {
      this._toastService.error('Ups!', 'Error al crear la cuenta. Por favor, intenta nuevamente.');
      console.error(err);
    }
  }

  /**
   * Resetea la verificación de pago cuando falla el cargo
   * Limpia el label de la tarjeta y solicita un nuevo token para registrar otra tarjeta
   */
  private resetPaymentVerification(): void {
    // Resetear el estado de verificación de pago
    this.isPaymentVerified.set(false);

    // Limpiar el label de la tarjeta registrada
    this.labelCardRegisted.set('**** **** **** ');

    // Limpiar el token actual para forzar la recarga del widget
    this.flowToken.set('');

    // Solicitar un nuevo token para registrar otra tarjeta
    const customerId = this._summaryService.getSummary()?.userData?.customerId;
    if (customerId) {
      this._flowService.registerCard(customerId)
        .pipe(
          catchError(err => {
            console.error('Error al generar nuevo token de Flow:', err);
            this._toastService.error('Error', 'No se pudo preparar el formulario. Intenta nuevamente.');
            return EMPTY;
          })
        )
        .subscribe({
          next: (response) => {
            this.flowToken.set((response as RegisterCardResponse).token);
          }
        });
    }
  }

  trackAddPaymentInfo() {
    this._metaAnalyticsService.trackAddPaymentInfo({
      content_ids: ['creatina-250gr-suscripcion'],
      content_type: 'subscription',
      content_category: 'suscripcion_mensual',
      value: this.ENV.precioCreatinaSubscription,
      currency: 'PEN'
    });
  }
}
