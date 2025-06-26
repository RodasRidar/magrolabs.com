import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformServer } from '@angular/common';
import { TransferState, makeStateKey } from '@angular/core';
import { AtPeriodEnd, SubscriptionService } from '../../../shared/services/subscription.service';
import { Subscription, SubscriptionStatusEnum, SubscriptionPlan, CreateSubscriptionRequest } from '../../../shared/interfaces/subscription.interface';
import { FlowService } from '../../../shared/services/flow.service';
import { AuthService } from '../../../shared/services/auth.service';
import { switchMap, catchError, of, takeUntil, map, finalize, EMPTY, tap, Observable } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FlowCharge, FlowChargeStatus, FlowChargesResponse, RegisterCardResponse, FlowCreateSubscriptionRequest } from '../../../shared/models/flow.model';
import { FlowWidgetAddCardComponent } from '../../../shared/ui/flow-widget-add-card/flow-widget-add-card.component';
import { ToastService } from '../../../shared/services/toast.service';
import { CreditTransactionService, TransactionType } from '../../../shared/services/credit-transactions.service';
import { Subject } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/env';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { StarRatingComponent } from '../../../shared/ui/star-rating/star-rating.component';
import { ReviewService } from '../../../shared/services/review.service';
import { UserService } from '../../../shared/services/user.service';
import { CreateCustomerRequest } from '../../../shared/models/flow.model';
import { OrderService } from '../../../shared/services/order.service';
import { SubscriptionOrderService } from '../../../shared/services/subscription-order.service';
import { CreateOrderRequest, OrderStatus, PaymentMethod } from '../../../shared/interfaces/order.interfaces';
import { CreateSubscriptionOrderRequest } from '../../../shared/interfaces/subscription-order.interface';

@Component({
  selector: 'app-suscripcion',
  standalone: true,
  imports: [CommonModule, FlowWidgetAddCardComponent, RouterLink, ButtonComponent, StarRatingComponent],
  templateUrl: './suscripcion.component.html',
  styleUrl: './suscripcion.component.css'
})
export class SuscripcionComponent implements OnInit {
  // Signals para controlar el flujo de suscripción
  showPaymentVerification = signal<boolean>(false);
  isProcessingFlow = signal<boolean>(false);

