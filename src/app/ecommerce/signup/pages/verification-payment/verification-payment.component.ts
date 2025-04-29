import { Component, inject, PLATFORM_ID } from '@angular/core';
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
import { ConfirmationStatus, SummaryEnum, UserDataSummary } from '../../../../shared/models/summary.model';
import { FlowWidgetAddCardComponent } from '../../../../shared/ui/flow-widget-add-card/flow-widget-add-card.component';
import { FlowService } from '../../../../shared/services/flow.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CreateCustomerRequest, CreateSubscriptionRequest, EditCustomerRequest, FlowPaymentMethod, FlowPaymentRequest, RegisterCardResponse } from '../../../../shared/models/flow.model';
import { switchMap, EMPTY, catchError, tap, finalize } from 'rxjs';
import { RegisterUserRequest } from '../../../../shared/interfaces/auth.interfaces';
import { AuthService } from '../../../../shared/services/auth.service';
import { OrderService } from '../../../../shared/services/order.service';
import { CreateOrderRequest, OrderStatus, UpdateOrderDetailsRequest } from '../../../../shared/interfaces/order.interfaces';

@Component({
  selector: 'app-verification-payment',
  standalone: true,
  imports: [StepComponent, ButtonComponent, ReactiveFormsModule, CommonModule, InformationComponent, PaymentMethodComponent, FlowWidgetAddCardComponent],
  templateUrl: './verification-payment.component.html',
})
export class VerificationPaymentComponent {
  paymentMethod: FlowPaymentMethod = FlowPaymentMethod.DEBIT_CREDIT_CARD;
  ENV = environment
  isPaymentVerified = false;
  isLoading = false;
  promotionIsShow = false;
  informationList: Information[] = [
    {
      name: 'Tu creatina gratis se enviará inmediatamente después de completar el registro',
    },
    {
      name: 'Periodo de prueba de ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días',
    },
    {
      name: 'Cancela cuando quieras',
    }
  ]
  flowToken = '';
  buttonName = 'Pagar →';
  private platformId = inject(PLATFORM_ID)
  private _formBuilder = inject(FormBuilder)
  private _router = inject(Router)
  private _summaryService = inject(SummaryService)
  private _seo = inject(SeoService)
  private _toastService = inject(ToastService)
  private _cookieService = inject(CookieService)
  private _flowService = inject(FlowService)
  private _authService = inject(AuthService)
  private _orderService = inject(OrderService)
  private readonly destroy$ = takeUntilDestroyed();
  labelCardRegisted = '**** **** **** ';
  stepEnum = StepEnum;
  isCreatinaGratis = false;

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
      this.isCreatinaGratis = true;
    }
    if (this._cookieService.get('promoCode')) {
      this.isPaymentVerified = true;
      this.promotionIsShow = true;
      this.form.get('promoCode')?.setValue(this._cookieService.get('promoCode'));
      this.form.get('promoCode')?.disable();
    }

    if (isPlatformBrowser(this.platformId)) {
      this.registerUserFlowAndRegisterCard();
    }
    this.isPaymentVerified = summary?.userData?.isPaymentVerified ?? false;
    if (this.isPaymentVerified) {
      this.cardAddedSuccessfully(true);
    }
  }

  applyPromoCode() {
    if (this.form.get('promoCode')?.valid || !this.isPaymentVerified) {
      const promoCode = this.form.get('promoCode')?.value;
      if (promoCode === 'FREE' || promoCode === 'ERROR') {
        this.isPaymentVerified = true;
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
    this.isLoading = true;
    if (this.paymentMethod === FlowPaymentMethod.RECURRENT_PAYMENT) {
      this._summaryService.setChoosePlan({
        selection: SummaryEnum.CREATINA_250G_SUBSCRIPTION,
        descriptionOne: 'Plan mensual de S/' + this.ENV.precioCreatinaSubscription + '.',
        descriptionTwo: 'Ganas S/' + this.ENV.creditoRegaloPorCompraMes + ' de crédito.',
        descrptionThree: 'Creatina ' + this.ENV.creatinaFreeGramos + 'gr (gratis) 🎁',
        descrptionFour: 'Periodo de prueba de ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días.',
        quantity: 1
      })
      this.ngOnInit();
      return
    }

    const promoCode = this.form.get('promoCode')?.value;
    if (promoCode === 'FREE') {
      this._router.navigate(['registro/confirmacion'], { queryParams: { status: ConfirmationStatus.SUBSCRIPTION_SUCCESS_OUTSIDE_LIMA } });
    }
    else {
      if (!this.isCreatinaGratis) {
        if (this.isPaymentVerified) {
          //Logica para hacer pago unico con el token de la tarjeta.
          this._toastService.success('¡Genial!', 'Pago realizado con éxito.');
          setTimeout(() => {
            this._router.navigate(['registro/confirmacion'], { queryParams: { status: ConfirmationStatus.SUBSCRIPTION_SUCCESS } });
          }, 2000);
        }
        else {
          const status = this._summaryService.getSummary()?.userData?.isSignUpAcepted ?? false ? ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITH_REGISTRATION : ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITHOUT_REGISTRATION;
          const paymentRequest: FlowPaymentRequest = {
            amount: this.ENV.precioCreatinaOnePurchase,
            currency: 'PEN',
            commerceOrder: '',
            subject: 'Creatina Monohidratada Magrolabs de 250 gr.',
            email: this._summaryService.getSummary()?.userData?.email ?? '',
            paymentMethod: this.paymentMethod,
            urlReturn: this.ENV.flowUrlReturn,
            urlConfirmation: this.ENV.flowUrlConfirmation
          }

          localStorage.setItem('status', status.toString());

          const orderRequest: CreateOrderRequest = {
            shipping_address: this._summaryService.getSummary()?.address?.id ?? '',
            payment_method: this.paymentMethod.toString(),
            //discount: 20,
            isLoyaltyWebShow: false,
            orderItems: [
              {
                product_id: '00000001-50eb-4ac3-aa94-1b64fbf32b9c', // ID del producto de creatina 250gr
                quantity: 1
              }
            ]
          }

          //Create order
          const orderId = this._summaryService.getSummary()?.userData?.orderId ?? ''

          if (orderId) {

            const orderDetails: UpdateOrderDetailsRequest = {
              payment_method: this.paymentMethod.toString(),
              shipping_address: this._summaryService.getSummary()?.address?.id ?? '',
            }

            this._orderService.updateOrderDetails(orderId, orderDetails).pipe(
              switchMap(response => {
                //console.log('updateOrderDetails response', response);
                paymentRequest.commerceOrder = response.data.order.id;
                return this._flowService.createPayment(paymentRequest);
              }),
              finalize(() => {
                this.isLoading = false;
              })
            ).subscribe({
              next: (response) => {
                window.location.href = response.url + '?token=' + response.token;
              },
              error: (err) => {
                console.error('Error creating payment: ', err);
                this._toastService.error('Ups!', 'Error al redirigir al pago. Por favor, intenta nuevamente.');
              }
            });
          } else {
            this._orderService.createOrder(orderRequest).pipe(
              switchMap(response => {
                paymentRequest.commerceOrder = response.data.order.id;
                const userData = this._summaryService.getSummary()?.userData;
                if (userData) {
                  this._summaryService.setUserData({
                    ...userData,
                    orderId: response.data.order.id,
                    nombre: userData.nombre || '',
                    apellido: userData.apellido || '',
                    nroDocument: userData.nroDocument || '',
                    email: userData.email || '',
                    cellphone: userData.cellphone || '',
                    typeDocument: userData.typeDocument || '',
                    customerId: userData.customerId || '',
                    isPaymentVerified: userData.isPaymentVerified || false,
                    last4CardDigits: userData.last4CardDigits || '',
                    creditCardType: userData.creditCardType || ''
                  });
                }
                return this._flowService.createPayment(paymentRequest);
              }),
              finalize(() => {
                this.isLoading = false;
              })
            ).subscribe({
              next: (response) => {
                window.location.href = response.url + '?token=' + response.token;
              },
              error: (err) => {
                console.error('Error creating payment: ', err);
                this._toastService.error('Ups!', 'Error al redirigir al pago. Por favor, intenta nuevamente.');
              }
            });
          }
        }
      }
      else {
        const subscription: CreateSubscriptionRequest = {
          planId: this.ENV.flowCreatina250Gr2025PlanId,
          customerId: this._summaryService.getSummary()?.userData?.customerId ?? '',
          trial_period_days: this.ENV.diasNormalesDePruebaOperiodoDeReflexion
        }
        this._flowService.createSubscription(subscription).subscribe({
          next: (response) => {
            // console.log('Subscription created: ', response);
            this._router.navigate(['registro/confirmacion'], { queryParams: { status: ConfirmationStatus.SUBSCRIPTION_SUCCESS } });
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error creating subscription: ', err);
            this._toastService.error('Ups!', 'Error al procesar la suscripción. Por favor, intenta nuevamente.');
            this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
      // this._router.navigate(['registro/confirmacion'], { queryParams: { status: 0 } });
    }
  }
  //Create Order_subscription
  //Create payment
  verifyPayment() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isPaymentVerified = true;
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
    this.paymentMethod = paymentMethod;
    if (paymentMethod === FlowPaymentMethod.RECURRENT_PAYMENT) {
      this.buttonName = 'Continuar →';
    } else {
      this.buttonName = 'Pagar →';
    }
  }

  cardAddedSuccessfully($event: boolean) {
    if ($event) {
      setTimeout(() => {
        this.isPaymentVerified = true;
      }, 2000);
      const card = this._summaryService.getSummary()?.userData?.last4CardDigits + ' (' + this._summaryService.getSummary()?.userData?.creditCardType + ')';
      this.labelCardRegisted += card;
      this._toastService.success('Tarjeta registrada correctamente!', this.labelCardRegisted);
    }
    else {
      this._toastService.error('Ups!', 'Error al registrar la tarjeta. Por favor, intenta nuevamente.');
    }
  }

  registerUserFlowAndRegisterCard() {
    const userData = this._summaryService.getSummary()?.userData;
    if (userData?.id) {
      if (userData.customerId && this.isCreatinaGratis) {
        this.updateExistingCustomerWithFlow(userData.customerId, userData);
      } else if (!userData.customerId && this.isCreatinaGratis) {
        this.createNewCustomerWithFlow(userData);
      }
      else{
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
          this.isLoading = false;
        }),
        switchMap(response => this._flowService.registerCard(response.customerId)),
        catchError(err => {
          this.isLoading = false;
          console.error(err);
          this.handleCustomerError(err);
          return EMPTY;
        })
      )
      .subscribe({
        next: (response) => {
          this.flowToken = (response as RegisterCardResponse).token;
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
          this.isLoading = false;
        }),
        switchMap(() => this._flowService.registerCard(customerId)),
        catchError(err => {
          console.error(err);
          this.handleCustomerError(err);
          return EMPTY;
        })
      )
      .subscribe({
        next: (response) => {
          this.flowToken = (response as RegisterCardResponse).token;
          this._toastService.success('¡Genial!', 'Todo listo, ahora puedes pagar.');
        }
      });
  }

  // Manejar errores de cliente
  private handleCustomerError(err: any) {
    this.isLoading = false;

    if (err.error?.code === 501) {
      if (err.error.message.includes('externalId')) {
        localStorage.setItem('isExternalIdExists', 'true');
        this._router.navigate(['registro/crear-cuenta'], { queryParams: { next: 'verificacion' }});
        this._toastService.error('Ups!', 'Ya existe una cuenta con el N° de documento ingresado.');
        //localStorage.setItem('isExternalIdExists', 'false');
        

      } else if (err.error.message.includes('email')) {
        localStorage.setItem('isEmailInvalid', 'true');
        this._router.navigate(['registro/crear-cuenta'], { queryParams: { next: 'verificacion' }});
        this._toastService.warning('Ups!', 'El correo ingresado no existe, por favor ingrese un correo válido.');
        //localStorage.setItem('isEmailInvalid', 'false');

      }
    } else {
      this._toastService.error('Ups!', 'Error al crear la cuenta. Por favor, intenta nuevamente.');
      console.error(err);
    }
  }
}
