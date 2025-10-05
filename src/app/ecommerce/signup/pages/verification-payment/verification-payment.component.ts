import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
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
import { AddressSummary, ConfirmationStatus, Summary, SummaryEnum, UserDataSummary } from '../../../../shared/models/summary.model';
import { FlowWidgetAddCardComponent } from '../../../../shared/ui/flow-widget-add-card/flow-widget-add-card.component';
import { FlowService } from '../../../../shared/services/flow.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CreateCustomerRequest, CreateSubscriptionResponse, EditCustomerRequest, FlowCreateSubscriptionRequest, FlowPaymentMethod, FlowPaymentRequest, RegisterCardResponse } from '../../../../shared/models/flow.model';
import { switchMap, EMPTY, catchError, tap, finalize, throwError, Observable, of, Subscription, map } from 'rxjs';
import { OrderService } from '../../../../shared/services/order.service';
import { CreateOrderRequest, OrderStatus, PaymentMethod, UpdateOrderDetailsRequest } from '../../../../shared/interfaces/order.interfaces';
import { AtPeriodEnd, SubscriptionService } from '../../../../shared/services/subscription.service';
import { CreateSubscriptionRequest, SubscriptionResponse, SubscriptionStatusEnum } from '../../../../shared/interfaces/subscription.interface';
import { SubscriptionOrderService } from '../../../../shared/services/subscription-order.service';
import { CreateSubscriptionOrderRequest } from '../../../../shared/interfaces/subscription-order.interface';
import { response } from 'express';
import { UserService } from '../../../../shared/services/user.service';
import { UpdateUserRequest } from '../../../../shared/interfaces/user.interfaces';
import { CreditTransactionService, TransactionType } from '../../../../shared/services/credit-transactions.service';