  private subscriptionService = inject(SubscriptionService);
  private flowService = inject(FlowService);
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  private _toastService = inject(ToastService);
  private _creditTransactionService = inject(CreditTransactionService);
  private destroy$ = new Subject<void>();
  private userService = inject(UserService);
  private reviewService = inject(ReviewService);
  private orderService = inject(OrderService);
  private subscriptionOrderService = inject(SubscriptionOrderService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private transferState = inject(TransferState);

  reactivateType = ReactivateType;
  ENV = environment;
  subscription = signal<Subscription | null>(null);
  subscriptionPlan = signal<SubscriptionPlan | null>(null);
  isLoading = signal<boolean>(true);
  openCardRegistration = signal<boolean>(false);
  statusEnum = SubscriptionStatusEnum;
  flowToken = '';
  nextBillingDateFreeCreatine: string = environment.diasNormalesDePruebaOperiodoDeReflexion + ' días después de la entrega.';

  flowSubscriptionId = signal<string>('');
  // Información de pago
  cardType = signal<string>('');
  cardLastFour = signal<string>('');

  // Información de créditos
  userCredits = signal<string>('0');
  isLoadingCredits = signal<boolean>(false);

  // Historial de pagos
  charges = signal<FlowCharge[]>([]);
  isLoadingCharges = signal<boolean>(false);
  showChargesHistory = signal<boolean>(false);
  chargeStatusEnum = FlowChargeStatus;
  isCardAdded = false;
  labelCardRegisted = '**** **** **** ';

  // Variables para el modal de confirmación
  showReactivationModal = signal<boolean>(false);
  reactivationMessage = signal<string>('');

  // Variables para modal de cancelación
  showCancellationModal = signal<boolean>(false);
  cancellationReason = signal<string>('');
  userName = signal<string>('');

  // Variables para modal de pausa
  showPauseModal = signal<boolean>(false);
  pauseDurationMonths = signal<number>(1);
  pauseStartDate = signal<string>('');
  pauseEndDateString = signal<string>('');
  nextPaymentDateString = signal<string>('');
  pauseEndDate = signal<Date>(new Date());
  nextPaymentDate = signal<Date>(new Date());
  // Variables para modal de confirmación final de cancelación
  showFinalCancelModal = signal<boolean>(false);

  // Variables para modal de descuento de retención
  showDiscountModal = signal<boolean>(false);

  // Variables para modal de confirmación final de cancelación
  showFinalConfirmationModal = signal<boolean>(false);
  lastPaymentDate = signal<string>('');

  // Variables para modal de confirmación exitosa de cancelación
  showSuccessCancellationModal = signal<boolean>(false);
  isPaymentVerified = signal<boolean>(false);

  // Variables para reviews
  averageRating = 4.5; // Valor por defecto
  totalReviews = 0;

  ngOnInit(): void {
    this.loadSubscription();
    this.loadUserCredits();
    
    // Definir keys para Transfer State
    const AVERAGE_RATING_KEY = makeStateKey<number>('suscripcion-average-rating');
    const TOTAL_REVIEWS_KEY = makeStateKey<number>('suscripcion-total-reviews');
    
    if (isPlatformServer(this.platformId)) {
      // En el servidor: cargar reviews y guardar en Transfer State
      this.loadReviews().then(() => {
        this.transferState.set(AVERAGE_RATING_KEY, this.averageRating);
        this.transferState.set(TOTAL_REVIEWS_KEY, this.totalReviews);
      });
    } else {
      // En el cliente: recuperar desde Transfer State
      const savedRating = this.transferState.get(AVERAGE_RATING_KEY, 4.5);
      const savedReviews = this.transferState.get(TOTAL_REVIEWS_KEY, 0);
      
      this.averageRating = savedRating;
      this.totalReviews = savedReviews;
      
      console.log(`Cliente - Reviews recuperadas: ${this.totalReviews}, Rating: ${this.averageRating}`);
    }
    this.authService.getCurrentUserObservable()?.subscribe(user => {
      if (user?.flowCustomerId) {
        // Si el usuario ya tiene flowCustomerId, generar token y mostrar directamente la validación de tarjeta
        this.flowService.registerCard(user.flowCustomerId).subscribe(response => {
          //console.log(response);
          this.flowToken = (response as RegisterCardResponse).token;
          this.showPaymentVerification.set(true);
          //despues de 2 segundos redirigir a suscription [fragment]="'reviews'"
          if (!this.isPaymentVerified()) {
            setTimeout(() => {
              this.router.navigate(['/cuenta/suscripcion'], { fragment: 'verificacion' });
            }, 2000);
          }
        });
      }

      // Guardar nombre del usuario
      if (user) {
        const nombre = this.authService.getCurrentUser()?.first_name + ' ' + this.authService.getCurrentUser()?.last_name || 'Usuario';
        this.userName.set(nombre);
      }
    });

    this.isPaymentVerified.set(localStorage.getItem('isPaymentVerified') === 'true');
    if (this.isPaymentVerified()) {
      this.cardAddedSuccessfully(true);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  nextStep() {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this._toastService.error('Error', 'No se encontró información del usuario');
      return;
    }

    if (!this.showPaymentVerification()) {
      // Primera vez - registrar en Flow y mostrar verificación
      this.registerUserInFlowAndGenerateToken();
    } else {
      // Ya se mostró la verificación, proceder con la suscripción
      this.proceedWithSubscription();
    }
  }

  loadUserCredits(): void {
    this.isLoadingCredits.set(true);

    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      this._creditTransactionService.getTotalCredits(user.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response && response.data && response.data.totalCredits) {
              this.userCredits.set(response.data.totalCredits);
            }
            this.isLoadingCredits.set(false);
          },
          error: (error) => {
            console.error('Error al obtener los créditos del usuario:', error);
            this.isLoadingCredits.set(false);
          }
        });
    } else {
      this.isLoadingCredits.set(false);
    }
  }

  cardAddedSuccessfully($event: boolean) {
    if ($event) {
      setTimeout(() => {
        this.isCardAdded = true;
      }, 2000);
      this.cardLastFour.set(localStorage.getItem('last4CardDigits') || '')
      this.cardType.set(localStorage.getItem('creditCardType') || '')
      localStorage.setItem('isPaymentVerified', 'true');

      const card = this.cardLastFour() + ' (' + this.cardType() + ')';
      this.labelCardRegisted += card;
      this._toastService.success('Tarjeta agregada correctamente!', this.labelCardRegisted);
      this.isPaymentVerified.set(true);
    }
    else {
      this._toastService.error('Ups!', 'Error al registrar la tarjeta. Por favor, intenta nuevamente.');
    }
  }

  loadSubscription(): void {
    this.isLoading.set(true);

    this.subscriptionService.getMySubscriptions(1, 1)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(response => {
          if (response.data.subscriptions && response.data.subscriptions.length > 0) {
            console.log('response.data.subscriptions[0]', response.data.subscriptions[0]);
            this.nextPaymentDate.set(new Date(response.data.subscriptions[0].next_billing_date || ''));
            this.subscription.set(response.data.subscriptions[0]);
            this.loadSubscriptionPlan(response.data.subscriptions[0].subscription_plan_id);
            this.loadPaymentMethod();
            const customerId = this.authService.getCurrentUser()?.flowCustomerId;
            return this.flowService.getSubscriptions(customerId || '')
              .pipe(
                map(flowResponse => ({
                  subscriptionResponse: response,
                  flowResponse
                })),
                catchError(err => {
                  console.error('Error al obtener detalles de Flow:', err);
                  return of({
                    subscriptionResponse: response,
                    flowResponse: null
                  });
                })
              );
          }
          this.subscription.set(null);
          // Retornar un observable que emite null si no hay suscripciones
          return of({ subscriptionResponse: response, flowResponse: null });
        }),
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: (combinedResponse) => {
          this.flowSubscriptionId.set(combinedResponse.flowResponse?.data[0].subscriptionId || '');
        },
        error: (error) => {
          console.error('Error al cargar datos de suscripción:', error);
          this._toastService.error('Error', 'Error al cargar la suscripción');
          this.subscription.set(null);
        }
      });
  }

  loadSubscriptionPlan(planId: string): void {
    this.subscriptionService.getSubscriptionPlanById(planId)
      .subscribe({
        next: (response) => {
          //console.log('subscriptionPlan', response);
          this.subscriptionPlan.set(response.data.subscriptionPlan);
          this.isLoading.set(false);
        },
        error: (err) => {
          this._toastService.error('Error', 'Error al cargar el plan de suscripción');
          this.isLoading.set(false);
          console.error('Error cargando plan de suscripción:', err);
        }
      });
  }

  loadPaymentMethod(): void {
    this.authService.getCurrentUserObservable()!
      .pipe(
        switchMap(user => {
          const flowCustomerId = user?.flowCustomerId;
          if (flowCustomerId) {
            return this.flowService.getCustomer(flowCustomerId);
          }
          return of(null);
        }),
        catchError(error => {
          console.error('Error obteniendo información de pago:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (customerResponse) => {
          if (customerResponse) {
            this.cardType.set(customerResponse.creditCardType || '');
            this.cardLastFour.set(customerResponse.last4CardDigits || '');
          }
        }
      });
  }

  toggleChargesHistory(): void {
    if (!this.showChargesHistory() && this.charges().length === 0) {
      this.loadCharges();
    }
    this.showChargesHistory.update(value => !value);
  }

  loadCharges(): void {
    this.isLoadingCharges.set(true);
    this.authService.getCurrentUserObservable()!
      .pipe(
        switchMap(user => {
          const flowCustomerId = user?.flowCustomerId;
          if (flowCustomerId) {
            return this.flowService.getCharges(flowCustomerId, 50);
          }
          return of(null);
        }),
        catchError(error => {
          console.error('Error obteniendo historial de pagos:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (response: FlowChargesResponse | null) => {
          if (response) {
            this.charges.set(response.data.sort((a, b) =>
              new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
            ));
          }
          this.isLoadingCharges.set(false);
        },
        error: (err) => {
          console.error('Error cargando historial de pagos:', err);
          this.isLoadingCharges.set(false);
        }
      });
  }

  /**
   * Devuelve las clases CSS para el estado del cobro
   */
  getChargeStatusClass(status: number): string {
    switch (status) {
      case FlowChargeStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case FlowChargeStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case FlowChargeStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case FlowChargeStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Devuelve el texto descriptivo del estado del cobro
   */
  getChargeStatusText(status: number): string {
    switch (status) {
      case FlowChargeStatus.PENDING:
        return 'Pendiente';
      case FlowChargeStatus.COMPLETED:
        return 'Completado';
      case FlowChargeStatus.REJECTED:
        return 'Rechazado';
      case FlowChargeStatus.CANCELLED:
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  }

  /**
   * Formatea la fecha de solicitud del cobro
   */
  formatChargeDate(dateString: string): string {
    if (!dateString) return 'No disponible';

    const parts = dateString.split(' ');
    if (parts.length !== 2) return dateString;

    const dateParts = parts[0].split('-');
    if (dateParts.length !== 3) return dateString;

    return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]} ${parts[1]}`;
  }

  cancelSubscription(): void {
    // Mostrar el modal de cancelación en lugar de la confirmación directa
    this.showCancellationModal.set(true);
  }

  confirmCancellation(): void {
    if (!this.subscription() || !this.cancellationReason()) return;

    // Ocultar modal de cancelación
    this.showCancellationModal.set(false);
    
    // Si la suscripción está en período de prueba, ir directamente al modal de créditos
    if (this.subscription()!.status === SubscriptionStatusEnum.TRIAL) {
      this.calculateCancellationDates();
      this.showFinalCancelModal.set(true);
      return;
    }

    // Para suscripciones activas, mostrar el modal de pausa
    this.calculatePauseDates();
    this.showPauseModal.set(true);
  }

  calculatePauseDates(): void {
    const now = new Date();
    const graceperiodDays = environment.diasAntesDeSiguienteCobroSubscripcion; // 5 días

    if (!this.subscription()) return;

    // Obtener el día de facturación personal del usuario desde su fecha de inicio
    const subscriptionStartDate = new Date(this.subscription()!.start_date);
    const userBillingDay = new Date(subscriptionStartDate.toLocaleString('en-US', { timeZone: 'America/Lima' })).getDate();

    // Calcular la próxima fecha de facturación del usuario
    let nextBillingMonth = now.getMonth();
    let nextBillingYear = now.getFullYear();

    // Si ya pasó el día de facturación de este mes, la próxima facturación es el próximo mes
    if (now.getDate() > userBillingDay) {
      nextBillingMonth++;
      if (nextBillingMonth > 11) {
        nextBillingMonth = 0;
        nextBillingYear++;
      }
    }

    const nextBillingDate = new Date(nextBillingYear, nextBillingMonth, userBillingDay);

    // Calcular la fecha límite para cancelar sin cargos (5 días antes de facturación)
    const cancelDeadline = new Date(nextBillingDate);
    cancelDeadline.setDate(cancelDeadline.getDate() - graceperiodDays);

    // Determinar si la pausa aplica inmediatamente o después del próximo cobro
    let pauseStartDate: Date;

    if (now <= cancelDeadline) {
      // Estamos dentro del período de gracia, la pausa inicia inmediatamente
      // sin cobro ni entrega del próximo mes
      pauseStartDate = new Date(nextBillingDate);
    } else {
      // Ya pasó el período de gracia, habrá un cobro y entrega más
      // La pausa inicia después del siguiente período de facturación
      pauseStartDate = new Date(nextBillingDate);
      pauseStartDate.setMonth(pauseStartDate.getMonth() + 1);
      if (pauseStartDate.getMonth() === 0 && nextBillingDate.getMonth() === 11) {
        pauseStartDate.setFullYear(pauseStartDate.getFullYear() + 1);
      }
    }

    // Calcular la fecha de fin de pausa (mantiene el día de facturación personal)
    const pauseEndDate = new Date(pauseStartDate);
    pauseEndDate.setMonth(pauseEndDate.getMonth() + this.pauseDurationMonths());
    pauseEndDate.setDate(pauseEndDate.getDate() - 1); // Termina el día anterior al reinicio
    this.pauseEndDate.set(pauseEndDate);
    this.pauseEndDate.set(pauseEndDate);
    // La fecha del próximo pago mantiene el día personal de facturación
    const nextPaymentDate = new Date(pauseStartDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + this.pauseDurationMonths());

    // Formatear las fechas
    const formatOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };

    this.pauseStartDate.set(pauseStartDate.toLocaleDateString('es-ES', formatOptions));
    this.pauseEndDateString.set(pauseEndDate.toLocaleDateString('es-ES', formatOptions));
    this.nextPaymentDateString.set(nextPaymentDate.toLocaleDateString('es-ES', formatOptions));
  }

  updatePauseDuration(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.pauseDurationMonths.set(parseInt(value, 10));
    this.calculatePauseDates();
  }

  pauseSubscription(): void {
    if (!this.subscription()) return;

    this.isLoading.set(true);
    this.showPauseModal.set(false);

    // Añadir información adicional a la solicitud de pausa
    const pauseInfo = {
      reason: this.cancellationReason(),
      durationMonths: this.pauseDurationMonths(),
      startDate: this.pauseStartDate(),
      endDate: this.pauseEndDate()
    };

    // Determinar si la pausa es inmediata o al final del período
    const now = new Date();
    const gracePeriodDays = environment.diasAntesDeSiguienteCobroSubscripcion;
    const subscriptionStartDate = new Date(this.subscription()!.start_date);
    const userBillingDay = subscriptionStartDate.getDate();

    let nextBillingMonth = now.getMonth();
    let nextBillingYear = now.getFullYear();

    if (now.getDate() > userBillingDay) {
      nextBillingMonth++;
      if (nextBillingMonth > 11) {
        nextBillingMonth = 0;
        nextBillingYear++;
      }
    }

    const nextBillingDate = new Date(nextBillingYear, nextBillingMonth, userBillingDay);
    const cancelDeadline = new Date(nextBillingDate);
    cancelDeadline.setDate(cancelDeadline.getDate() - gracePeriodDays);

    // 0 = inmediato, 1 = al final del período
    const atPeriodEnd = now <= cancelDeadline ? AtPeriodEnd.IMMEDIATE : AtPeriodEnd.END_OF_PERIOD;

    // Llamar al servicio existente para pausar la suscripción
    this.subscriptionService.pauseSubscription(
      this.subscription()!.id,
      this.cancellationReason(),
      this.pauseEndDate(),
      this.nextPaymentDate()
    )
      .pipe(
        switchMap((response) => {
          // Si tenemos el Flow subscription ID, cancelar también en Flow
          if (this.flowSubscriptionId()) {
            return this.flowService.cancelSubscription(this.flowSubscriptionId(), atPeriodEnd)
              .pipe(
                map(() => response),
                catchError((flowError) => {
                  console.error('Error cancelando suscripción en Flow:', flowError);
                  // Continuar con la respuesta original aunque falle en Flow
                  return of(response);
                })
              );
          }
          return of(response);
        })
      )
      .subscribe({
        next: (response) => {
          response.data.subscription.credits = 10;
          this.subscription.set(response.data.subscription);
          this.nextPaymentDate.set(new Date(response.data.subscription.next_billing_date || ''));
          this.isLoading.set(false);

          // Registrar la información de pausa para análisis
          console.log('Información de pausa:', pauseInfo);
          this._toastService.success('Éxito', 'Suscripción pausada correctamente');
        },
        error: (err) => {
          this._toastService.error('Ups!', 'Ocurrio un error al pausar la suscripción');
          this.isLoading.set(false);
          console.error('Error pausando suscripción:', err);
        }
      });
  }

  proceedWithCancellation(): void {
    if (!this.subscription()) return;

    this.isLoading.set(false);
    this.showPauseModal.set(false);

    // Mostrar el modal de confirmación final
    this.showFinalCancelModal.set(true);
  }

  closeFinalCancelModal(): void {
    this.showFinalCancelModal.set(false);
  }

  finalConfirmCancellation(): void {
    // Cerrar el modal actual y mostrar el modal de descuento
    this.showFinalCancelModal.set(false);
    if (!this.subscription()?.has_apply_cancel_discount) {
      this.showDiscountModal.set(true);
    } else {
      this.proceedWithFinalCancellation();
    }
  }

  closeDiscountModal(): void {
    this.showDiscountModal.set(false);
  }

  // Método para aceptar el descuento del 50%
  acceptDiscount(): void {
    if (!this.subscription()) return;

    this.isLoading.set(true);

    // 1. Actualizar la suscripción en el backend con el descuento
    this.subscriptionService.updateSubscription(this.subscription()!.id, {
      has_apply_cancel_discount: true,
      discount: this.ENV.cancelDiscout
    }).pipe(
      switchMap((response) => {
        // 2. Cancelar la suscripción actual en Flow si existe
        if (this.flowSubscriptionId()) {
          return this.flowService.cancelSubscription(this.flowSubscriptionId(), AtPeriodEnd.IMMEDIATE)
            .pipe(
              map(() => response),
              catchError((flowError) => {
                console.error('Error cancelando suscripción en Flow:', flowError);
                // Continuar con la creación de nueva suscripción aunque falle la cancelación
                return of(response);
              })
            );
        }
        return of(response);
      }),
      switchMap((response) => {
        // 3. Crear nueva suscripción en Flow con el descuento aplicado
                  const customerId = this.authService.getCurrentUser()?.flowCustomerId;
          if (customerId) {
            const subscriptionStartDate = new Date(this.subscription()!.next_billing_date!);
            const formattedStartDate = this.formatDateToLimaTimezone(subscriptionStartDate);
            const flowSubscriptionData: FlowCreateSubscriptionRequest = {
              planId: this.ENV.flowCreatina250Gr2025PlanId,
              customerId: customerId,
              subscription_start: formattedStartDate,
              couponId: this.ENV.flowCouponId50PercentDiscount
            };

          return this.flowService.createSubscription(flowSubscriptionData)
            .pipe(
              map((flowResponse) => ({ backendResponse: response, flowResponse })),
              catchError((flowError) => {
                console.error('Error creando nueva suscripción en Flow:', flowError);
                // Continuar aunque falle la creación en Flow
                return of({ backendResponse: response, flowResponse: null });
              })
            );
        }
        return of({ backendResponse: response, flowResponse: null });
      }),
      finalize(() => {
        this.isLoading.set(false);
      })
    ).subscribe({
      next: (combinedResponse) => {
        // Actualizar el Flow subscription ID si se creó exitosamente
        if (combinedResponse.flowResponse) {
          this.flowSubscriptionId.set(combinedResponse.flowResponse.subscriptionId);
        }

        // Actualizar la suscripción local con la respuesta del backend
        this.subscription.set(combinedResponse.backendResponse.data.subscription);

        this._toastService.success('¡Excelente!', `¡Has obtenido un ${this.ENV.cancelDiscout}% de descuento en tu próxima creatina!`);
        this.closeDiscountModal();
      },
      error: (err) => {
        console.error('Error aplicando descuento:', err);
        this._toastService.error('Error', 'Error al aplicar el descuento. Por favor, intenta nuevamente.');
      }
    });
  }

  // Método para proceder con la cancelación final
  proceedWithFinalCancellation(): void {
    // Calcular fechas antes de mostrar el modal
    this.calculateCancellationDates();

    // Cerrar el modal de descuento y mostrar el modal de confirmación final
    this.showDiscountModal.set(false);
    this.showFinalConfirmationModal.set(true);
  }

  // Método para calcular las fechas de último pago y última entrega
  calculateCancellationDates(): void {
    const now = new Date();
    const gracePeriodDays = environment.diasAntesDeSiguienteCobroSubscripcion; // 5 días

    if (!this.subscription()) return;

    // Si está en período de prueba, no hay último pago
    if (this.subscription()!.status === SubscriptionStatusEnum.TRIAL) {
      this.lastPaymentDate.set('');
      return;
    }

    // Obtener el día de facturación personal del usuario desde su fecha de inicio
    const subscriptionStartDate = new Date(this.subscription()!.start_date);
    const userBillingDay = subscriptionStartDate.getDate();

    // Calcular la próxima fecha de facturación del usuario
    let nextBillingMonth = now.getMonth();
    let nextBillingYear = now.getFullYear();

    // Si ya pasó el día de facturación de este mes, la próxima facturación es el próximo mes
    if (now.getDate() > userBillingDay) {
      nextBillingMonth++;
      if (nextBillingMonth > 11) {
        nextBillingMonth = 0;
        nextBillingYear++;
      }
    }

    const nextBillingDate = new Date(nextBillingYear, nextBillingMonth, userBillingDay);

    // Calcular la fecha límite para cancelar sin cargos (5 días antes de facturación)
    const cancelDeadline = new Date(nextBillingDate);
    cancelDeadline.setDate(cancelDeadline.getDate() - gracePeriodDays);
    console.log('now', now.toISOString());
    console.log('cancelDeadline', cancelDeadline.toISOString());
    console.log('userBillingDay', userBillingDay);
    console.log('nextBillingMonth', nextBillingMonth);
    console.log('nextBillingYear', nextBillingYear.toString());
    if (now <= cancelDeadline ||
      (now.getDate() == userBillingDay && now.getMonth() == nextBillingMonth && now.getFullYear() == nextBillingYear)
    ) {
      // Estamos dentro del período de gracia - NO habrá último pago ni entrega
      this.lastPaymentDate.set('');
    } else {
      // Ya pasó el período de gracia - SÍ habrá último pago y entrega

      // Último pago: la próxima fecha de facturación personal
      this.lastPaymentDate.set(this.formatDate(nextBillingDate.toISOString()));
    }
  }

  // Método auxiliar para obtener el nombre del mes
  getMonthName(monthIndex: number): string {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return months[monthIndex];
  }

  // Método para cerrar el modal de confirmación final
  closeFinalConfirmationModal(): void {
    this.showFinalConfirmationModal.set(false);
  }

  // Método para continuar como miembro (cerrar todos los modales)
  continueAsMember(): void {
    this.showFinalConfirmationModal.set(false);
    this.showDiscountModal.set(false);
    this.showFinalCancelModal.set(false);
    this.showCancellationModal.set(false);
    this.showPauseModal.set(false);
  }

  // Método para cancelar definitivamente la suscripción
  finallyCancel(): void {
    if (!this.subscription()) return;

    const isTrialPeriod = this.subscription()!.status === SubscriptionStatusEnum.TRIAL;
    const isToCancel = this.lastPaymentDate() != '' && !isTrialPeriod;

    console.log('isToCancel', isToCancel);
    console.log('isTrialPeriod', isTrialPeriod);
    this.subscriptionService.cancelSubscription(this.subscription()!.id, this.cancellationReason(), isToCancel ? this.nextPaymentDate() : undefined)
      .pipe(
        switchMap((response) => {
          // Si tenemos el Flow subscription ID, cancelar también en Flow
          if (this.flowSubscriptionId() && !isToCancel) {
            return this.flowService.cancelSubscription(this.flowSubscriptionId(), AtPeriodEnd.IMMEDIATE)
              .pipe(
                map(() => response),
                catchError((flowError) => {
                  this._toastService.error('Error', 'Error al cancelar la suscripción');
                  this.isLoading.set(false);
                  this.showFinalConfirmationModal.set(false);
                  console.error('Error cancelando suscripción en Flow:', flowError);
                  // Continuar con la respuesta original aunque falle en Flow
                  return of(response);
                })
              );
          }
          return of(response);
        })
      ).subscribe({
        next: (response) => {
          // Actualizar los créditos a 0 ya que se pierden al cancelar
          response.data.subscription.credits = 0;
          this.userCredits.set(response.data.subscription.credits.toString());
          this.subscription.set(response.data.subscription);
          this.isLoading.set(false);
          this.showFinalConfirmationModal.set(false);
          // Mostrar modal de confirmación exitosa
          this.showSuccessCancellationModal.set(true);
        },
        error: (err) => {
          this._toastService.error('Error', 'Error al cancelar la suscripción');
          this.isLoading.set(false);
          this.showFinalConfirmationModal.set(false);
          console.error('Error pausando suscripción:', err);
        }
      });
  }

  // Método para cerrar el modal de confirmación exitosa
  closeSuccessCancellationModal(): void {
    this.showSuccessCancellationModal.set(false);
  }

  /**
   * Convierte una fecha a formato YYYY-MM-DD en zona horaria de Lima
   * @param date Fecha a convertir
   * @returns String en formato YYYY-MM-DD
   */
  private formatDateToLimaTimezone(date: Date): string {
    const limaDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Lima' }));
    const year = limaDate.getFullYear();
    const month = String(limaDate.getMonth() + 1).padStart(2, '0');
    const day = String(limaDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  keepCredits(): void {
    // Cerrar el modal y volver a la pantalla principal
    this.closeFinalCancelModal();
  }

  closeCancellationModal(): void {
    this.showCancellationModal.set(false);
    this.cancellationReason.set('');
  }

  closePauseModal(): void {
    this.showPauseModal.set(false);
    this.showCancellationModal.set(false);
    this.cancellationReason.set('');
    this.pauseDurationMonths.set(1);
  }

  reactivateSubscription(reactivateType: ReactivateType): void {
    if (!this.subscription()) return;

    this.isLoading.set(true);

    // Calcular el próximo pago basado en la fecha personal de facturación
    const now = new Date();
    const subscriptionStartDate = new Date(this.subscription()!.start_date);
    const userBillingDay = subscriptionStartDate.getDate()

    let nextBillingMonth = now.getMonth();
    let nextBillingYear = now.getFullYear();

    // La próxima facturación será el próximo mes en el día personal del usuario
    nextBillingMonth++;
    if (nextBillingMonth > 11) {
      nextBillingMonth = 0;
      nextBillingYear++;
    }

    //PAUSA
    let nextPaymentDate: Date | undefined = new Date(now.getFullYear(), now.getMonth(), userBillingDay, now.getHours(), now.getMinutes(), now.getSeconds());

    let sumaMes = 1;
    let startDatePAUSE: Date = new Date();
    if (now > nextPaymentDate!) {
      startDatePAUSE = new Date(now.toLocaleString('en-US', { timeZone: 'America/Lima' }));
    } else {
      startDatePAUSE = new Date(nextPaymentDate!.toLocaleString('en-US', { timeZone: 'America/Lima' }));
      sumaMes = 0;
    }

    //CANCELACIÓN
    if (reactivateType === ReactivateType.FROM_CANCELLATION) {
      const currentDate = new Date();
      nextPaymentDate = new Date(
        nextBillingYear,
        nextBillingMonth,
        currentDate.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      );
    }
    // POR CANCELAR
    if (reactivateType === ReactivateType.FROM_TO_CANCEL) {
      nextPaymentDate = undefined;
    }

    this.subscriptionService.reactivateSubscription(this.subscription()!.id,
      reactivateType === ReactivateType.FROM_PAUSE ?
        new Date(now.getFullYear(), now.getMonth() + sumaMes, startDatePAUSE.getDate(), now.getHours(), now.getMinutes(), now.getSeconds())
        : nextPaymentDate)
      .pipe(
        switchMap((response) => {
          // Crear suscripción en Flow después de reactivar en backend
          const customerId = this.authService.getCurrentUser()?.flowCustomerId;
          if (customerId && reactivateType !== ReactivateType.FROM_TO_CANCEL) {

            let flowSubscriptionData: FlowCreateSubscriptionRequest = <FlowCreateSubscriptionRequest>{};

            if (reactivateType == ReactivateType.FROM_CANCELLATION) {
              flowSubscriptionData = {
                planId: environment.flowCreatina250Gr2025PlanId,
                customerId: customerId,
                subscription_start: this.formatDateToLimaTimezone(now), // Formato YYYY-MM-DD en hora peruana
              };
            }
            else if (reactivateType == ReactivateType.FROM_PAUSE) {

              flowSubscriptionData = {
                planId: environment.flowCreatina250Gr2025PlanId,
                customerId: customerId,
                subscription_start: this.formatDateToLimaTimezone(startDatePAUSE), // Formato YYYY-MM-DD en hora peruana
              };
            };

            return this.flowService.createSubscription(flowSubscriptionData)
              .pipe(
                map((flowResponse) => ({ backendResponse: response, flowResponse })),
                catchError((flowError) => {
                  console.error('Error creando suscripción en Flow:', flowError);
                  // Continuar con la respuesta del backend aunque falle en Flow
                  return of({ backendResponse: response, flowResponse: null });
                })
              );
          }

          return of({ backendResponse: response, flowResponse: null });
        })
      )
      .subscribe({
        next: (combinedResponse) => {
          const response = combinedResponse.backendResponse;

          // Actualizar el Flow subscription ID si se creó exitosamente
          if (combinedResponse.flowResponse) {
            this.flowSubscriptionId.set(combinedResponse.flowResponse.subscriptionId);
          }
          this.nextPaymentDate.set(new Date(response.data.subscription.next_billing_date || ''));
          let credits = '10'
          if (response.data.subscription.status === SubscriptionStatusEnum.PAUSED) {
            credits = this.userCredits()
          }
          this.userCredits.set(credits);
          this.subscription.set(response.data.subscription);
          this.isLoading.set(false);

          // Calcular los meses de entrega y pago dinámicamente
          const fechaActual = new Date();
          const mesActual = fechaActual.getMonth();
          const diaActual = fechaActual.getDate();

          // Determinar mes de entrega y mes de pago
          let mesEntrega: number;
          let mesPago: number;


          mesEntrega = (mesActual + 1) % 12;
          mesPago = mesActual;


          // Obtener nombres de los meses en español
          const nombresMeses = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
          ];

          const mesEntregaNombre = nombresMeses[mesEntrega];
          const mesPagoNombre = nombresMeses[mesPago];

          // Mostrar modal de confirmación con los meses calculados
          this.showReactivationModal.set(true);
          this.reactivationMessage.set(
            `¡Bienvenido de nuevo! A partir de ahora, tu suscripción ` +
            `está activa nuevamente. `
            // +`Puedes esperar tu próxima entrega en ${mesEntregaNombre}.`
          );
        },
        error: (err) => {
          this._toastService.error('Error', 'Error al reactivar la suscripción');
          this.isLoading.set(false);
          console.error('Error reactivando suscripción:', err);
        }
      });
  }

  closeReactivationModal(): void {
    this.showReactivationModal.set(false);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getStatusClass(status: SubscriptionStatusEnum): string {
    switch (status) {
      case SubscriptionStatusEnum.ACTIVE:
        return 'bg-green-100 text-green-800';
      case SubscriptionStatusEnum.PAUSED:
        return 'bg-yellow-100 text-yellow-800';
      case SubscriptionStatusEnum.CANCELLED:
        return 'bg-red-100 text-red-800';
      case SubscriptionStatusEnum.TRIAL:
        return 'bg-blue-100 text-blue-800';
      case SubscriptionStatusEnum.EXPIRED:
        return 'bg-gray-100 text-gray-800';
      case SubscriptionStatusEnum.TO_CANCEL:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getDotClass(status: SubscriptionStatusEnum): string {
    switch (status) {
      case SubscriptionStatusEnum.ACTIVE:
        return 'bg-green-500';
      case SubscriptionStatusEnum.PAUSED:
        return 'bg-yellow-500';
      case SubscriptionStatusEnum.CANCELLED:
        return 'bg-red-500';
      case SubscriptionStatusEnum.TRIAL:
        return 'bg-blue-500';
      case SubscriptionStatusEnum.EXPIRED:
        return 'bg-gray-500';
      case SubscriptionStatusEnum.TO_CANCEL:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  get DotClass(): string {
    switch (this.subscription()!.status) {
      case SubscriptionStatusEnum.ACTIVE:
        return 'bg-green-500';
      case SubscriptionStatusEnum.PAUSED:
        return 'bg-yellow-500';
      case SubscriptionStatusEnum.CANCELLED:
        return 'bg-red-500';
      case SubscriptionStatusEnum.TRIAL:
        return 'bg-blue-500';
      case SubscriptionStatusEnum.EXPIRED:
        return 'bg-gray-500';
      case SubscriptionStatusEnum.TO_CANCEL:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  getStatusText(status: SubscriptionStatusEnum): string {
    switch (status) {
      case SubscriptionStatusEnum.ACTIVE:
        return 'Activa';
      case SubscriptionStatusEnum.PAUSED:
        return 'Pausada';
      case SubscriptionStatusEnum.CANCELLED:
        return 'Cancelada';
      case SubscriptionStatusEnum.TRIAL:
        return 'Periodo de prueba';
      case SubscriptionStatusEnum.EXPIRED:
        return 'Expirada';
      case SubscriptionStatusEnum.TO_CANCEL:
        return 'Por Cancelar';
      default:
        return 'Desconocido';
    }
  }

  getPeriodText(period?: string): string {
    if (!period) return '';

    switch (period.toLowerCase()) {
      case 'monthly':
        return 'mensual';
      case 'quarterly':
        return 'trimestral';
      case 'semiannual':
        return 'semestral';
      case 'yearly':
      case 'annual':
        return 'anual';
      default:
        return period;
    }
  }

  getCardSvg(): SafeHtml {
    const type = this.cardType().toUpperCase();
    let svgHtml = '';

    switch (type) {
      case 'VISA':
        svgHtml = ` <svg width="32px" height="32px" viewBox="0 -140 780 780" enable-background="new 0 0 780 500" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><rect width="780" height="500" fill="#0E4595"></rect><path d="m293.2 348.73l33.361-195.76h53.36l-33.385 195.76h-53.336zm246.11-191.54c-10.57-3.966-27.137-8.222-47.822-8.222-52.725 0-89.865 26.55-90.18 64.603-0.299 28.13 26.514 43.822 46.752 53.186 20.771 9.595 27.752 15.714 27.654 24.283-0.131 13.121-16.586 19.116-31.922 19.116-21.357 0-32.703-2.967-50.227-10.276l-6.876-3.11-7.489 43.823c12.463 5.464 35.51 10.198 59.438 10.443 56.09 0 92.5-26.246 92.916-66.882 0.199-22.269-14.016-39.216-44.801-53.188-18.65-9.055-30.072-15.099-29.951-24.268 0-8.137 9.668-16.839 30.557-16.839 17.449-0.27 30.09 3.535 39.938 7.5l4.781 2.26 7.232-42.429m137.31-4.223h-41.232c-12.773 0-22.332 3.487-27.941 16.234l-79.244 179.4h56.031s9.16-24.123 11.232-29.418c6.125 0 60.555 0.084 68.338 0.084 1.596 6.853 6.49 29.334 6.49 29.334h49.514l-43.188-195.64zm-65.418 126.41c4.412-11.279 21.26-54.723 21.26-54.723-0.316 0.522 4.379-11.334 7.074-18.684l3.605 16.879s10.219 46.729 12.354 56.528h-44.293zm-363.3-126.41l-52.24 133.5-5.567-27.13c-9.725-31.273-40.025-65.155-73.898-82.118l47.766 171.2 56.456-0.064 84.004-195.39h-56.521" fill="#ffffff"></path><path d="m146.92 152.96h-86.041l-0.681 4.073c66.938 16.204 111.23 55.363 129.62 102.41l-18.71-89.96c-3.23-12.395-12.597-16.094-24.186-16.527" fill="#F2AE14"></path></g></svg>`;
        break;
      case 'MASTERCARD':
        svgHtml = `<svg width="32px" height="32px" viewBox="0 -140 780 780" enable-background="new 0 0 780 500" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><rect width="780" height="500" fill="#16366F"></rect><path d="m449.01 250c0 99.143-80.37 179.5-179.51 179.5s-179.5-80.361-179.5-179.5c0-99.133 80.362-179.5 179.5-179.5 99.137 0 179.51 80.37 179.51 179.5" fill="#D9222A"></path><path d="m510.49 70.496c-46.38 0-88.643 17.596-120.5 46.466-6.49 5.889-12.548 12.237-18.125 18.996h36.266c4.966 6.037 9.536 12.388 13.685 19.013h-63.635c-3.827 6.121-7.28 12.469-10.341 19.008h84.312c2.893 6.185 5.431 12.53 7.6 19.004h-99.512c-2.091 6.235-3.832 12.581-5.217 19.009h109.94c2.689 12.49 4.044 25.231 4.041 38.008 0 19.934-3.254 39.113-9.254 57.02h-99.512c2.164 6.479 4.7 12.825 7.595 19.01h84.317c-3.064 6.54-6.52 12.889-10.347 19.013h-63.625c4.154 6.629 8.73 12.979 13.685 18.996h36.258c-5.57 6.772-11.63 13.126-18.13 19.012 31.86 28.867 74.118 46.454 120.5 46.454 99.138-1e-3 179.51-80.362 179.51-179.5 0-99.13-80.37-179.5-179.51-179.5" fill="#EE9F2D"></path><path d="m666.08 350.06c0-3.201 2.592-5.801 5.796-5.801s5.796 2.6 5.796 5.801c0 3.199-2.592 5.799-5.796 5.799-3.202-1e-3 -5.797-2.598-5.796-5.799zm5.796 4.408c2.435-1e-3 4.407-1.975 4.408-4.408 0-2.433-1.972-4.404-4.404-4.404h-4e-3c-2.429-4e-3 -4.4 1.963-4.404 4.392v0.013c-3e-3 2.432 1.967 4.406 4.399 4.408 1e-3 -1e-3 3e-3 -1e-3 5e-3 -1e-3zm-0.783-1.86h-1.188v-5.094h2.149c0.45 0 0.908 0 1.305 0.254 0.413 0.278 0.646 0.77 0.646 1.278 0 0.57-0.337 1.104-0.883 1.312l0.937 2.25h-1.315l-0.78-2.016h-0.87v2.016h-1e-3zm0-2.89h0.658c0.246 0 0.504 0.02 0.725-0.1 0.196-0.125 0.296-0.359 0.296-0.584 0-0.195-0.12-0.42-0.288-0.516-0.207-0.131-0.536-0.101-0.758-0.101h-0.633v1.301zm-443.5-80.063c-2.045-0.237-2.945-0.301-4.35-0.301-11.045 0-16.637 3.789-16.637 11.268 0 4.611 2.73 7.546 6.987 7.546 7.938 0 13.659-7.56 14-18.513zm14.171 32.996h-16.146l0.371-7.676c-4.925 6.067-11.496 8.95-20.425 8.95-10.562 0-17.804-8.25-17.804-20.229 0-18.024 12.596-28.54 34.217-28.54 2.208 0 5.041 0.2 7.941 0.569 0.605-2.441 0.763-3.486 0.763-4.8 0-4.908-3.396-6.738-12.5-6.738-9.533-0.108-17.396 2.271-20.625 3.334 0.204-1.23 2.7-16.658 2.7-16.658 9.712-2.846 16.117-3.917 23.325-3.917 16.733 0 25.596 7.512 25.58 21.712 0.032 3.805-0.597 8.5-1.58 14.671-1.692 10.731-5.32 33.718-5.817 39.322zm-62.158 0h-19.488l11.163-69.997-24.925 69.997h-13.28l-1.64-69.597-11.734 69.597h-18.242l15.238-91.054h28.02l1.7 50.966 17.092-50.966h31.167l-15.071 91.054m354.98-32.996c-2.037-0.237-2.942-0.301-4.342-0.301-11.041 0-16.634 3.789-16.634 11.268 0 4.611 2.726 7.546 6.983 7.546 7.939 0 13.664-7.56 13.993-18.513zm14.183 32.996h-16.145l0.365-7.676c-4.925 6.067-11.5 8.95-20.42 8.95-10.566 0-17.8-8.25-17.8-20.229 0-18.024 12.587-28.54 34.212-28.54 2.208 0 5.037 0.2 7.934 0.569 0.604-2.441 0.763-3.486 0.763-4.8 0-4.908-3.392-6.738-12.496-6.738-9.533-0.108-17.388 2.271-20.63 3.334 0.205-1.23 2.709-16.658 2.709-16.658 9.713-2.846 16.113-3.917 23.312-3.917 16.741 0 25.604 7.518 25.588 21.712 0.032 3.805-0.597 8.5-1.58 14.671-1.682 10.731-5.32 33.718-5.812 39.322zm-220.39-1.125c-5.334 1.68-9.492 2.399-14 2.399-9.963 0-15.4-5.725-15.4-16.267-0.142-3.27 1.433-11.879 2.67-19.737 1.125-6.917 8.45-50.53 8.45-50.53h19.371l-2.262 11.209h11.7l-2.643 17.796h-11.742c-2.25 14.083-5.454 31.625-5.491 33.95 0 3.817 2.037 5.483 6.67 5.483 2.221 0 3.941-0.226 5.255-0.7l-2.578 16.397m59.391-0.6c-6.654 2.033-13.075 3.017-19.879 3-21.683-0.021-32.987-11.346-32.987-33.032 0-25.313 14.38-43.947 33.9-43.947 15.97 0 26.17 10.433 26.17 26.796 0 5.429-0.7 10.729-2.387 18.212h-38.575c-1.304 10.742 5.57 15.217 16.837 15.217 6.935 0 13.188-1.43 20.142-4.663l-3.221 18.417zm-10.887-43.9c0.107-1.543 2.054-13.217-9.013-13.217-6.171 0-10.583 4.704-12.38 13.217h21.393zm-123.42-5.017c0 9.367 4.541 15.825 14.841 20.676 7.892 3.709 9.113 4.809 9.113 8.17 0 4.617-3.48 6.7-11.192 6.7-5.812 0-11.22-0.907-17.458-2.92 0 0-2.563 16.32-2.68 17.101 4.43 0.966 8.38 1.861 20.28 2.19 20.562 0 30.058-7.829 30.058-24.75 0-10.175-3.975-16.146-13.737-20.633-8.171-3.75-9.109-4.588-9.109-8.046 0-4.004 3.238-6.046 9.538-6.046 3.825 0 9.05 0.408 14 1.113l2.775-17.175c-5.046-0.8-12.696-1.442-17.15-1.442-21.8 0-29.346 11.387-29.279 25.062m229.09-23.116c5.413 0 10.459 1.42 17.413 4.92l3.187-19.762c-2.854-1.12-12.904-7.7-21.416-7.7-13.042 0-24.066 6.47-31.82 17.15-11.31-3.746-15.959 3.825-21.659 11.367l-5.062 1.179c0.383-2.483 0.73-4.95 0.613-7.446h-17.896c-2.445 22.917-6.779 46.13-10.171 69.075l-0.884 4.976h19.496c3.254-21.143 5.038-34.681 6.121-43.842l7.342-4.084c1.096-4.08 4.529-5.458 11.416-5.292-0.926 5.008-1.389 10.09-1.383 15.184 0 24.225 13.071 39.308 34.05 39.308 5.404 0 10.042-0.712 17.221-2.657l3.431-20.76c-6.46 3.18-11.761 4.676-16.561 4.676-11.328 0-18.183-8.362-18.183-22.184-1e-3 -20.05 10.195-34.108 24.745-34.108"></path><path d="m185.21 297.24h-19.491l11.17-69.988-24.925 69.988h-13.282l-1.642-69.588-11.733 69.588h-18.243l15.238-91.042h28.02l0.788 56.362 18.904-56.362h30.267l-15.071 91.042" fill="#ffffff"></path><path d="m647.52 211.6l-4.319 26.308c-5.33-7.012-11.054-12.087-18.612-12.087-9.834 0-18.784 7.454-24.642 18.425-8.158-1.692-16.597-4.563-16.597-4.563l-4e-3 0.067c0.658-6.133 0.92-9.875 0.862-11.146h-17.9c-2.437 22.917-6.77 46.13-10.157 69.075l-0.893 4.976h19.492c2.633-17.097 4.65-31.293 6.133-42.551 6.659-6.017 9.992-11.267 16.721-10.917-2.979 7.206-4.725 15.504-4.725 24.017 0 18.513 9.367 30.725 23.534 30.725 7.141 0 12.62-2.462 17.966-8.17l-0.912 6.884h18.433l14.842-91.043h-19.222zm-24.37 73.942c-6.634 0-9.983-4.909-9.983-14.597 0-14.553 6.271-24.875 15.112-24.875 6.695 0 10.32 5.104 10.32 14.508 1e-3 14.681-6.369 24.964-15.449 24.964z"></path><path d="m233.19 264.26c-2.042-0.236-2.946-0.3-4.346-0.3-11.046 0-16.634 3.788-16.634 11.267 0 4.604 2.73 7.547 6.98 7.547 7.945-1e-3 13.666-7.559 14-18.514zm14.179 32.984h-16.146l0.367-7.663c-4.921 6.054-11.5 8.95-20.421 8.95-10.567 0-17.804-8.25-17.804-20.229 0-18.032 12.591-28.542 34.216-28.542 2.209 0 5.042 0.2 7.938 0.571 0.604-2.442 0.762-3.487 0.762-4.808 0-4.908-3.391-6.73-12.496-6.73-9.537-0.108-17.395 2.272-20.629 3.322 0.204-1.226 2.7-16.638 2.7-16.638 9.709-2.858 16.121-3.93 23.321-3.93 16.738 0 25.604 7.518 25.588 21.705 0.029 3.82-0.605 8.512-1.584 14.675-1.687 10.725-5.32 33.725-5.812 39.317zm261.38-88.592l-3.192 19.767c-6.95-3.496-12-4.921-17.407-4.921-14.551 0-24.75 14.058-24.75 34.107 0 13.821 6.857 22.181 18.183 22.181 4.8 0 10.096-1.492 16.554-4.677l-3.42 20.75c-7.184 1.959-11.816 2.672-17.226 2.672-20.976 0-34.05-15.084-34.05-39.309 0-32.55 18.059-55.3 43.888-55.3 8.507 1e-3 18.562 3.609 21.42 4.73m31.442 55.608c-2.041-0.236-2.941-0.3-4.346-0.3-11.042 0-16.634 3.788-16.634 11.267 0 4.604 2.729 7.547 6.984 7.547 7.937-1e-3 13.662-7.559 13.996-18.514zm14.179 32.984h-16.15l0.37-7.663c-4.924 6.054-11.5 8.95-20.42 8.95-10.563 0-17.804-8.25-17.804-20.229 0-18.032 12.595-28.542 34.212-28.542 2.213 0 5.042 0.2 7.941 0.571 0.601-2.442 0.763-3.487 0.763-4.808 0-4.908-3.392-6.73-12.496-6.73-9.533-0.108-17.396 2.272-20.629 3.322 0.204-1.226 2.704-16.638 2.704-16.638 9.709-2.858 16.116-3.93 23.316-3.93 16.742 0 25.604 7.518 25.583 21.705 0.034 3.82-0.595 8.512-1.579 14.675-1.682 10.725-5.324 33.725-5.811 39.317zm-220.39-1.122c-5.338 1.68-9.496 2.409-14 2.409-9.963 0-15.4-5.726-15.4-16.266-0.138-3.281 1.437-11.881 2.675-19.738 1.12-6.926 8.446-50.533 8.446-50.533h19.367l-2.259 11.212h9.942l-2.646 17.788h-9.975c-2.25 14.091-5.463 31.619-5.496 33.949 0 3.83 2.042 5.483 6.671 5.483 2.22 0 3.938-0.217 5.254-0.692l-2.579 16.388m59.392-0.591c-6.65 2.033-13.08 3.013-19.88 3-21.684-0.021-32.987-11.346-32.987-33.033 0-25.321 14.38-43.95 33.9-43.95 15.97 0 26.17 10.429 26.17 26.8 0 5.433-0.7 10.733-2.382 18.212h-38.575c-1.306 10.741 5.569 15.221 16.837 15.221 6.93 0 13.188-1.434 20.137-4.676l-3.22 18.426zm-10.892-43.912c0.117-1.538 2.059-13.217-9.013-13.217-6.166 0-10.579 4.717-12.375 13.217h21.388zm-123.42-5.004c0 9.365 4.542 15.816 14.842 20.675 7.891 3.708 9.112 4.812 9.112 8.17 0 4.617-3.483 6.7-11.187 6.7-5.817 0-11.225-0.908-17.467-2.92 0 0-2.554 16.32-2.67 17.1 4.42 0.967 8.374 1.85 20.274 2.191 20.567 0 30.059-7.829 30.059-24.746 0-10.18-3.971-16.15-13.738-20.637-8.167-3.758-9.112-4.583-9.112-8.046 0-4 3.245-6.058 9.541-6.058 3.821 0 9.046 0.42 14.004 1.125l2.771-17.18c-5.041-0.8-12.691-1.441-17.146-1.441-21.804 0-29.345 11.379-29.283 25.067m398.45 50.629h-18.437l0.917-6.893c-5.347 5.717-10.825 8.18-17.967 8.18-14.168 0-23.53-12.213-23.53-30.725 0-24.63 14.521-45.393 31.709-45.393 7.558 0 13.28 3.088 18.604 10.096l4.325-26.308h19.221l-14.842 91.043zm-28.745-17.109c9.075 0 15.45-10.283 15.45-24.953 0-9.405-3.63-14.509-10.325-14.509-8.838 0-15.116 10.317-15.116 24.875-1e-3 9.686 3.357 14.587 9.991 14.587zm-56.843-56.929c-2.439 22.917-6.773 46.13-10.162 69.063l-0.891 4.975h19.491c6.971-45.275 8.658-54.117 19.588-53.009 1.742-9.266 4.982-17.383 7.399-21.479-8.163-1.7-12.721 2.913-18.688 11.675 0.471-3.787 1.334-7.466 1.163-11.225h-17.9m-160.42 0c-2.446 22.917-6.78 46.13-10.167 69.063l-0.887 4.975h19.5c6.962-45.275 8.646-54.117 19.569-53.009 1.75-9.266 4.992-17.383 7.4-21.479-8.154-1.7-12.716 2.913-18.678 11.675 0.47-3.787 1.325-7.466 1.162-11.225h-17.899m254.57 68.242c0-3.214 2.596-5.8 5.796-5.8 3.197-3e-3 5.792 2.587 5.795 5.785v0.015c-1e-3 3.2-2.595 5.794-5.795 5.796-3.2-2e-3 -5.794-2.596-5.796-5.796zm5.796 4.404c2.432 1e-3 4.403-1.97 4.403-4.401v-2e-3c3e-3 -2.433-1.968-4.406-4.399-4.408h-4e-3c-2.435 1e-3 -4.408 1.974-4.409 4.408 3e-3 2.432 1.976 4.403 4.409 4.403zm-0.784-1.87h-1.188v-5.084h2.154c0.446 0 0.908 8e-3 1.296 0.254 0.416 0.283 0.654 0.767 0.654 1.274 0 0.575-0.338 1.113-0.888 1.317l0.941 2.236h-1.319l-0.78-2.008h-0.87v2.008 3e-3zm0-2.88h0.654c0.245 0 0.513 0.018 0.729-0.1 0.195-0.125 0.295-0.361 0.295-0.587-9e-3 -0.21-0.115-0.404-0.287-0.524-0.204-0.117-0.542-0.085-0.763-0.085h-0.629v1.296h1e-3z" fill="#ffffff"></path></g></svg>`;
        break;
      case 'AMEX':
      case 'AMERICAN EXPRESS':
        svgHtml = `<svg width="32px" height="32px"  viewBox="0 -140 780 780" enable-background="new 0 0 780 500" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><rect width="780" height="500" fill="#2557D6"></rect><path d="m0.253 235.69h37.441l8.442-19.51h18.9l8.42 19.51h73.668v-14.915l6.576 14.98h38.243l6.576-15.202v15.138h183.08l-0.085-32.026h3.542c2.479 0.083 3.204 0.302 3.204 4.226v27.8h94.689v-7.455c7.639 3.92 19.518 7.455 35.148 7.455h39.836l8.525-19.51h18.9l8.337 19.51h76.765v-18.532l11.626 18.532h61.515v-122.51h-60.88v14.468l-8.522-14.468h-62.471v14.468l-7.828-14.468h-84.38c-14.123 0-26.539 1.889-36.569 7.153v-7.153h-58.229v7.153c-6.383-5.426-15.079-7.153-24.75-7.153h-212.74l-14.274 31.641-14.659-31.641h-67.005v14.468l-7.362-14.468h-57.145l-26.539 58.246v64.261h3e-3zm236.34-17.67h-22.464l-0.083-68.794-31.775 68.793h-19.24l-31.858-68.854v68.854h-44.57l-8.42-19.592h-45.627l-8.505 19.592h-23.801l39.241-87.837h32.559l37.269 83.164v-83.164h35.766l28.678 59.587 26.344-59.587h36.485l1e-3 87.838zm-165.9-37.823l-14.998-35.017-14.915 35.017h29.913zm255.3 37.821h-73.203v-87.837h73.203v18.291h-51.289v15.833h50.06v18.005h-50.061v17.542h51.289l1e-3 18.166zm103.16-64.18c0 14.004-9.755 21.24-15.439 23.412 4.794 1.748 8.891 4.838 10.84 7.397 3.094 4.369 3.628 8.271 3.628 16.116v17.255h-22.104l-0.083-11.077c0-5.285 0.528-12.886-3.458-17.112-3.202-3.09-8.083-3.76-15.973-3.76h-23.523v31.95h-21.914v-87.838h50.401c11.199 0 19.451 0.283 26.535 4.207 6.933 3.924 11.09 9.652 11.09 19.45zm-27.699 13.042c-3.013 1.752-6.573 1.81-10.841 1.81h-26.62v-19.51h26.982c3.818 0 7.804 0.164 10.393 1.584 2.842 1.28 4.601 4.003 4.601 7.765 0 3.84-1.674 6.929-4.515 8.351zm62.844 51.138h-22.358v-87.837h22.358v87.837zm259.56 0h-31.053l-41.535-65.927v65.927h-44.628l-8.527-19.592h-45.521l-8.271 19.592h-25.648c-10.649 0-24.138-2.257-31.773-9.715-7.701-7.458-11.708-17.56-11.708-33.533 0-13.027 2.395-24.936 11.812-34.347 7.085-7.01 18.18-10.242 33.28-10.242h21.215v18.821h-20.771c-7.997 0-12.514 1.14-16.862 5.203-3.735 3.699-6.298 10.69-6.298 19.897 0 9.41 1.951 16.196 6.023 20.628 3.373 3.476 9.506 4.53 15.272 4.53h9.842l30.884-69.076h32.835l37.102 83.081v-83.08h33.366l38.519 61.174v-61.174h22.445v87.833zm-133.2-37.82l-15.165-35.017-15.081 35.017h30.246zm189.04 178.08c-5.322 7.457-15.694 11.238-29.736 11.238h-42.319v-18.84h42.147c4.181 0 7.106-0.527 8.868-2.175 1.665-1.474 2.605-3.554 2.591-5.729 0-2.561-1.064-4.593-2.677-5.811-1.59-1.342-3.904-1.95-7.722-1.95-20.574-0.67-46.244 0.608-46.244-27.194 0-12.742 8.443-26.156 31.439-26.156h43.649v-17.479h-40.557c-12.237 0-21.129 2.81-27.425 7.174v-7.175h-59.985c-9.595 0-20.854 2.279-26.179 7.175v-7.175h-107.12v7.175c-8.524-5.892-22.908-7.175-29.549-7.175h-70.656v7.175c-6.745-6.258-21.742-7.175-30.886-7.175h-79.077l-18.094 18.764-16.949-18.764h-118.13v122.59h115.9l18.646-19.062 17.565 19.062 71.442 0.061v-28.838h7.021c9.479 0.14 20.66-0.228 30.523-4.312v33.085h58.928v-31.952h2.842c3.628 0 3.985 0.144 3.985 3.615v28.333h179.01c11.364 0 23.244-2.786 29.824-7.845v7.845h56.78c11.815 0 23.354-1.587 32.134-5.649l2e-3 -22.84zm-354.94-47.155c0 24.406-19.005 29.445-38.159 29.445h-27.343v29.469h-42.591l-26.984-29.086-28.042 29.086h-86.802v-87.859h88.135l26.961 28.799 27.875-28.799h70.021c17.389 0 36.929 4.613 36.929 28.945zm-174.22 40.434h-53.878v-17.48h48.11v-17.926h-48.11v-15.974h54.939l23.969 25.604-25.03 25.776zm86.81 10.06l-33.644-35.789 33.644-34.65v70.439zm49.757-39.066h-28.318v-22.374h28.572c7.912 0 13.404 3.09 13.404 10.772 0 7.599-5.238 11.602-13.658 11.602zm148.36-40.373h73.138v18.17h-51.315v15.973h50.062v17.926h-50.062v17.48l51.314 0.08v18.23h-73.139l2e-3 -87.859zm-28.119 47.029c4.878 1.725 8.865 4.816 10.734 7.375 3.095 4.291 3.542 8.294 3.631 16.037v17.418h-22.002v-10.992c0-5.286 0.531-13.112-3.542-17.198-3.201-3.147-8.083-3.899-16.076-3.899h-23.42v32.09h-22.02v-87.859h50.594c11.093 0 19.173 0.47 26.366 4.146 6.915 4.004 11.266 9.487 11.266 19.511-1e-3 14.022-9.764 21.178-15.531 23.371zm-12.385-11.107c-2.932 1.667-6.556 1.811-10.818 1.811h-26.622v-19.732h26.982c3.902 0 7.807 0.08 10.458 1.587 2.84 1.423 4.538 4.146 4.538 7.903 0 3.758-1.699 6.786-4.538 8.431zm197.82 5.597c4.27 4.229 6.554 9.571 6.554 18.613 0 18.9-12.322 27.723-34.425 27.723h-42.68v-18.84h42.51c4.157 0 7.104-0.525 8.95-2.175 1.508-1.358 2.589-3.333 2.589-5.729 0-2.561-1.17-4.592-2.675-5.811-1.675-1.34-3.986-1.949-7.803-1.949-20.493-0.67-46.157 0.609-46.157-27.192 0-12.744 8.355-26.158 31.33-26.158h43.932v18.7h-40.198c-3.984 0-6.575 0.145-8.779 1.587-2.4 1.422-3.29 3.534-3.29 6.319 0 3.314 2.037 5.57 4.795 6.546 2.311 0.77 4.795 0.995 8.526 0.995l11.797 0.306c11.895 0.276 20.061 2.248 25.024 7.065zm86.955-23.52h-39.938c-3.986 0-6.638 0.144-8.867 1.587-2.312 1.423-3.202 3.534-3.202 6.322 0 3.314 1.951 5.568 4.791 6.544 2.312 0.771 4.795 0.996 8.444 0.996l11.878 0.304c11.983 0.284 19.982 2.258 24.86 7.072 0.891 0.67 1.422 1.422 2.033 2.175v-25h1e-3z" fill="#ffffff"></path></g></svg>`;
        break;
      case 'DINERS':
      case 'DINERS CLUB':
        svgHtml = `<svg width="32px" height="32px" viewBox="0 -140 780 780" enable-background="new 0 0 780 500" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><rect width="780" height="500" fill="#0079BE"></rect><path d="m599.93 251.45c0-99.415-82.98-168.13-173.9-168.1h-78.242c-92.003-0.033-167.73 68.705-167.73 168.1 0 90.93 75.727 165.64 167.73 165.2h78.242c90.914 0.436 173.9-74.294 173.9-165.2z" fill="#ffffff"></path><path d="m348.28 97.43c-84.07 0.027-152.19 68.308-152.21 152.58 0.02 84.258 68.144 152.53 152.21 152.56 84.09-0.027 152.23-68.303 152.24-152.56-0.011-84.272-68.149-152.55-152.24-152.58z" fill="#0079BE"></path><path d="m252.07 249.6c0.08-41.181 25.746-76.297 61.94-90.25v180.48c-36.194-13.948-61.861-49.045-61.94-90.23zm131 90.274v-180.53c36.207 13.92 61.914 49.057 61.979 90.257-0.065 41.212-25.772 76.322-61.979 90.269z" fill="#ffffff"></path></g></svg>`;
        break;
      default:
        svgHtml = `<svg width="32px" height="32px" viewBox="0 -140 780 780" enable-background="new 0 0 780 500" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><rect width="780" height="500" fill="#000C9D"></rect><path d="m686.85 324.72v-3.795h5.117v-11.272h4.198l0.401 11.271h11.443l-10.58-25.07 3.967-1.727 11.674 27.141v3.451h-16.446v9.658h-4.658v-9.658h-5.116v1e-3zm-19.586-30.59c4.026 0 7.878 1.379 11.213 4.6l-2.587 2.932c-2.645-2.473-5.003-3.68-8.395-3.68-4.198 0-7.533 2.357-7.533 6.727 0 4.773 3.738 6.959 7.533 6.959h2.356l0.575 3.795h-3.335c-4.657 0-8.222 1.84-8.222 7.531 0 4.945 3.276 8.109 8.854 8.109 3.221 0 6.556-1.324 8.797-3.969l3.221 2.645c-2.99 3.68-7.705 5.234-12.133 5.234-8.164 0-13.742-5.176-13.742-12.02 0-6.15 4.37-9.371 9.027-9.717-4.197-0.805-7.763-4.428-7.763-9.199 2e-3 -5.404 4.717-9.947 12.134-9.947zm-34.477 0c5.348 0 8.913 1.896 12.075 5.691l-3.335 2.531c-2.53-2.934-4.657-4.199-8.567-4.199-4.428 0-7.073 2.76-7.073 7.189 0 6.496 3.22 10.809 18.17 25.127v3.908h-23.517l-0.575-4.08h18.63c-13.053-11.904-17.71-17.826-17.71-25.07 0-6.326 4.427-11.097 11.902-11.097zm-48.737 36.34h8.28v-35.65h4.197l11.729 7.244-2.07 3.393-9.085-5.463v30.477h9.775v3.908h-22.827v-3.909zm-69.588-5.75v-3.795h5.117v-11.272h4.198l0.401 11.271h11.443l-10.58-25.07 3.967-1.727 11.673 27.141v3.451h-16.444v9.658h-4.658v-9.658h-5.117v1e-3zm-19.585-30.59c4.025 0 7.877 1.379 11.212 4.6l-2.587 2.932c-2.646-2.473-5.003-3.68-8.395-3.68-4.198 0-7.533 2.357-7.533 6.727 0 4.773 3.738 6.959 7.533 6.959h2.357l0.575 3.795h-3.335c-4.657 0-8.222 1.84-8.222 7.531 0 4.945 3.277 8.109 8.855 8.109 3.22 0 6.555-1.324 8.797-3.969l3.22 2.645c-2.989 3.68-7.704 5.234-12.132 5.234-8.165 0-13.743-5.176-13.743-12.02 0-6.15 4.37-9.371 9.028-9.717-4.198-0.805-7.763-4.428-7.763-9.199 1e-3 -5.404 4.716-9.947 12.134-9.947zm-34.478 0c5.349 0 8.913 1.896 12.075 5.691l-3.335 2.531c-2.529-2.934-4.657-4.199-8.566-4.199-4.429 0-7.073 2.76-7.073 7.189 0 6.496 3.22 10.809 18.17 25.127v3.908h-23.517l-0.575-4.08h18.63c-13.053-11.904-17.71-17.826-17.71-25.07-1e-3 -6.326 4.426-11.097 11.901-11.097zm-48.737 36.34h8.279v-35.65h4.197l11.73 7.244-2.07 3.393-9.085-5.463v30.477h9.775v3.908h-22.827v-3.909zm-69.588-5.75v-3.795h5.118v-11.272h4.196l0.403 11.271h11.442l-10.58-25.07 3.968-1.727 11.672 27.141v3.451h-16.445v9.658h-4.657v-9.658h-5.117zm-19.585-30.59c4.024 0 7.878 1.379 11.213 4.6l-2.588 2.932c-2.646-2.473-5.002-3.68-8.396-3.68-4.197 0-7.532 2.357-7.532 6.727 0 4.773 3.737 6.959 7.532 6.959h2.358l0.575 3.795h-3.335c-4.658 0-8.224 1.84-8.224 7.531 0 4.945 3.278 8.109 8.855 8.109 3.22 0 6.555-1.324 8.798-3.969l3.22 2.645c-2.99 3.68-7.705 5.234-12.133 5.234-8.165 0-13.742-5.176-13.742-12.02 0-6.15 4.37-9.371 9.027-9.717-4.197-0.805-7.762-4.428-7.762-9.199 0-5.404 4.717-9.947 12.134-9.947zm-34.477 0c5.347 0 8.912 1.896 12.075 5.691l-3.335 2.531c-2.53-2.934-4.657-4.199-8.567-4.199-4.428 0-7.073 2.76-7.073 7.189 0 6.496 3.22 10.809 18.17 25.127v3.908h-23.517l-0.575-4.08h18.63c-13.053-11.904-17.71-17.826-17.71-25.07 0-6.326 4.428-11.097 11.903-11.097zm-48.738 36.34h8.28v-35.65h4.198l11.73 7.244-2.07 3.393-9.085-5.463v30.477h9.775v3.908h-22.828v-3.909zm-69.587-5.75v-3.795h5.117v-11.272h4.198l0.402 11.271h11.443l-10.58-25.07 3.967-1.727 11.673 27.141v3.451h-16.445v9.658h-4.658v-9.658h-5.117zm-19.585-30.59c4.025 0 7.877 1.379 11.212 4.6l-2.587 2.932c-2.645-2.473-5.003-3.68-8.395-3.68-4.198 0-7.533 2.357-7.533 6.727 0 4.773 3.738 6.959 7.533 6.959h2.357l0.575 3.795h-3.335c-4.657 0-8.222 1.84-8.222 7.531 0 4.945 3.277 8.109 8.855 8.109 3.22 0 6.555-1.324 8.797-3.969l3.22 2.645c-2.99 3.68-7.705 5.234-12.132 5.234-8.165 0-13.743-5.176-13.743-12.02 0-6.15 4.37-9.371 9.028-9.717-4.198-0.805-7.763-4.428-7.763-9.199 0-5.404 4.715-9.947 12.133-9.947zm-34.478 0c5.348 0 8.913 1.896 12.075 5.691l-3.335 2.531c-2.53-2.934-4.657-4.199-8.567-4.199-4.428 0-7.073 2.76-7.073 7.189 0 6.496 3.22 10.809 18.17 25.127v3.908h-23.517l-0.575-4.08h18.63c-13.053-11.904-17.71-17.826-17.71-25.07 0-6.326 4.427-11.097 11.902-11.097zm-48.738 36.34h8.28v-35.65h4.198l11.73 7.244-2.07 3.393-9.085-5.463v30.477h9.775v3.908h-22.828v-3.909zm-69.587-5.75v-3.795h5.117v-11.272h4.198l0.402 11.271h11.443l-10.58-25.07 3.967-1.727 11.673 27.141v3.451h-16.445v9.658h-4.658v-9.658h-5.117zm-19.585-30.59c4.025 0 7.877 1.379 11.212 4.6l-2.587 2.932c-2.645-2.473-5.003-3.68-8.395-3.68-4.198 0-7.533 2.357-7.533 6.727 0 4.773 3.738 6.959 7.533 6.959h2.357l0.575 3.795h-3.335c-4.657 0-8.222 1.84-8.222 7.531 0 4.945 3.277 8.109 8.855 8.109 3.22 0 6.555-1.324 8.797-3.969l3.22 2.645c-2.99 3.68-7.705 5.234-12.132 5.234-8.165 0-13.743-5.176-13.743-12.02 0-6.15 4.37-9.371 9.028-9.717-4.198-0.805-7.763-4.428-7.763-9.199 0-5.404 4.715-9.947 12.133-9.947zm-34.478 0c5.348 0 8.913 1.896 12.075 5.691l-3.335 2.531c-2.53-2.934-4.657-4.199-8.567-4.199-4.428 0-7.073 2.76-7.073 7.189 0 6.496 3.22 10.809 18.17 25.127v3.908h-23.517l-0.575-4.08h18.63c-13.053-11.904-17.71-17.826-17.71-25.07 0-6.326 4.427-11.097 11.902-11.097zm-48.738 36.34h8.28v-35.65h4.198l11.73 7.244-2.07 3.393-9.085-5.463v30.477h9.775v3.908h-22.828v-3.909z" fill="#ffffff" fill-opacity=".196"></path><path d="m709.39 429.77h-6.444v-22.244l7.012 1.406v-3.596l-6.973-1.404h-3.945v25.84h-6.446v3.32h16.797v-3.322zm-25.468 0h-6.446v-22.244l7.013 1.406v-3.596l-6.974-1.404h-3.944v25.84h-6.445v3.32h16.797v-3.322zm-40.918 0h-13.77v3.322h18.516v-3.32c-1.497-1.549-3.535-3.627-6.114-6.23-2.59-2.617-4.218-4.305-4.882-5.061-1.264-1.418-2.143-2.615-2.637-3.592-0.508-0.99-0.763-1.959-0.763-2.91 0-1.549 0.547-2.812 1.641-3.791 1.081-0.977 2.494-1.463 4.24-1.463 1.236 0 2.545 0.215 3.925 0.645 1.366 0.43 2.831 1.08 4.394 1.953v-3.986c-1.588-0.637-3.072-1.119-4.453-1.443-1.38-0.326-2.643-0.488-3.789-0.488-3.021 0-5.429 0.754-7.226 2.264-1.797 1.512-2.696 3.529-2.696 6.057 0 1.197 0.229 2.336 0.685 3.418 0.442 1.068 1.256 2.33 2.44 3.789 0.326 0.377 1.361 1.471 3.106 3.281 1.744 1.797 4.206 4.316 7.383 7.559v-4e-3zm-34.024-12.401c-1.889 0.402-3.359 1.244-4.414 2.52-1.067 1.275-1.602 2.852-1.602 4.727 0 2.877 0.989 5.104 2.968 6.68s4.792 2.363 8.438 2.363c1.224 0 2.487-0.125 3.789-0.373 1.288-0.232 2.623-0.592 4.004-1.072v-3.81c-1.094 0.639-2.291 1.119-3.594 1.445-1.302 0.324-2.663 0.488-4.082 0.488-2.475 0-4.355-0.488-5.646-1.465-1.302-0.977-1.953-2.396-1.953-4.258 0-1.719 0.606-3.061 1.817-4.023 1.198-0.977 2.871-1.465 5.021-1.465h3.397v-3.242h-3.555c-1.94 0-3.425-0.385-4.453-1.152-1.028-0.781-1.543-1.902-1.543-3.359 0-1.498 0.533-2.645 1.601-3.438 1.056-0.809 2.572-1.211 4.552-1.211 1.08 0 2.239 0.117 3.477 0.352 1.236 0.234 2.598 0.598 4.082 1.092v-3.514c-1.497-0.418-2.897-0.73-4.2-0.938-1.314-0.209-2.551-0.312-3.71-0.312-2.995 0-5.364 0.684-7.11 2.049-1.744 1.355-2.616 3.191-2.616 5.51 0 1.613 0.462 2.98 1.387 4.102 0.925 1.105 2.239 1.875 3.945 2.304zm-26.289-13.437h-15.488v3.318h11.875v7.15c-0.573-0.195-1.146-0.34-1.719-0.43-0.573-0.105-1.146-0.156-1.72-0.156-3.255 0-5.833 0.893-7.733 2.676-1.901 1.783-2.853 4.199-2.853 7.246 0 3.139 0.977 5.578 2.931 7.324 1.953 1.732 4.707 2.598 8.262 2.598 1.224 0 2.474-0.104 3.75-0.312 1.263-0.209 2.571-0.521 3.926-0.938v-3.965c-1.172 0.639-2.383 1.113-3.633 1.426s-2.571 0.469-3.965 0.469c-2.253 0-4.037-0.594-5.353-1.777-1.314-1.186-1.972-2.793-1.972-4.824s0.657-3.641 1.972-4.826c1.315-1.184 3.1-1.775 5.353-1.775 1.055 0 2.109 0.117 3.164 0.352 1.041 0.234 2.108 0.598 3.203 1.092v-14.648zm-33.867 15.312c1.875 0 3.353 0.5 4.434 1.504 1.067 1.002 1.602 2.383 1.602 4.141s-0.534 3.137-1.603 4.139c-1.08 1.004-2.558 1.506-4.433 1.506s-3.354-0.502-4.435-1.504c-1.079-1.016-1.619-2.396-1.619-4.141 0-1.758 0.54-3.139 1.619-4.141 1.069-1.004 2.547-1.504 4.435-1.504zm3.945-1.679c1.692-0.418 3.015-1.205 3.965-2.363 0.938-1.16 1.405-2.572 1.405-4.238 0-2.332-0.826-4.174-2.479-5.527-1.667-1.355-3.945-2.031-6.836-2.031-2.904 0-5.183 0.676-6.836 2.029-1.653 1.355-2.48 3.197-2.48 5.529 0 1.666 0.476 3.078 1.426 4.238 0.938 1.158 2.246 1.945 3.926 2.363-1.901 0.441-3.379 1.309-4.435 2.596-1.067 1.291-1.601 2.865-1.601 4.729 0 2.824 0.866 4.992 2.598 6.504 1.719 1.51 4.187 2.266 7.402 2.266s5.69-0.756 7.422-2.266c1.719-1.512 2.578-3.68 2.578-6.504 0-1.863-0.534-3.438-1.603-4.729-1.066-1.288-2.55-2.155-4.452-2.596zm1.446-6.231c0 1.51-0.469 2.688-1.407 3.535-0.95 0.846-2.278 1.27-3.983 1.27-1.693 0-3.015-0.424-3.965-1.27-0.964-0.848-1.445-2.025-1.445-3.535 0-1.512 0.481-2.689 1.445-3.535 0.95-0.848 2.272-1.271 3.965-1.271 1.706 0 3.034 0.424 3.983 1.271 0.938 0.846 1.407 2.023 1.407 3.535z" fill="#ffffff" fill-opacity=".196"></path><path d="m456.16 428.8h-6.445v-22.246l7.012 1.406v-3.594l-6.973-1.406h-3.946v25.84h-6.444v3.32h16.797v-3.32h-1e-3zm-36.738-12.403c-1.888 0.404-3.359 1.244-4.415 2.52-1.067 1.275-1.601 2.852-1.601 4.727 0 2.877 0.989 5.105 2.969 6.68 1.979 1.576 4.791 2.363 8.438 2.363 1.224 0 2.487-0.123 3.79-0.371 1.288-0.234 2.622-0.592 4.003-1.074v-3.809c-1.094 0.639-2.292 1.121-3.595 1.445-1.302 0.326-2.662 0.488-4.082 0.488-2.473 0-4.354-0.488-5.644-1.465-1.302-0.977-1.953-2.395-1.953-4.258 0-1.719 0.605-3.059 1.816-4.023 1.197-0.977 2.871-1.465 5.02-1.465h3.398v-3.242h-3.556c-1.939 0-3.424-0.385-4.453-1.152-1.028-0.781-1.543-1.9-1.543-3.359 0-1.496 0.534-2.643 1.603-3.438 1.055-0.807 2.571-1.209 4.55-1.209 1.081 0 2.24 0.115 3.478 0.35 1.236 0.234 2.598 0.6 4.081 1.094v-3.516c-1.497-0.416-2.896-0.729-4.198-0.938-1.315-0.209-2.553-0.312-3.71-0.312-2.996 0-5.365 0.684-7.11 2.051-1.744 1.354-2.617 3.191-2.617 5.508 0 1.615 0.462 2.982 1.386 4.102 0.923 1.106 2.239 1.874 3.945 2.303zm-16.915 12.403h-13.77v3.32h18.517v-3.32c-1.498-1.549-3.536-3.625-6.114-6.23-2.59-2.617-4.218-4.303-4.883-5.059-1.263-1.418-2.142-2.617-2.636-3.594-0.508-0.988-0.762-1.959-0.762-2.91 0-1.549 0.547-2.812 1.64-3.789 1.081-0.977 2.494-1.465 4.239-1.465 1.236 0 2.545 0.215 3.926 0.645 1.367 0.43 2.831 1.08 4.395 1.953v-3.984c-1.589-0.637-3.073-1.119-4.453-1.445s-2.644-0.488-3.789-0.488c-3.021 0-5.43 0.756-7.227 2.266s-2.695 3.529-2.695 6.055c0 1.197 0.228 2.338 0.684 3.418 0.442 1.068 1.256 2.332 2.441 3.791 0.325 0.377 1.36 1.471 3.105 3.279 1.745 1.797 4.205 4.316 7.382 7.561v-4e-3zm-22.753 0h-6.446v-22.246l7.013 1.406v-3.594l-6.974-1.406h-3.944v25.84h-6.445v3.32h16.797v-3.32h-1e-3zm-49.473-12.403c-1.888 0.404-3.359 1.244-4.414 2.52-1.068 1.275-1.603 2.852-1.603 4.727 0 2.877 0.99 5.105 2.97 6.68 1.979 1.576 4.792 2.363 8.438 2.363 1.224 0 2.486-0.123 3.789-0.371 1.289-0.234 2.623-0.592 4.004-1.074v-3.809c-1.094 0.639-2.292 1.121-3.594 1.445-1.302 0.326-2.663 0.488-4.082 0.488-2.474 0-4.355-0.488-5.645-1.465-1.303-0.977-1.953-2.395-1.953-4.258 0-1.719 0.605-3.059 1.815-4.023 1.198-0.977 2.872-1.465 5.021-1.465h3.397v-3.242h-3.554c-1.94 0-3.424-0.385-4.453-1.152-1.028-0.781-1.543-1.9-1.543-3.359 0-1.496 0.534-2.643 1.602-3.438 1.055-0.807 2.571-1.209 4.551-1.209 1.08 0 2.239 0.115 3.477 0.35s2.598 0.6 4.082 1.094v-3.516c-1.497-0.416-2.897-0.729-4.2-0.938-1.314-0.209-2.551-0.312-3.71-0.312-2.995 0-5.365 0.684-7.109 2.051-1.745 1.354-2.617 3.191-2.617 5.508 0 1.615 0.462 2.982 1.387 4.102 0.923 1.106 2.238 1.874 3.944 2.303zm-24.355-10l9.96 15.566h-9.96v-15.566zm1.035-3.437h-4.961v19.004h-4.16v3.281h4.16v6.875h3.925v-6.875h13.165v-3.809l-12.129-18.476zm-15.704 0h-15.488v3.32h11.875v7.148c-0.573-0.195-1.146-0.338-1.719-0.43-0.573-0.104-1.146-0.156-1.718-0.156-3.255 0-5.833 0.893-7.735 2.676-1.901 1.785-2.851 4.199-2.851 7.246 0 3.139 0.977 5.58 2.93 7.324 1.953 1.732 4.707 2.598 8.261 2.598 1.224 0 2.474-0.104 3.75-0.312 1.263-0.207 2.572-0.52 3.926-0.938v-3.965c-1.172 0.639-2.383 1.113-3.633 1.426s-2.572 0.469-3.965 0.469c-2.253 0-4.037-0.592-5.351-1.777-1.315-1.184-1.973-2.793-1.973-4.824s0.658-3.639 1.973-4.824c1.314-1.186 3.098-1.777 5.351-1.777 1.055 0 2.109 0.117 3.164 0.352 1.042 0.234 2.109 0.6 3.203 1.094v-14.65zm-33.867 15.312c1.875 0 3.353 0.5 4.434 1.504 1.067 1.002 1.602 2.383 1.602 4.141s-0.534 3.137-1.603 4.139c-1.08 1.004-2.558 1.506-4.433 1.506s-3.354-0.502-4.435-1.504c-1.079-1.016-1.619-2.396-1.619-4.141 0-1.758 0.54-3.139 1.619-4.141 1.069-1.004 2.547-1.504 4.435-1.504zm3.945-1.679c1.692-0.418 3.015-1.205 3.965-2.363 0.938-1.16 1.405-2.572 1.405-4.238 0-2.332-0.826-4.174-2.479-5.527-1.667-1.355-3.945-2.031-6.836-2.031-2.904 0-5.183 0.676-6.836 2.029-1.653 1.355-2.48 3.197-2.48 5.529 0 1.666 0.476 3.078 1.426 4.238 0.938 1.158 2.246 1.945 3.926 2.363-1.901 0.441-3.379 1.309-4.435 2.596-1.067 1.291-1.601 2.865-1.601 4.729 0 2.824 0.866 4.992 2.598 6.504 1.719 1.51 4.187 2.266 7.402 2.266s5.69-0.756 7.422-2.266c1.719-1.512 2.578-3.68 2.578-6.504 0-1.863-0.534-3.438-1.603-4.729-1.066-1.288-2.55-2.155-4.452-2.596zm1.446-6.231c0 1.51-0.469 2.688-1.407 3.535-0.95 0.846-2.278 1.27-3.983 1.27-1.693 0-3.015-0.424-3.965-1.27-0.964-0.848-1.445-2.025-1.445-3.535 0-1.512 0.481-2.689 1.445-3.535 0.95-0.848 2.272-1.271 3.965-1.271 1.706 0 3.034 0.424 3.983 1.271 0.938 0.846 1.407 2.023 1.407 3.535z" fill="#ffffff" fill-opacity=".196"></path><path d="m456.16 428.8h-6.445v-22.246l7.012 1.406v-3.594l-6.973-1.406h-3.946v25.84h-6.444v3.32h16.797v-3.32h-1e-3zm-36.738-12.403c-1.888 0.404-3.359 1.244-4.415 2.52-1.067 1.275-1.601 2.852-1.601 4.727 0 2.877 0.989 5.105 2.969 6.68 1.979 1.576 4.791 2.363 8.438 2.363 1.224 0 2.487-0.123 3.79-0.371 1.288-0.234 2.622-0.592 4.003-1.074v-3.809c-1.094 0.639-2.292 1.121-3.595 1.445-1.302 0.326-2.662 0.488-4.082 0.488-2.473 0-4.354-0.488-5.644-1.465-1.302-0.977-1.953-2.395-1.953-4.258 0-1.719 0.605-3.059 1.816-4.023 1.197-0.977 2.871-1.465 5.02-1.465h3.398v-3.242h-3.556c-1.939 0-3.424-0.385-4.453-1.152-1.028-0.781-1.543-1.9-1.543-3.359 0-1.496 0.534-2.643 1.603-3.438 1.055-0.807 2.571-1.209 4.55-1.209 1.081 0 2.24 0.115 3.478 0.35 1.236 0.234 2.598 0.6 4.081 1.094v-3.516c-1.497-0.416-2.896-0.729-4.198-0.938-1.315-0.209-2.553-0.312-3.71-0.312-2.996 0-5.365 0.684-7.11 2.051-1.744 1.354-2.617 3.191-2.617 5.508 0 1.615 0.462 2.982 1.386 4.102 0.923 1.106 2.239 1.874 3.945 2.303zm-16.915 12.403h-13.77v3.32h18.517v-3.32c-1.498-1.549-3.536-3.625-6.114-6.23-2.59-2.617-4.218-4.303-4.883-5.059-1.263-1.418-2.142-2.617-2.636-3.594-0.508-0.988-0.762-1.959-0.762-2.91 0-1.549 0.547-2.812 1.64-3.789 1.081-0.977 2.494-1.465 4.239-1.465 1.236 0 2.545 0.215 3.926 0.645 1.367 0.43 2.831 1.08 4.395 1.953v-3.984c-1.589-0.637-3.073-1.119-4.453-1.445s-2.644-0.488-3.789-0.488c-3.021 0-5.43 0.756-7.227 2.266s-2.695 3.529-2.695 6.055c0 1.197 0.228 2.338 0.684 3.418 0.442 1.068 1.256 2.332 2.441 3.791 0.325 0.377 1.36 1.471 3.105 3.279 1.745 1.797 4.205 4.316 7.382 7.561v-4e-3zm-22.753 0h-6.446v-22.246l7.013 1.406v-3.594l-6.974-1.406h-3.944v25.84h-6.445v3.32h16.797v-3.32h-1e-3zm-49.473-12.403c-1.888 0.404-3.359 1.244-4.414 2.52-1.068 1.275-1.603 2.852-1.603 4.727 0 2.877 0.99 5.105 2.97 6.68 1.979 1.576 4.792 2.363 8.438 2.363 1.224 0 2.486-0.123 3.789-0.371 1.289-0.234 2.623-0.592 4.004-1.074v-3.809c-1.094 0.639-2.292 1.121-3.594 1.445-1.302 0.326-2.663 0.488-4.082 0.488-2.474 0-4.355-0.488-5.645-1.465-1.303-0.977-1.953-2.395-1.953-4.258 0-1.719 0.605-3.059 1.815-4.023 1.198-0.977 2.872-1.465 5.021-1.465h3.397v-3.242h-3.554c-1.94 0-3.424-0.385-4.453-1.152-1.028-0.781-1.543-1.9-1.543-3.359 0-1.496 0.534-2.643 1.602-3.438 1.055-0.807 2.571-1.209 4.551-1.209 1.08 0 2.239 0.115 3.477 0.35s2.598 0.6 4.082 1.094v-3.516c-1.497-0.416-2.897-0.729-4.2-0.938-1.314-0.209-2.551-0.312-3.71-0.312-2.995 0-5.365 0.684-7.109 2.051-1.745 1.354-2.617 3.191-2.617 5.508 0 1.615 0.462 2.982 1.387 4.102 0.923 1.106 2.238 1.874 3.944 2.303zm-24.355-10l9.96 15.566h-9.96v-15.566zm1.035-3.437h-4.961v19.004h-4.16v3.281h4.16v6.875h3.925v-6.875h13.165v-3.809l-12.129-18.476zm-15.704 0h-15.488v3.32h11.875v7.148c-0.573-0.195-1.146-0.338-1.719-0.43-0.573-0.104-1.146-0.156-1.718-0.156-3.255 0-5.833 0.893-7.735 2.676-1.901 1.785-2.851 4.199-2.851 7.246 0 3.139 0.977 5.58 2.93 7.324 1.953 1.732 4.707 2.598 8.261 2.598 1.224 0 2.474-0.104 3.75-0.312 1.263-0.207 2.572-0.52 3.926-0.938v-3.965c-1.172 0.639-2.383 1.113-3.633 1.426s-2.572 0.469-3.965 0.469c-2.253 0-4.037-0.592-5.351-1.777-1.315-1.184-1.973-2.793-1.973-4.824s0.658-3.639 1.973-4.824c1.314-1.186 3.098-1.777 5.351-1.777 1.055 0 2.109 0.117 3.164 0.352 1.042 0.234 2.109 0.6 3.203 1.094v-14.65zm-33.867 15.312c1.875 0 3.353 0.5 4.434 1.504 1.067 1.002 1.602 2.383 1.602 4.141s-0.534 3.137-1.603 4.139c-1.08 1.004-2.558 1.506-4.433 1.506s-3.354-0.502-4.435-1.504c-1.079-1.016-1.619-2.396-1.619-4.141 0-1.758 0.54-3.139 1.619-4.141 1.069-1.004 2.547-1.504 4.435-1.504zm3.945-1.679c1.692-0.418 3.015-1.205 3.965-2.363 0.938-1.16 1.405-2.572 1.405-4.238 0-2.332-0.826-4.174-2.479-5.527-1.667-1.355-3.945-2.031-6.836-2.031-2.904 0-5.183 0.676-6.836 2.029-1.653 1.355-2.48 3.197-2.48 5.529 0 1.666 0.476 3.078 1.426 4.238 0.938 1.158 2.246 1.945 3.926 2.363-1.901 0.441-3.379 1.309-4.435 2.596-1.067 1.291-1.601 2.865-1.601 4.729 0 2.824 0.866 4.992 2.598 6.504 1.719 1.51 4.187 2.266 7.402 2.266s5.69-0.756 7.422-2.266c1.719-1.512 2.578-3.68 2.578-6.504 0-1.863-0.534-3.438-1.603-4.729-1.066-1.288-2.55-2.155-4.452-2.596zm1.446-6.231c0 1.51-0.469 2.688-1.407 3.535-0.95 0.846-2.278 1.27-3.983 1.27-1.693 0-3.015-0.424-3.965-1.27-0.964-0.848-1.445-2.025-1.445-3.535 0-1.512 0.481-2.689 1.445-3.535 0.95-0.848 2.272-1.271 3.965-1.271 1.706 0 3.034 0.424 3.983 1.271 0.938 0.846 1.407 2.023 1.407 3.535z" fill="#ffffff" fill-opacity=".196"></path><path d="m456.16 428.8h-6.445v-22.246l7.012 1.406v-3.594l-6.973-1.406h-3.946v25.84h-6.444v3.32h16.797v-3.32h-1e-3zm-36.738-12.403c-1.888 0.404-3.359 1.244-4.415 2.52-1.067 1.275-1.601 2.852-1.601 4.727 0 2.877 0.989 5.105 2.969 6.68 1.979 1.576 4.791 2.363 8.438 2.363 1.224 0 2.487-0.123 3.79-0.371 1.288-0.234 2.622-0.592 4.003-1.074v-3.809c-1.094 0.639-2.292 1.121-3.595 1.445-1.302 0.326-2.662 0.488-4.082 0.488-2.473 0-4.354-0.488-5.644-1.465-1.302-0.977-1.953-2.395-1.953-4.258 0-1.719 0.605-3.059 1.816-4.023 1.197-0.977 2.871-1.465 5.02-1.465h3.398v-3.242h-3.556c-1.939 0-3.424-0.385-4.453-1.152-1.028-0.781-1.543-1.9-1.543-3.359 0-1.496 0.534-2.643 1.603-3.438 1.055-0.807 2.571-1.209 4.55-1.209 1.081 0 2.24 0.115 3.478 0.35 1.236 0.234 2.598 0.6 4.081 1.094v-3.516c-1.497-0.416-2.896-0.729-4.198-0.938-1.315-0.209-2.553-0.312-3.71-0.312-2.996 0-5.365 0.684-7.11 2.051-1.744 1.354-2.617 3.191-2.617 5.508 0 1.615 0.462 2.982 1.386 4.102 0.923 1.106 2.239 1.874 3.945 2.303zm-16.915 12.403h-13.77v3.32h18.517v-3.32c-1.498-1.549-3.536-3.625-6.114-6.23-2.59-2.617-4.218-4.303-4.883-5.059-1.263-1.418-2.142-2.617-2.636-3.594-0.508-0.988-0.762-1.959-0.762-2.91 0-1.549 0.547-2.812 1.64-3.789 1.081-0.977 2.494-1.465 4.239-1.465 1.236 0 2.545 0.215 3.926 0.645 1.367 0.43 2.831 1.08 4.395 1.953v-3.984c-1.589-0.637-3.073-1.119-4.453-1.445s-2.644-0.488-3.789-0.488c-3.021 0-5.43 0.756-7.227 2.266s-2.695 3.529-2.695 6.055c0 1.197 0.228 2.338 0.684 3.418 0.442 1.068 1.256 2.332 2.441 3.791 0.325 0.377 1.36 1.471 3.105 3.279 1.745 1.797 4.205 4.316 7.382 7.561v-4e-3zm-22.753 0h-6.446v-22.246l7.013 1.406v-3.594l-6.974-1.406h-3.944v25.84h-6.445v3.32h16.797v-3.32h-1e-3zm-49.473-12.403c-1.888 0.404-3.359 1.244-4.414 2.52-1.068 1.275-1.603 2.852-1.603 4.727 0 2.877 0.99 5.105 2.97 6.68 1.979 1.576 4.792 2.363 8.438 2.363 1.224 0 2.486-0.123 3.789-0.371 1.289-0.234 2.623-0.592 4.004-1.074v-3.809c-1.094 0.639-2.292 1.121-3.594 1.445-1.302 0.326-2.663 0.488-4.082 0.488-2.474 0-4.355-0.488-5.645-1.465-1.303-0.977-1.953-2.395-1.953-4.258 0-1.719 0.605-3.059 1.815-4.023 1.198-0.977 2.872-1.465 5.021-1.465h3.397v-3.242h-3.554c-1.94 0-3.424-0.385-4.453-1.152-1.028-0.781-1.543-1.9-1.543-3.359 0-1.496 0.534-2.643 1.602-3.438 1.055-0.807 2.571-1.209 4.551-1.209 1.08 0 2.239 0.115 3.477 0.35s2.598 0.6 4.082 1.094v-3.516c-1.497-0.416-2.897-0.729-4.2-0.938-1.314-0.209-2.551-0.312-3.71-0.312-2.995 0-5.365 0.684-7.109 2.051-1.745 1.354-2.617 3.191-2.617 5.508 0 1.615 0.462 2.982 1.387 4.102 0.923 1.106 2.238 1.874 3.944 2.303zm-24.355-10l9.96 15.566h-9.96v-15.566zm1.035-3.437h-4.961v19.004h-4.16v3.281h4.16v6.875h3.925v-6.875h13.165v-3.809l-12.129-18.476zm-15.704 0h-15.488v3.32h11.875v7.148c-0.573-0.195-1.146-0.338-1.719-0.43-0.573-0.104-1.146-0.156-1.718-0.156-3.255 0-5.833 0.893-7.735 2.676-1.901 1.785-2.851 4.199-2.851 7.246 0 3.139 0.977 5.58 2.93 7.324 1.953 1.732 4.707 2.598 8.261 2.598 1.224 0 2.474-0.104 3.75-0.312 1.263-0.207 2.572-0.52 3.926-0.938v-3.965c-1.172 0.639-2.383 1.113-3.633 1.426s-2.572 0.469-3.965 0.469c-2.253 0-4.037-0.592-5.351-1.777-1.315-1.184-1.973-2.793-1.973-4.824s0.658-3.639 1.973-4.824c1.314-1.186 3.098-1.777 5.351-1.777 1.055 0 2.109 0.117 3.164 0.352 1.042 0.234 2.109 0.6 3.203 1.094v-14.65zm-33.867 15.312c1.875 0 3.353 0.5 4.434 1.504 1.067 1.002 1.602 2.383 1.602 4.141s-0.534 3.137-1.603 4.139c-1.08 1.004-2.558 1.506-4.433 1.506s-3.354-0.502-4.435-1.504c-1.079-1.016-1.619-2.396-1.619-4.141 0-1.758 0.54-3.139 1.619-4.141 1.069-1.004 2.547-1.504 4.435-1.504zm3.945-1.679c1.692-0.418 3.015-1.205 3.965-2.363 0.938-1.16 1.405-2.572 1.405-4.238 0-2.332-0.826-4.174-2.479-5.527-1.667-1.355-3.945-2.031-6.836-2.031-2.904 0-5.183 0.676-6.836 2.029-1.653 1.355-2.48 3.197-2.48 5.529 0 1.666 0.476 3.078 1.426 4.238 0.938 1.158 2.246 1.945 3.926 2.363-1.901 0.441-3.379 1.309-4.435 2.596-1.067 1.291-1.601 2.865-1.601 4.729 0 2.824 0.866 4.992 2.598 6.504 1.719 1.51 4.187 2.266 7.402 2.266s5.69-0.756 7.422-2.266c1.719-1.512 2.578-3.68 2.578-6.504 0-1.863-0.534-3.438-1.603-4.729-1.066-1.288-2.55-2.155-4.452-2.596zm1.446-6.231c0 1.51-0.469 2.688-1.407 3.535-0.95 0.846-2.278 1.27-3.983 1.27-1.693 0-3.015-0.424-3.965-1.27-0.964-0.848-1.445-2.025-1.445-3.535 0-1.512 0.481-2.689 1.445-3.535 0.95-0.848 2.272-1.271 3.965-1.271 1.706 0 3.034 0.424 3.983 1.271 0.938 0.846 1.407 2.023 1.407 3.535z" fill="#ffffff" fill-opacity=".196"></path><path d="m456.16 428.8h-6.445v-22.246l7.012 1.406v-3.594l-6.973-1.406h-3.946v25.84h-6.444v3.32h16.797v-3.32h-1e-3zm-36.738-12.403c-1.888 0.404-3.359 1.244-4.415 2.52-1.067 1.275-1.601 2.852-1.601 4.727 0 2.877 0.989 5.105 2.969 6.68 1.979 1.576 4.791 2.363 8.438 2.363 1.224 0 2.487-0.123 3.79-0.371 1.288-0.234 2.622-0.592 4.003-1.074v-3.809c-1.094 0.639-2.292 1.121-3.595 1.445-1.302 0.326-2.662 0.488-4.082 0.488-2.473 0-4.354-0.488-5.644-1.465-1.302-0.977-1.953-2.395-1.953-4.258 0-1.719 0.605-3.059 1.816-4.023 1.197-0.977 2.871-1.465 5.02-1.465h3.398v-3.242h-3.556c-1.939 0-3.424-0.385-4.453-1.152-1.028-0.781-1.543-1.9-1.543-3.359 0-1.496 0.534-2.643 1.603-3.438 1.055-0.807 2.571-1.209 4.55-1.209 1.081 0 2.24 0.115 3.478 0.35 1.236 0.234 2.598 0.6 4.081 1.094v-3.516c-1.497-0.416-2.896-0.729-4.198-0.938-1.315-0.209-2.553-0.312-3.71-0.312-2.996 0-5.365 0.684-7.11 2.051-1.744 1.354-2.617 3.191-2.617 5.508 0 1.615 0.462 2.982 1.386 4.102 0.923 1.106 2.239 1.874 3.945 2.303zm-16.915 12.403h-13.77v3.32h18.517v-3.32c-1.498-1.549-3.536-3.625-6.114-6.23-2.59-2.617-4.218-4.303-4.883-5.059-1.263-1.418-2.142-2.617-2.636-3.594-0.508-0.988-0.762-1.959-0.762-2.91 0-1.549 0.547-2.812 1.64-3.789 1.081-0.977 2.494-1.465 4.239-1.465 1.236 0 2.545 0.215 3.926 0.645 1.367 0.43 2.831 1.08 4.395 1.953v-3.984c-1.589-0.637-3.073-1.119-4.453-1.445s-2.644-0.488-3.789-0.488c-3.021 0-5.43 0.756-7.227 2.266s-2.695 3.529-2.695 6.055c0 1.197 0.228 2.338 0.684 3.418 0.442 1.068 1.256 2.332 2.441 3.791 0.325 0.377 1.36 1.471 3.105 3.279 1.745 1.797 4.205 4.316 7.382 7.561v-4e-3zm-22.753 0h-6.446v-22.246l7.013 1.406v-3.594l-6.974-1.406h-3.944v25.84h-6.445v3.32h16.797v-3.32h-1e-3zm-49.473-12.403c-1.888 0.404-3.359 1.244-4.414 2.52-1.068 1.275-1.603 2.852-1.603 4.727 0 2.877 0.99 5.105 2.97 6.68 1.979 1.576 4.792 2.363 8.438 2.363 1.224 0 2.486-0.123 3.789-0.371 1.289-0.234 2.623-0.592 4.004-1.074v-3.809c-1.094 0.639-2.292 1.121-3.594 1.445-1.302 0.326-2.663 0.488-4.082 0.488-2.474 0-4.355-0.488-5.645-1.465-1.303-0.977-1.953-2.395-1.953-4.258 0-1.719 0.605-3.059 1.815-4.023 1.198-0.977 2.872-1.465 5.021-1.465h3.397v-3.242h-3.554c-1.94 0-3.424-0.385-4.453-1.152-1.028-0.781-1.543-1.9-1.543-3.359 0-1.496 0.534-2.643 1.602-3.438 1.055-0.807 2.571-1.209 4.551-1.209 1.08 0 2.239 0.115 3.477 0.35s2.598 0.6 4.082 1.094v-3.516c-1.497-0.416-2.897-0.729-4.2-0.938-1.314-0.209-2.551-0.312-3.71-0.312-2.995 0-5.365 0.684-7.109 2.051-1.745 1.354-2.617 3.191-2.617 5.508 0 1.615 0.462 2.982 1.387 4.102 0.923 1.106 2.238 1.874 3.944 2.303zm-24.355-10l9.96 15.566h-9.96v-15.566zm1.035-3.437h-4.961v19.004h-4.16v3.281h4.16v6.875h3.925v-6.875h13.165v-3.809l-12.129-18.476zm-15.704 0h-15.488v3.32h11.875v7.148c-0.573-0.195-1.146-0.338-1.719-0.43-0.573-0.104-1.146-0.156-1.718-0.156-3.255 0-5.833 0.893-7.735 2.676-1.901 1.785-2.851 4.199-2.851 7.246 0 3.139 0.977 5.58 2.93 7.324 1.953 1.732 4.707 2.598 8.261 2.598 1.224 0 2.474-0.104 3.75-0.312 1.263-0.207 2.572-0.52 3.926-0.938v-3.965c-1.172 0.639-2.383 1.113-3.633 1.426s-2.572 0.469-3.965 0.469c-2.253 0-4.037-0.592-5.351-1.777-1.315-1.184-1.973-2.793-1.973-4.824s0.658-3.639 1.973-4.824c1.314-1.186 3.098-1.777 5.351-1.777 1.055 0 2.109 0.117 3.164 0.352 1.042 0.234 2.109 0.6 3.203 1.094v-14.65zm-25.468 0h-15.489v3.32h11.875v7.148c-0.573-0.195-1.146-0.338-1.718-0.43-0.573-0.104-1.146-0.156-1.72-0.156-3.255 0-5.833 0.893-7.733 2.676-1.901 1.785-2.852 4.199-2.852 7.246 0 3.139 0.977 5.58 2.93 7.324 1.953 1.732 4.707 2.598 8.261 2.598 1.224 0 2.474-0.104 3.75-0.312 1.263-0.207 2.572-0.52 3.926-0.938v-3.965c-1.172 0.639-2.383 1.113-3.633 1.426s-2.571 0.469-3.964 0.469c-2.253 0-4.037-0.592-5.352-1.777-1.315-1.184-1.973-2.793-1.973-4.824s0.658-3.639 1.973-4.824c1.315-1.186 3.099-1.777 5.352-1.777 1.055 0 2.109 0.117 3.164 0.352 1.042 0.234 2.109 0.6 3.203 1.094v-14.65z" fill="#ffffff" fill-opacity=".196"></path><path d="m456.16 428.8h-6.445v-22.246l7.012 1.406v-3.594l-6.973-1.406h-3.946v25.84h-6.444v3.32h16.797v-3.32h-1e-3zm-36.738-12.403c-1.888 0.404-3.359 1.244-4.415 2.52-1.067 1.275-1.601 2.852-1.601 4.727 0 2.877 0.989 5.105 2.969 6.68 1.979 1.576 4.791 2.363 8.438 2.363 1.224 0 2.487-0.123 3.79-0.371 1.288-0.234 2.622-0.592 4.003-1.074v-3.809c-1.094 0.639-2.292 1.121-3.595 1.445-1.302 0.326-2.662 0.488-4.082 0.488-2.473 0-4.354-0.488-5.644-1.465-1.302-0.977-1.953-2.395-1.953-4.258 0-1.719 0.605-3.059 1.816-4.023 1.197-0.977 2.871-1.465 5.02-1.465h3.398v-3.242h-3.556c-1.939 0-3.424-0.385-4.453-1.152-1.028-0.781-1.543-1.9-1.543-3.359 0-1.496 0.534-2.643 1.603-3.438 1.055-0.807 2.571-1.209 4.55-1.209 1.081 0 2.24 0.115 3.478 0.35 1.236 0.234 2.598 0.6 4.081 1.094v-3.516c-1.497-0.416-2.896-0.729-4.198-0.938-1.315-0.209-2.553-0.312-3.71-0.312-2.996 0-5.365 0.684-7.11 2.051-1.744 1.354-2.617 3.191-2.617 5.508 0 1.615 0.462 2.982 1.386 4.102 0.923 1.106 2.239 1.874 3.945 2.303zm-16.915 12.403h-13.77v3.32h18.517v-3.32c-1.498-1.549-3.536-3.625-6.114-6.23-2.59-2.617-4.218-4.303-4.883-5.059-1.263-1.418-2.142-2.617-2.636-3.594-0.508-0.988-0.762-1.959-0.762-2.91 0-1.549 0.547-2.812 1.64-3.789 1.081-0.977 2.494-1.465 4.239-1.465 1.236 0 2.545 0.215 3.926 0.645 1.367 0.43 2.831 1.08 4.395 1.953v-3.984c-1.589-0.637-3.073-1.119-4.453-1.445s-2.644-0.488-3.789-0.488c-3.021 0-5.43 0.756-7.227 2.266s-2.695 3.529-2.695 6.055c0 1.197 0.228 2.338 0.684 3.418 0.442 1.068 1.256 2.332 2.441 3.791 0.325 0.377 1.36 1.471 3.105 3.279 1.745 1.797 4.205 4.316 7.382 7.561v-4e-3zm-22.753 0h-6.446v-22.246l7.013 1.406v-3.594l-6.974-1.406h-3.944v25.84h-6.445v3.32h16.797v-3.32h-1e-3zm-49.473-12.403c-1.888 0.404-3.359 1.244-4.414 2.52-1.068 1.275-1.603 2.852-1.603 4.727 0 2.877 0.99 5.105 2.97 6.68 1.979 1.576 4.792 2.363 8.438 2.363 1.224 0 2.486-0.123 3.789-0.371 1.289-0.234 2.623-0.592 4.004-1.074v-3.809c-1.094 0.639-2.292 1.121-3.594 1.445-1.302 0.326-2.663 0.488-4.082 0.488-2.474 0-4.355-0.488-5.645-1.465-1.303-0.977-1.953-2.395-1.953-4.258 0-1.719 0.605-3.059 1.815-4.023 1.198-0.977 2.872-1.465 5.021-1.465h3.397v-3.242h-3.554c-1.94 0-3.424-0.385-4.453-1.152-1.028-0.781-1.543-1.9-1.543-3.359 0-1.496 0.534-2.643 1.602-3.438 1.055-0.807 2.571-1.209 4.551-1.209 1.08 0 2.239 0.115 3.477 0.35s2.598 0.6 4.082 1.094v-3.516c-1.497-0.416-2.897-0.729-4.2-0.938-1.314-0.209-2.551-0.312-3.71-0.312-2.995 0-5.365 0.684-7.109 2.051-1.745 1.354-2.617 3.191-2.617 5.508 0 1.615 0.462 2.982 1.387 4.102 0.923 1.106 2.238 1.874 3.944 2.303zm-24.355-10l9.96 15.566h-9.96v-15.566zm1.035-3.437h-4.961v19.004h-4.16v3.281h4.16v6.875h3.925v-6.875h13.165v-3.809l-12.129-18.476zm-15.704 0h-15.488v3.32h11.875v7.148c-0.573-0.195-1.146-0.338-1.719-0.43-0.573-0.104-1.146-0.156-1.718-0.156-3.255 0-5.833 0.893-7.735 2.676-1.901 1.785-2.851 4.199-2.851 7.246 0 3.139 0.977 5.58 2.93 7.324 1.953 1.732 4.707 2.598 8.261 2.598 1.224 0 2.474-0.104 3.75-0.312 1.263-0.207 2.572-0.52 3.926-0.938v-3.965c-1.172 0.639-2.383 1.113-3.633 1.426s-2.572 0.469-3.965 0.469c-2.253 0-4.037-0.592-5.351-1.777-1.315-1.184-1.973-2.793-1.973-4.824s0.658-3.639 1.973-4.824c1.314-1.186 3.098-1.777 5.351-1.777 1.055 0 2.109 0.117 3.164 0.352 1.042 0.234 2.109 0.6 3.203 1.094v-14.65zm-25.468 0h-15.489v3.32h11.875v7.148c-0.573-0.195-1.146-0.338-1.718-0.43-0.573-0.104-1.146-0.156-1.72-0.156-3.255 0-5.833 0.893-7.733 2.676-1.901 1.785-2.852 4.199-2.852 7.246 0 3.139 0.977 5.58 2.93 7.324 1.953 1.732 4.707 2.598 8.261 2.598 1.224 0 2.474-0.104 3.75-0.312 1.263-0.207 2.572-0.52 3.926-0.938v-3.965c-1.172 0.639-2.383 1.113-3.633 1.426s-2.571 0.469-3.964 0.469c-2.253 0-4.037-0.592-5.352-1.777-1.315-1.184-1.973-2.793-1.973-4.824s0.658-3.639 1.973-4.824c1.315-1.186 3.099-1.777 5.352-1.777 1.055 0 2.109 0.117 3.164 0.352 1.042 0.234 2.109 0.6 3.203 1.094v-14.65z" fill="#ffffff" fill-opacity=".196"></path><rect y="66.346" width="780" height="102" fill="#333"></rect><path d="m31 191.35h562v80h-562v-80z" fill="#ffffff"></path><path d="m513.85 244.95h-7.199v-31h-3.651l-10.2 6.3 1.8 2.95 7.9-4.75v26.5h-8.5v3.4h19.85v-3.4zm17.58-31.6c-4.649 0-7.75 1.65-10.5 4.95l2.9 2.2c2.2-2.55 4.05-3.65 7.45-3.65 3.85 0 6.149 2.4 6.149 6.25 0 5.65-2.8 9.4-15.8 21.85v3.4h20.45l0.5-3.55h-16.2c11.351-10.35 15.4-15.5 15.4-21.8 1e-3 -5.5-3.849-9.65-10.349-9.65zm29.98 0c-3.5 0-6.851 1.2-9.75 4l2.25 2.55c2.3-2.15 4.35-3.2 7.3-3.2 3.65 0 6.55 2.05 6.55 5.85 0 4.15-3.25 6.05-6.55 6.05h-2.05l-0.5 3.3h2.899c4.051 0 7.15 1.6 7.15 6.55 0 4.3-2.85 7.05-7.7 7.05-2.8 0-5.7-1.15-7.649-3.45l-2.801 2.3c2.601 3.2 6.7 4.55 10.551 4.55 7.1 0 11.949-4.5 11.949-10.45 0-5.35-3.8-8.15-7.85-8.45 3.65-0.7 6.75-3.85 6.75-8 1e-3 -4.7-4.099-8.65-10.549-8.65z"></path><path d="m56 354.93h83c13.807 0 25 11.193 25 25v45c0 13.807-11.193 25-25 25h-83c-13.807 0-25-11.193-25-25v-45c0-13.807 11.193-25 25-25z" fill="#A5A5A5"></path></g></svg>`;
        break;
    }

    return this.sanitizer.bypassSecurityTrustHtml(svgHtml);
  }

  /**
   * Registra al usuario en Flow y genera el token para verificación de pago
   */
  private registerUserInFlowAndGenerateToken(): void {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this._toastService.error('Error', 'No se encontró información del usuario');
      return;
    }

    this.isProcessingFlow.set(true);
    this.isLoading.set(true);

    // Si el usuario ya tiene un customerId de Flow, solo generamos el token
    if (user.flowCustomerId) {
      this.generateFlowToken(user.flowCustomerId);
    } else {
      this.createFlowCustomerAndGenerateToken(user);
    }
  }

  /**
   * Crea un nuevo customer en Flow y genera el token
   */
  private createFlowCustomerAndGenerateToken(user: any): void {
    const flowCustomerRequest: CreateCustomerRequest = {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      externalId: user.documentNumber || user.id.toString(),
    };

    this.flowService.createCustomer(flowCustomerRequest)
      .pipe(
        tap(response => {
          console.log('Customer creado en Flow:', response);
        }),
        switchMap(response => {
          // Actualizar el usuario con el customerId de Flow
          return this.userService.updateUser(user.id!, { flowCustomerId: response.customerId })
            .pipe(
              map(() => response.customerId)
            );
        }),
        switchMap(customerId => {
          this.authService.updateFlowCustomerId(customerId);
          // Generar token para registro de tarjeta
          return this.flowService.registerCard(customerId);
        }),
        catchError(err => {
          this.isProcessingFlow.set(false);
          this.isLoading.set(false);
          console.error('Error en el registro de Flow:', err);
          this.handleFlowError(err);
          return EMPTY;
        })
      )
      .subscribe({
        next: (response: RegisterCardResponse) => {
          this.flowToken = response.token;
          this.showPaymentSection();
          this._toastService.success('¡Genial!', 'Ahora verifica tu tarjeta de pago');
        }
      });
  }

  /**
   * Genera el token de Flow para un customer existente
   */
  private generateFlowToken(customerId: string): void {
    this.flowService.registerCard(customerId)
      .pipe(
        catchError(err => {
          this.isProcessingFlow.set(false);
          this.isLoading.set(false);
          console.error('Error generando token de Flow:', err);
          this.handleFlowError(err);
          return EMPTY;
        })
      )
      .subscribe({
        next: (response: RegisterCardResponse) => {
          this.flowToken = response.token;
          this.showPaymentSection();
          this._toastService.success('¡Genial!', 'Ahora verifica tu tarjeta de pago');
        }
      });
  }

  /**
   * Muestra la sección de verificación de pago
   */
  private showPaymentSection(): void {
    this.isProcessingFlow.set(false);
    this.isLoading.set(false);
    this.showPaymentVerification.set(true);
  }

  /**
   * Procede con la suscripción después de la verificación de pago
   */
  private proceedWithSubscription(): void {
    const user = this.authService.getCurrentUser();
    const subscriptionPlan: FlowCreateSubscriptionRequest = {
      planId: this.ENV.flowCreatina250Gr2025PlanId,
      customerId: user?.flowCustomerId ?? '',
    }

    if (!user?.flowCustomerId || !subscriptionPlan) {
      this._toastService.error('Error', 'Información incompleta para crear la suscripción');
      return;
    }

    this.isLoading.set(true);
    this.processNewSubscription(subscriptionPlan);
  }

  /**
   * Procesa la creación de una nueva suscripción
   */
  private processNewSubscription(flowCreateSubscriptionRequest: FlowCreateSubscriptionRequest): void {
    const user = this.authService.getCurrentUser();

    if (!user?.id) {
      this._toastService.error('Error', 'No se encontró información del usuario');
      return;
    }

    // Obtener dirección predeterminada del usuario
    this.userService.getUserById(user.id).pipe(
      catchError(error => {
        console.error('Error obteniendo dirección predeterminada:', error);
        this._toastService.error('Error', 'No se encontró una dirección predeterminada. Por favor, configura una dirección en tu perfil.');
        return EMPTY;
      }),
      switchMap(userResponse => {
        const orderRequest = this.createOrderRequest(userResponse.address_id ?? '');
        return this.orderService.createOrder(orderRequest);
      }),
      switchMap(response => {
        localStorage.setItem('OrderId', response.data.order.id);
        return this.flowService.createSubscription(flowCreateSubscriptionRequest);
      }),
      switchMap(flowResponse => {
        console.log('Flow Subscription created:', flowResponse);
        return this.createBackendSubscription();
      }),
      switchMap(subscriptionResponse => {
        const orderId = localStorage.getItem('OrderId') || ''
        const subscriptionOrderRequest = this.createSubscriptionOrderRequest(subscriptionResponse.id, orderId);
        return this.subscriptionOrderService.createSubscriptionOrder(subscriptionOrderRequest);
      }),
      switchMap(subscriptionOrderResponse => {
        console.log('Subscription order created:', subscriptionOrderResponse)
        // Agregar créditos al usuario por la suscripción
        const user = this.authService.getCurrentUser();
        if (user?.id) {
          return this._creditTransactionService.createTransaction({
            user_id: user.id,
            type: TransactionType.EARNED,
            amount: environment.creditoRegaloPorCompraMes,
            description: '¡Bienvenido a Magrolabs!',
            source: PaymentMethod.CREDIT_CARD
          });
        }
        return of(null);
      }),
      catchError(error => this.handleSubscriptionError(error)),
      finalize(() => {
        localStorage.setItem('isPaymentVerified', '');
        this.userCredits.set(environment.creditoRegaloPorCompraMes.toString());
        this.isLoading.set(false);
      })
    ).subscribe({
      next: (response) => {
        console.log('Subscription completed:', response);
        this._toastService.success('¡Excelente!', 'Suscripción creada exitosamente');
        // Recargar la información de suscripción
        this.loadSubscription();
      }
    });
  }

  /**
   * Crea la solicitud de orden
   * @param addressId ID de la dirección de envío
   */
  private createOrderRequest(addressId: string): CreateOrderRequest {
    return {
      shipping_address: addressId,
      payment_method: PaymentMethod.CREDIT_CARD,
      isLoyaltyWebShow: false,
      orderItems: [
        {
          product_id: '00000001-50eb-4ac3-aa94-1b64fbf32b9c', // ID del producto de creatina 250gr
          quantity: 1
        }
      ],
      discount: 20
    };

  }

  /**
   * Crea la suscripción en el backend
   */
  private createBackendSubscription(): Observable<Subscription> {
    const subscriptionRequestAPI: CreateSubscriptionRequest = {
      subscription_plan_id: '00000001-50eb-4ac3-aa94-1b64fbf32b9c',
      start_date: new Date().toISOString(),
      status: SubscriptionStatusEnum.ACTIVE,
    };

    return this.subscriptionService.createSubscription(subscriptionRequestAPI)
  }

  /**
   * Crea la solicitud de orden de suscripción
   */
  private createSubscriptionOrderRequest(subscriptionId: string, orderId: string): CreateSubscriptionOrderRequest {
    return {
      subscription_id: subscriptionId,
      order_id: orderId,
      shipment_date: new Date(
        Date.now() +
        (this.ENV.plazoDeEntregaDiasHabiles.max) *
        24 * 60 * 60 * 1000 -
        5 * 60 * 60 * 1000
      ).toISOString()
    };
  }

  /**
   * Maneja errores en la creación de suscripciones
   */
  private handleSubscriptionError(error: any): any {
    console.error('Error creating subscription:', error);
    this._toastService.error('Error', 'No se pudo crear la suscripción. Inténtalo nuevamente.');
    return EMPTY;
  }


  /**
   * Maneja errores del servicio de Flow
   */
  private handleFlowError(error: any): void {
    let errorMessage = 'Error al procesar la solicitud con Flow';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    this._toastService.error('Error', errorMessage);
  }

  private loadReviews(): Promise<void> {
    console.log('loadReviews - Solo ejecutándose en servidor (SSR)');
    // Producto ID para creatina
    const productId = '00000001-50eb-4ac3-aa94-1b64fbf32b9c';
    //TODO QUITAR EL MAS5
    return new Promise((resolve, reject) => {
      this.reviewService.getAllReviews({product_id: productId, is_approved: true}).subscribe({
        next: (response) => {
          console.log('Reviews cargadas desde servidor:', response);
          if (response.data && response.data.reviews && response.data.reviews.length > 0) {
            const reviews = response.data.reviews;
            this.totalReviews = reviews.length + 5;
            
            // Calcular promedio de rating
            const totalStars = reviews.reduce((sum: number, review: any) => sum + review.stars, 0);
            const calculatedRating = Number((totalStars / reviews.length).toFixed(1));
            this.averageRating = calculatedRating;
            
            console.log(`SSR - Reviews: ${reviews.length}, Rating promedio: ${calculatedRating}`);
          }
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar reviews en SSR:', error);
          // Mantener valores por defecto en caso de error
          resolve(); // Resolver aunque haya error para continuar
        }
      });
    });
  }
}


export enum ReactivateType {
  FROM_CANCELLATION = 0,
  FROM_PAUSE = 1,
  FROM_TO_CANCEL = 2
}