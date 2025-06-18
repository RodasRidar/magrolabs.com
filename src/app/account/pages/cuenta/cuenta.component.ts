import { Component, OnInit, inject, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { UserDetailResponse } from '../../../shared/interfaces/user.interfaces';
import { SubscriptionService } from '../../../shared/services/subscription.service';
import { Subscription, SubscriptionStatusEnum } from '../../../shared/interfaces/subscription.interface';
import { OrderService } from '../../../shared/services/order.service';
import { OrderResponse, OrderStatus } from '../../../shared/interfaces/order.interfaces';
import { finalize, takeUntil, switchMap, map, catchError } from 'rxjs/operators';
import { CreditTransactionService } from '../../../shared/services/credit-transactions.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../shared/services/auth.service';
import { Subject, of } from 'rxjs';
import { environment } from '../../../../environments/env';
import { FlowService } from '../../../shared/services/flow.service';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cuenta.component.html',
  styleUrl: './cuenta.component.css'
})
export class CuentaComponent implements OnInit {
  private _userService = inject(UserService);
  private _subscriptionService = inject(SubscriptionService);
  private _orderService = inject(OrderService);
  private _creditTransactionService = inject(CreditTransactionService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private destroy$ = new Subject<void>();
  private _flowService = inject(FlowService);

  nextBillingDateFreeCreatine: string = environment.diasNormalesDePruebaOperiodoDeReflexion + ' días después de la entrega.';
  user: UserDetailResponse | null = null;
  subscription: Subscription | null = null;
  subscriptionLoading = false;
  subscriptionError = false;
  lastOrder: OrderResponse | null = null;
  orderLoading = false;
  orderError = false;
  loyaltyPoints = 0;
  loyaltyProgressWidth = '0%';
  maxLoyaltyPoints = 200;
  statusEnum = SubscriptionStatusEnum;
  nextBillingDate = signal<string>('');
  ENV = environment;

  ngOnInit() {
    this.loadUserData();
    this.loadSubscriptionData();
    this.loadLastOrder();
    this.loadUserCredits();

    this.destroyRef.onDestroy(() => {
      this.destroy$.next();
      this.destroy$.complete();
    });

    // Iniciar con 0% y luego animar hasta el porcentaje actual
    setTimeout(() => {
      this.loyaltyProgressWidth = this.calculateProgressPercentage() + '%';
    }, 500);
  }

  calculateProgressPercentage(): number {
    return (this.loyaltyPoints / this.maxLoyaltyPoints) * 100;
  }

  private loadUserData() {
    this._userService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user = user;
        },
        error: (error) => {
          console.error('Error al cargar datos del usuario:', error);
        }
      });
  }

  private loadSubscriptionData() {
    this.subscriptionLoading = true;
    this.subscriptionError = false;

    this._subscriptionService.getMySubscriptions(1, 1)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(response => {
          if (response.data.subscriptions && response.data.subscriptions.length > 0) {
            this.subscription = response.data.subscriptions[0];
            const customerId = this.authService.getCurrentUser()?.flowCustomerId;
            return this._flowService.getSubscriptions(customerId || '')
              .pipe(
                map(flowResponse => ({
                  subscriptionResponse: response,
                  flowResponse
                })),
                catchError(err => {
                  console.error('Error al obtener detalles de Flow:', err);
                  // Retornar un objeto con solo la respuesta original para no interrumpir el flujo
                  return of({
                    subscriptionResponse: response,
                    flowResponse: null
                  });
                })
              );
          }
          this.subscription = null;
          // Retornar un observable que emite null si no hay suscripciones
          return of({ subscriptionResponse: response, flowResponse: null });
        }),
        finalize(() => {
          this.subscriptionLoading = false;
        })
      )
      .subscribe({
        next: (combinedResponse) => {
          //console.log('combinedResponse', combinedResponse);
          //console.log('Próxima fecha de pago:', combinedResponse.flowResponse?.data[0].next_invoice_date);
          this.nextBillingDate.set(combinedResponse.subscriptionResponse.data.subscriptions[0].next_billing_date || '');
        },
        error: (error) => {
          console.error('Error al cargar datos de suscripción:', error);
          this.subscriptionError = true;
          this.subscription = null;
        }
      });
  }

  private loadLastOrder() {
    this.orderLoading = true;
    this.orderError = false;

    // Obtener solo el último pedido (page=1, limit=1)
    this._orderService.getMyOrders(1, 1)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.orderLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.data && response.data.orders && response.data.orders.length > 0) {
            this.lastOrder = response.data.orders[0];
          } else {
            this.lastOrder = null;
          }
        },
        error: (error) => {
          console.error('Error al cargar último pedido:', error);
          this.orderError = true;
          this.lastOrder = null;
        }
      });
  }

  private loadUserCredits(): void {
    const userId = this.getLoggedUserId();
    console.log('userId', userId);
    if (userId) {
      this._creditTransactionService.getTotalCredits(userId)
        .pipe(
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (response) => {
            if (response && response.data) {
              this.loyaltyPoints = parseFloat(response.data.totalCredits) || 0;
              // Actualizar la barra de progreso después de obtener los puntos
              this.loyaltyProgressWidth = this.calculateProgressPercentage() + '%';
            }
          },
          error: (error) => {
            console.error('Error al obtener los créditos del usuario:', error);
          }
        });
    }
  }

  private getLoggedUserId(): string {
    return this.authService.getCurrentUser()?.id || '';
  }

  getSubscriptionStatusText(status: SubscriptionStatusEnum | undefined): string {
    if (!status) return 'Sin suscripción';

    switch (status) {
      case SubscriptionStatusEnum.ACTIVE:
        return 'Activa';
      case SubscriptionStatusEnum.TRIAL:
        return 'Período de prueba';
      case SubscriptionStatusEnum.PAUSED:
        return 'Pausada';
      case SubscriptionStatusEnum.CANCELLED:
        return 'Cancelada';
      case SubscriptionStatusEnum.EXPIRED:
        return 'Expirada';
      case SubscriptionStatusEnum.TO_CANCEL:
        return 'Por Cancelar';
      default:
        return 'Estado desconocido';
    }
  }

  getOrderStatusText(status: OrderStatus | undefined): string {
    if (!status) return 'Estado desconocido';

    switch (status) {
      case OrderStatus.PENDING_PAYMENT:
        return 'Pendiente';
      case OrderStatus.PROCESSING:
        return 'En proceso';
      case OrderStatus.SHIPPED:
        return 'Enviado';
      case OrderStatus.DELIVERED:
        return 'Entregado';
      case OrderStatus.CANCELLED:
        return 'Cancelado';
      case OrderStatus.PAID:
        return 'Pagado';
      case OrderStatus.REFUNDED:
        return 'Reembolsado';
      case OrderStatus.REJECTED:
        return 'Rechazado';
      default:
        return 'Estado desconocido';
    }
  }

  /**
   * Devuelve las clases CSS para el estado de la suscripción
   */
  getStatusClass(status: SubscriptionStatusEnum | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-800';

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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Devuelve la clase CSS para el punto indicador de estado
   */
  getDotClass(status: SubscriptionStatusEnum | undefined): string {
    if (!status) return 'bg-gray-500';

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
      default:
        return 'bg-gray-500';
    }
  }
}