@Component({
  selector: 'app-verification-payment',
  standalone: true,
  imports: [StepComponent, ButtonComponent, ReactiveFormsModule, CommonModule, InformationComponent, PaymentMethodComponent, FlowWidgetAddCardComponent],
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
      name: 'Tu creatina gratis se enviará inmediatamente después de completar el registro',
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
  private _orderService = inject(OrderService)
  private _subscriptionService = inject(SubscriptionService)
  private _subscriptionOrderService = inject(SubscriptionOrderService)
  private _userService = inject(UserService)
  private _creditTransactionService = inject(CreditTransactionService)
  private readonly destroy$ = takeUntilDestroyed();
  labelCardRegisted = signal('**** **** **** ');
  stepEnum = StepEnum;
  isCreatinaGratis = signal(false);
  isOutsideLimaMetropolitana = signal(false);

  form = this._formBuilder.group({
    promoCode: this._formBuilder.control('', [Validators.minLength(3), Validators.pattern(/^[A-Z0-9]{3,10}$/)]),
    cardNumber: this._formBuilder.nonNullable.control('', [Validators.required, Validators.pattern(/^[0-9]{15,16}|(([0-9]{4}\s){3}[0-9]{3,4})$/)]),
    cardName: this._formBuilder.nonNullable.control('', [Validators.required, Validators.pattern(/^[A-Z\s]{3,}$/)]),
    cardExpiration: this._formBuilder.nonNullable.control('', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/[0-9]{4}$/)]),
    cardCvv: this._formBuilder.nonNullable.control('', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]),
  })

  ngOnInit() {
    this._seo.title.setTitle('Magrolabs | Verificación de pago');
    this._seo.setCanonicalURL('magrolabs.com/registro/verificacion');
    this._seo.setIndexFollow(false);

    let summary = this._summaryService.getSummary()
    if (!summary?.address) {
      this._router.navigate(['registro/direccion']);
    }
    if (summary?.chosePlan?.selection === SummaryEnum.CREATINA_250G_SUBSCRIPTION) {
      this.isCreatinaGratis.set(true);
    }

    // Validar si la dirección está fuera de Lima Metropolitana
    this.validateAddressLocation(summary!);
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
    if (this._cookieService.get('promoCode')) {
      this.isPaymentVerified.set(true);
      this.promotionIsShow.set(true);
      this.form.get('promoCode')?.setValue(this._cookieService.get('promoCode'));
      this.form.get('promoCode')?.disable();
    }

    if (isPlatformBrowser(this.platformId)) {
      this.registerUserFlowAndRegisterCard();
    }
    this.isPaymentVerified.set(summary?.userData?.isPaymentVerified ?? false);
    if (this.isPaymentVerified()) {
      this.cardAddedSuccessfully(true);
    }
  }

  applyPromoCode() {
    if (this.form.get('promoCode')?.valid || !this.isPaymentVerified()) {
      const promoCode = this.form.get('promoCode')?.value;
      if (promoCode === 'FREE' || promoCode === 'ERROR') {
        this.isPaymentVerified.set(true);
        this._toastService.success('¡Genial!', 'Código de promoción aplicado correctamente.');
        this._cookieService.set('promoCode', promoCode);
        this.form.get('promoCode')?.disable();
      }
      else {
        this._toastService.warning('Código inválido', 'El código de promoción no existe o a caducado.');
      }
    }
  }

  nextStep() {
    this.isLoading.set(true);
    
    if (this.paymentMethod() === FlowPaymentMethod.RECURRENT_PAYMENT) {
      this.handleRecurrentPaymentOption();
      return;
    }

    const promoCode = this.form.get('promoCode')?.value;
    if (promoCode === 'FREE') {
      this._router.navigate(['registro/confirmacion'], { 
        queryParams: { status: ConfirmationStatus.SUBSCRIPTION_SUCCESS_OUTSIDE_LIMA } 
      });
      this.isLoading.set(false);
      return;
    }

    if (this.isCreatinaGratis()) {
      this.handleSubscriptionFlow();
    } else {
      this.handleOnePurchaseFlow();
    }
  }

  private handleRecurrentPaymentOption(): void {
    const userData = this._summaryService.getSummary()?.userData;
    if (userData?.isSignUpAcepted && userData?.password) {
      this._summaryService.setChoosePlan({
        selection: SummaryEnum.CREATINA_250G_SUBSCRIPTION,
        descriptionOne: 'Plan mensual de S/' + this.ENV.precioCreatinaSubscription + '.',
        descriptionTwo: 'Ganas ' + this.ENV.creditoRegaloPorCompraMes + ' Magropuntos.',
        descrptionThree: 'Creatina ' + this.ENV.creatinaFreeGramos + 'gr (gratis) 🎁',
        descrptionFour: 'Periodo de prueba de ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días.',
        quantity: 1
      });
      this.ngOnInit();
    } else {
      this._toastService.warning('Ups!', 'Necesitas completar la contraseña para suscribirte.');
      this._summaryService.setChoosePlan({
        selection: SummaryEnum.CREATINA_250G_SUBSCRIPTION,
        descriptionOne: 'Plan mensual de S/' + this.ENV.precioCreatinaSubscription + '.',
        descriptionTwo: 'Ganas ' + this.ENV.creditoRegaloPorCompraMes + ' Magropuntos.',
        descrptionThree: 'Creatina ' + this.ENV.creatinaFreeGramos + 'gr (gratis) 🎁',
        descrptionFour: 'Periodo de prueba de ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días.',
        quantity: 1
      });
      this._router.navigate(['registro/crear-cuenta'], { queryParams: { next: 'verificacion' } });
      localStorage.setItem('passwordSignal', 'true');
    }
    this.isLoading.set(false);
  }

  private handleOnePurchaseFlow(): void {
    if (this.isPaymentVerified()) {
      this.handleVerifiedPayment();
      return;
    }
    
    const orderId = this._summaryService.getSummary()?.userData?.orderId ?? '';
    const status = this._summaryService.getSummary()?.userData?.isSignUpAcepted ?? false 
      ? ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITH_REGISTRATION 
      : ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITHOUT_REGISTRATION;
    
    const paymentRequest = this.createPaymentRequest();
    localStorage.setItem('status', status.toString());
    const wasSubscription = this._summaryService.getSummary()?.userData?.isSubscription ?? false;

    if (orderId) {
      if (wasSubscription) {
        this.processCancelAndCreateNewOrder(orderId, paymentRequest);
      }
      else {
        this.processExistingOrderPayment(orderId, paymentRequest);
      }
    } else {
      this.processNewOrderPayment(paymentRequest);
    }
  }
