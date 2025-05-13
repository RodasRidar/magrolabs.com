import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { UserDetailResponse } from '../../../shared/interfaces/user.interfaces';
import { SubscriptionService } from '../../../shared/services/subscription.service';
import { Subscription, SubscriptionStatusEnum } from '../../../shared/interfaces/subscription.interface';
import { OrderService } from '../../../shared/services/order.service';
import { OrderResponse, OrderStatus } from '../../../shared/interfaces/order.interfaces';
import { finalize } from 'rxjs/operators';

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

  user: UserDetailResponse | null = null;
  subscription: Subscription | null = null;
  subscriptionLoading = false;
  subscriptionError = false;
  lastOrder: OrderResponse | null = null;
  orderLoading = false;
  orderError = false;
  loyaltyPoints = 10;
  loyaltyProgressWidth = '0%';
  maxLoyaltyPoints = 200;

  ngOnInit() {
    this.loadUserData();
    this.loadSubscriptionData();
    this.loadLastOrder();
    
    // Iniciar con 0% y luego animar hasta el porcentaje actual
    setTimeout(() => {
      this.loyaltyProgressWidth = this.calculateProgressPercentage() + '%';
    }, 500);
  }

  calculateProgressPercentage(): number {
    return (this.loyaltyPoints / this.maxLoyaltyPoints) * 100;
  }

  private loadUserData() {
    this._userService.getCurrentUser().subscribe({
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
        finalize(() => {
          this.subscriptionLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.subscriptions && response.subscriptions.length > 0) {
            this.subscription = response.subscriptions[0];
          } else {
            this.subscription = null;
          }
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
  
  getSubscriptionStatusText(status: SubscriptionStatusEnum | undefined): string {
    if (!status) return 'Sin suscripción activa';
    
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
      default:
        return 'Estado desconocido';
    }
  }
  
  getOrderStatusText(status: OrderStatus | undefined): string {
    if (!status) return 'Estado desconocido';
    
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pendiente';
      case OrderStatus.PROCESSING:
        return 'En proceso';
      case OrderStatus.SHIPPED:
        return 'Enviado';
      case OrderStatus.DELIVERED:
        return 'Entregado';
      case OrderStatus.CANCELLED:
        return 'Cancelado';
      default:
        return 'Estado desconocido';
    }
  }
}