//TODO: Cancelar la suscripción en flow tambien?
  processCancelAndCreateNewOrder(orderId: string, paymentRequest: FlowPaymentRequest) {
      const orderRequest = this.createOrderRequest(false);
      const subscriptionId = this._summaryService.getSummary()?.userData?.subscriptionId ?? '';
      
      this._orderService.cancelOrder(orderId).pipe(
        switchMap(response => {
          console.log('Order canceled: ', response);
          return this._subscriptionService.cancelSubscription(subscriptionId, 'Cancelación desde verificación de pago');
        }),
        switchMap(response => {
          console.log('Subscription canceled: ', response);
          return this._flowService.cancelSubscription(subscriptionId, AtPeriodEnd.IMMEDIATE);
        }),
        switchMap(response => {
          console.log('flowService cancelSubscription: ', response);
          return this._orderService.createOrder(orderRequest);
        }),
        switchMap(response => {
          paymentRequest.commerceOrder = response.data.order.id;
          this.updateUserDataWithOrderId(response.data.order.id);
          return this._flowService.createPayment(paymentRequest);
        }),
        catchError(error => {
          console.error('Error creating payment: ', error);
          this._toastService.error('Ups!', 'Error al redirigir al pago. Por favor, intenta nuevamente.');
          return throwError(() => error);
        }),
        finalize(() => {
          this._summaryService.setUserData({
            ...this._summaryService.getSummary()?.userData as UserDataSummary,
            isSubscription: false
          });
          this.isLoading.set(false);
        })
      ).subscribe({
        next: (response) => {
          window.location.href = response.url + '?token=' + response.token;
        }
      });
  }

  private handleVerifiedPayment(): void {
    this._toastService.success('¡Genial!', 'Pago realizado con éxito.');
    setTimeout(() => {
      this._router.navigate(['registro/confirmacion'], { 
        queryParams: { status: ConfirmationStatus.SUBSCRIPTION_SUCCESS } 
      });
    }, 2000);
    this.isLoading.set(false);
  }

  private createPaymentRequest(): FlowPaymentRequest {

    const status = this.form.get('isSignUpAcepted')?.value ?? false
    ? ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITH_REGISTRATION
    : ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITHOUT_REGISTRATION;

    return {
      amount: localStorage.getItem('TEST-PROD-TWO-SOLES') == 'TEST-PROD-TWO-SOLES' ? 2 : this.ENV.precioCreatinaOnePurchase,
      currency: 'PEN',
      commerceOrder: '',
      subject: 'Creatina Monohidratada Magrolabs de 250 gr.',
      email: this._summaryService.getSummary()?.userData?.email ?? '',
      paymentMethod: this.paymentMethod(),
      urlReturn: this.ENV.flowUrlReturn + '?status=' + Number(status).toString(),
      urlConfirmation: this.ENV.flowUrlConfirmation
    };
  }

  private processExistingOrderPayment(orderId: string, paymentRequest: FlowPaymentRequest): void {
    const orderDetails = this.createOrderDetailsWithPaymentMethod();
    
    this._orderService.updateOrderDetails(orderId, orderDetails).pipe(
      switchMap(response => {
        paymentRequest.commerceOrder = response.data.order.id;
        return this._flowService.createPayment(paymentRequest);
      }),
      catchError(error => {
        console.error('Error creating payment: ', error);
        this._toastService.error('Ups!', 'Error al redirigir al pago. Por favor, intenta nuevamente.');
        return throwError(() => error);
      }),
      finalize(() => {
        this._summaryService.setUserData({
          ...this._summaryService.getSummary()?.userData as UserDataSummary,
          isSubscription: false
        });
        this.isLoading.set(false);
      })
    ).subscribe({
      next: (response) => {
        window.location.href = response.url + '?token=' + response.token;
      }
    });
  }

  private processNewOrderPayment(paymentRequest: FlowPaymentRequest): void {
    const orderRequest = this.createOrderRequest(false);
    
    this._orderService.createOrder(orderRequest).pipe(
      switchMap(response => {
        paymentRequest.commerceOrder = response.data.order.id;
        this.updateUserDataWithOrderId(response.data.order.id);
        return this._flowService.createPayment(paymentRequest);
      }),
      catchError(error => {
        console.error('Error creating payment: ', error);
        this._toastService.error('Ups!', 'Error al redirigir al pago. Por favor, intenta nuevamente.');
        return throwError(() => error);
      }),
      finalize(() => {
        this._summaryService.setUserData({
          ...this._summaryService.getSummary()?.userData as UserDataSummary,
          isSubscription: false
        });
        this.isLoading.set(false);
      })
    ).subscribe({
      next: (response) => {
        window.location.href = response.url + '?token=' + response.token;
      }
    });
  }

  private handleSubscriptionFlow(): void {
    const subscription = this.createFlowSubscriptionRequest();
    const orderId = this._summaryService.getSummary()?.userData?.orderId ?? '';
    const wasSubscription = this._summaryService.getSummary()?.userData?.isSubscription ?? false;

    if (orderId) {
      if (!wasSubscription) {
        this.processCancelAndCreateNewOrderSubscription(orderId, subscription);
      }
      else {
        this.processExistingOrderSubscription(orderId, subscription);
      }
    }
    else {
      this.processNewOrderSubscription(subscription);
    }
  }

  private processCancelAndCreateNewOrderSubscription(orderId: string, subscription: FlowCreateSubscriptionRequest) {
    const orderRequest = this.createOrderRequest(true);

    this._orderService.cancelOrder(orderId).pipe(
        switchMap(response => {
          console.log('Order canceled: ', response);
          return this._orderService.createOrder(orderRequest);
        }),
        switchMap(response => {
          this.updateUserDataWithOrderId(response.data.order.id);
          return this._flowService.createSubscription(subscription);
        }),
        switchMap(flowResponse => {
          console.log('Flow Subscription created: ', flowResponse);
          return this.createBackendSubscription();
        }),
        switchMap(subscriptionResponse => {
          const subscriptionOrderRequest = this.createSubscriptionOrderRequest(subscriptionResponse.id);
          return this._subscriptionOrderService.createSubscriptionOrder(subscriptionOrderRequest);
        }),
        switchMap(subscriptionOrderResponse => {
          console.log('Subscription order created: ', subscriptionOrderResponse);
          const orderId = this._summaryService.getSummary()?.userData?.orderId ?? '';
          return this._orderService.updateOrderDetails(orderId, {
            status: OrderStatus.PROCESSING
          });
        }),
        switchMap(orderUpdateResponse => {
          const userId = this._summaryService.getSummary()?.userData?.id ?? '';
          if (!userId) {
            return of(null);
          }
          
          // Agregar 10 créditos al usuario por la suscripción
          return this._creditTransactionService.createTransaction({
            user_id: userId,
            type: TransactionType.EARNED,
            amount: this.ENV.creditoRegaloPorCompraMes,
            description: '¡Bienvenido a Magrolabs!',
            source: PaymentMethod.CREDIT_CARD
          });
        }),
        catchError(error => this.handleSubscriptionError(error)),
        finalize(() => {
          this._summaryService.setUserData({
            ...this._summaryService.getSummary()?.userData as UserDataSummary,
            isSubscription: true
          });
          this.isLoading.set(false);
        })
      ).subscribe({
        next: (response) => {
          console.log('Order updated and credits added: ', response);
          this.navigateToConfirmation();
        }
      });
  }

  private createFlowSubscriptionRequest(): FlowCreateSubscriptionRequest {
    if(localStorage.getItem('TEST-PROD-TWO-SOLES') == 'TEST-PROD-TWO-SOLES') {
      return {
        planId: this.ENV.flowPlanIdTest,
        customerId: this._summaryService.getSummary()?.userData?.customerId ?? '',
        trial_period_days: this.ENV.plazoDeEntregaDiasHabilesCreatinaFree.max + this.ENV.diasNormalesDePruebaOperiodoDeReflexion
      };
    }
    return {
      planId: this.ENV.flowCreatina250Gr2025PlanId,
      customerId: this._summaryService.getSummary()?.userData?.customerId ?? '',
      trial_period_days: this.ENV.plazoDeEntregaDiasHabilesCreatinaFree.max + this.ENV.diasNormalesDePruebaOperiodoDeReflexion
    };
  }

  private createOrderRequest(isSubscription: boolean): CreateOrderRequest {
    let paymentMethod = PaymentMethod.CREDIT_CARD;
    switch(this.paymentMethod()) {
      case FlowPaymentMethod.BANK_TRANSFER:
        paymentMethod = PaymentMethod.BANK_TRANSFER;
        break;
      case FlowPaymentMethod.PAGO_EFECTIVO:
        paymentMethod = PaymentMethod.PAGO_EFECTIVO;
        break;
      case FlowPaymentMethod.YAPE:
        paymentMethod = PaymentMethod.YAPE;
        break;
      default:
        paymentMethod = PaymentMethod.CREDIT_CARD;
    }
    if (isSubscription) {
      return {
        shipping_address: this._summaryService.getSummary()?.address?.id ?? '',
        payment_method: paymentMethod,
        isLoyaltyWebShow: false,
        orderItems: [
          {
            product_id: '00000002-50eb-4ac3-aa94-1b64fbf32b9c', // ID del producto de creatina 100gr
            quantity: 1
          },
          /*{
            product_id: '00000001-50eb-4ac3-aa94-1b64fbf32b9c', // ID del producto de creatina 250gr
            quantity: 1
          },
          discount: 20
          */
        ],
        
      };
    }
    return {
      shipping_address: this._summaryService.getSummary()?.address?.id ?? '',
      payment_method: paymentMethod,
      isLoyaltyWebShow: false,
      orderItems: [
        {
          product_id: '00000003-50eb-4ac3-aa94-1b64fbf32b9c', // ID del producto de creatina 250gr
          quantity: 1
        }
      ],
      discount: 0
    };
  }

  private createOrderDetailsWithPaymentMethod(): UpdateOrderDetailsRequest {
    let orderDetails: UpdateOrderDetailsRequest = {
      shipping_address: this._summaryService.getSummary()?.address?.id ?? '',
    };
    
    switch(this.paymentMethod()) {
      case FlowPaymentMethod.BANK_TRANSFER:
        orderDetails.payment_method = PaymentMethod.BANK_TRANSFER;
        break;
      case FlowPaymentMethod.PAGO_EFECTIVO:
        orderDetails.payment_method = PaymentMethod.PAGO_EFECTIVO;
        break;
      case FlowPaymentMethod.YAPE:
        orderDetails.payment_method = PaymentMethod.YAPE;
        break;
      default:
        orderDetails.payment_method = PaymentMethod.CREDIT_CARD;
    }
    
    return orderDetails;
  }

  private updateUserDataWithOrderId(orderId: string): void {
    const userData = this._summaryService.getSummary()?.userData;
    if (userData) {
      this._summaryService.setUserData({
        ...userData,
        orderId: orderId,
      });
    }
  }

  private processExistingOrderSubscription(orderId: string, subscription: FlowCreateSubscriptionRequest): void {
    const orderDetails: UpdateOrderDetailsRequest = {
      payment_method: PaymentMethod.CREDIT_CARD,
      shipping_address: this._summaryService.getSummary()?.address?.id ?? '',
      discount: 20,
    };

    this._orderService.updateOrderDetails(orderId, orderDetails).pipe(
      switchMap(response => {
        this.updateUserDataWithOrderId(response.data.order.id);
        const existingSubscriptionId = this._summaryService.getSummary()?.userData?.subscriptionId;
        
        if (existingSubscriptionId) {
          this._summaryService.setUserData({
            ...this._summaryService.getSummary()?.userData as UserDataSummary,
            subscriptionId: existingSubscriptionId
          });
          return of(<CreateSubscriptionResponse>{ subscriptionId: existingSubscriptionId });
        } else {
          return this._flowService.createSubscription(subscription);
        }
      }),
      switchMap(flowResponse => {
        return this.createBackendSubscription();
      }),
      switchMap(subscriptionResponse => {
        const subscriptionOrderRequest = this.createSubscriptionOrderRequest(subscriptionResponse.id);
        return this._subscriptionOrderService.createSubscriptionOrder(subscriptionOrderRequest);
      }),
      switchMap(subscriptionOrderResponse => {
        return this._orderService.updateOrderDetails(orderId, {
          status: OrderStatus.PROCESSING
        });
      }),
      switchMap(orderUpdateResponse => {
        const userId = this._summaryService.getSummary()?.userData?.id ?? '';
        if (!userId) {
          return of(null);
        }
        
        // Agregar 10 créditos al usuario por la suscripción
        return this._creditTransactionService.createTransaction({
          user_id: userId,
          type: TransactionType.EARNED,
          amount: this.ENV.creditoRegaloPorCompraMes,
          description: '¡Bienvenido a Magrolabs!',
          source: PaymentMethod.CREDIT_CARD
        });
      }),
      catchError(error => this.handleSubscriptionError(error)),
      finalize(() => {
        this._summaryService.setUserData({
          ...this._summaryService.getSummary()?.userData as UserDataSummary,
          isSubscription: true
        });
        this.isLoading.set(false);
      })
    ).subscribe({
      next: (response) => {
        console.log('Order updated and credits added: ', response);
        this.navigateToConfirmation();
      }
    });
  }

  private processNewOrderSubscription(subscription: FlowCreateSubscriptionRequest): void {
    const orderRequest = this.createOrderRequest(true);
    
    this._orderService.createOrder(orderRequest).pipe(
      switchMap(response => {
        this.updateUserDataWithOrderId(response.data.order.id);
        return this._flowService.createSubscription(subscription);
      }),
      switchMap(flowResponse => {
        console.log('Flow Subscription created: ', flowResponse);
        return this.createBackendSubscription();
      }),
      switchMap(subscriptionResponse => {
        const subscriptionOrderRequest = this.createSubscriptionOrderRequest(subscriptionResponse.id);
        return this._subscriptionOrderService.createSubscriptionOrder(subscriptionOrderRequest);
      }),
      switchMap(subscriptionOrderResponse => {
        console.log('Subscription order created: ', subscriptionOrderResponse);
        const orderId = this._summaryService.getSummary()?.userData?.orderId ?? '';
        return this._orderService.updateOrderDetails(orderId, {
          status: OrderStatus.PROCESSING
        });
      }),
      switchMap(orderUpdateResponse => {
        const userId = this._summaryService.getSummary()?.userData?.id ?? '';
        if (!userId) {
          return of(null);
        }
        
        // Agregar 10 créditos al usuario por la suscripción
        return this._creditTransactionService.createTransaction({
          user_id: userId,
          type: TransactionType.EARNED,
          amount: this.ENV.creditoRegaloPorCompraMes,
          description: '¡Bienvenido a Magrolabs!',
          source: PaymentMethod.CREDIT_CARD
        });
      }),
      catchError(error => this.handleSubscriptionError(error)),
      finalize(() => {
        this._summaryService.setUserData({
          ...this._summaryService.getSummary()?.userData as UserDataSummary,
          isSubscription: true
        });
        this.isLoading.set(false);
      })
    ).subscribe({
      next: (response) => {
        console.log('Order updated and credits added: ', response);
        this.navigateToConfirmation();
      }
    });
  }

  private createBackendSubscription() {
    const subscriptionRequestAPI: CreateSubscriptionRequest = {
      subscription_plan_id: '00000001-50eb-4ac3-aa94-1b64fbf32b9c',
      start_date: new Date(
        Date.now() + 
        (this.ENV.plazoDeEntregaDiasHabilesCreatinaFree.max + this.ENV.diasNormalesDePruebaOperiodoDeReflexion) * 
        24 * 60 * 60 * 1000 - 
        5 * 60 * 60 * 1000
      ).toISOString(),
      status: SubscriptionStatusEnum.TRIAL
    };
    
    return this._subscriptionService.createSubscription(subscriptionRequestAPI)
  }

  private createSubscriptionOrderRequest(subscriptionId: string): CreateSubscriptionOrderRequest {
    const order_id = this._summaryService.getSummary()?.userData?.orderId ?? '';
    return {
      subscription_id: subscriptionId,
      order_id,
      shipment_date: new Date(
        Date.now() + 
        (this.ENV.plazoDeEntregaDiasHabilesCreatinaFree.max + this.ENV.diasNormalesDePruebaOperiodoDeReflexion) * 
        24 * 60 * 60 * 1000 - 
        5 * 60 * 60 * 1000
      ).toISOString()
    };
  }

  private handleSubscriptionError(error: any): Observable<never> {
    console.error('Error en el proceso de suscripción: ', error);
    this._toastService.error('Ups!', 'Error al procesar la suscripción. Por favor, intenta nuevamente.');
    return throwError(() => error);
  }

  private navigateToConfirmation(): void {
    this._router.navigate(['registro/confirmacion'], { 
      queryParams: { status: ConfirmationStatus.SUBSCRIPTION_SUCCESS } 
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
      if (userData.customerId && this.isCreatinaGratis()) {
        this.updateExistingCustomerWithFlow(userData.customerId, userData);
      }
      else if (!userData.customerId && this.isCreatinaGratis()) {
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
          return this._userService.updateUser(userData.id!, {flowCustomerId: response.customerId})
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
          this._toastService.success('¡Genial!', 'Todo listo, ahora puedes pagar.');
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
          return this._userService.updateUser(userData.id!, {flowCustomerId: response.customerId})
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
          this._toastService.success('¡Genial!', 'Todo listo, ahora puedes pagar.');
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
}
