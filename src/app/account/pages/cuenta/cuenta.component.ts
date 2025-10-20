import { Component, OnInit, inject, DestroyRef, signal, computed, effect } from '@angular/core';
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
import { AuthService } from '../../../shared/services/auth.service';
import { Subject, of } from 'rxjs';
import { environment } from '../../../../environments/env';
import { FlowService } from '../../../shared/services/flow.service';
import { LoyaltyService } from '../../../shared/services/loyalty.service';
import { LoyaltyTierImageRoutes } from '../../../shared/interfaces/loyalty.interfaces';
import { SeoService } from '../../../shared/services/seo.service';
import { ProfileCompletionService, ProfileCompletionStatus } from '../../../shared/services/profile-completion.service';

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
  private _loyaltyService = inject(LoyaltyService);
  private _seoService = inject(SeoService);
  profileCompletionService = inject(ProfileCompletionService);

  nextBillingDateFreeCreatine: string = environment.diasNormalesDePruebaOperiodoDeReflexion + ' días después de la entrega.';
  
  // Señal unificada de carga
  isLoadingDashboard = signal(true);
  
  // Señales para estado del usuario
  user = signal<UserDetailResponse | null>(null);
  
  // Señales para suscripción
  subscription = signal<Subscription | null>(null);
  nextBillingDate = signal<string>('');
  
  // Señales para pedidos
  lastOrder = signal<OrderResponse | null>(null);
  
  // Señales para loyalty/créditos
  loyaltyPoints = signal(0);
  loyaltyEarnedPoints = signal(0);
  maxLoyaltyPoints = signal(200);
  
  // Señales para tier
  tierImageRoutes = signal<LoyaltyTierImageRoutes | null>(null);
  tierDisplayName = signal('MagroPoints');

  // Computed signals
  loyaltyProgressWidth = computed(() => {
    const percentage = (this.loyaltyEarnedPoints() / this.maxLoyaltyPoints()) * 100;
    return `${percentage}%`;
  });

  loyaltyProgressPercentage = computed(() => {
    return (this.loyaltyEarnedPoints() / this.maxLoyaltyPoints()) * 100;
  });

  // Verificación si se debe mostrar la card de último pedido
  shouldShowLastOrderCard = computed(() => {
    return this.profileCompletionService.hasAddress() || 
           this.profileCompletionService.hasSubscription() || 
           this.lastOrder() !== null;
  });

  // Verificar si debe mostrar el medidor de lealtad
  shouldShowLoyaltyMeter = computed(() => {
    return this.profileCompletionService.hasAddress() && 
           this.profileCompletionService.hasSubscription();
  });

  // Verificación si necesita completar secciones
  needsBasicInfo = computed(() => !this.profileCompletionService.hasBasicInfo());
  needsAddress = computed(() => !this.profileCompletionService.hasAddress());
  needsSubscription = computed(() => !this.profileCompletionService.hasSubscription());

  statusEnum = SubscriptionStatusEnum;
  ENV = environment;

  ngOnInit() {
    // Configuración SEO para página de cuenta de usuario
    this.configureSEO();
    
    // Cargar todos los datos en una sola petición
    this.loadAllDashboardData();

    this.destroyRef.onDestroy(() => {
      this.destroy$.next();
      this.destroy$.complete();
    });
  }

  /**
   * Carga todos los datos del dashboard en una sola petición optimizada
   */
  private loadAllDashboardData(): void {
    const userId = this.getLoggedUserId();
    if (!userId) {
      console.error('No user ID found');
      this.isLoadingDashboard.set(false);
      return;
    }

    this.isLoadingDashboard.set(true);

    this.profileCompletionService.loadAllDashboardData(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Actualizar todas las señales con los datos recibidos
          this.user.set(data.user);
          this.subscription.set(data.subscription);
          this.lastOrder.set(data.lastOrder);
          this.loyaltyPoints.set(data.loyaltyPoints);
          this.loyaltyEarnedPoints.set(data.loyaltyEarnedPoints);
          this.tierImageRoutes.set(data.tierInfo.imageRoutes);
          this.tierDisplayName.set(data.tierInfo.displayName);
          this.nextBillingDate.set(data.nextBillingDate);
          
          this.isLoadingDashboard.set(false);
          
          console.log('Dashboard data loaded:', data);
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.isLoadingDashboard.set(false);
        }
      });
  }

  /**
   * Configura los metadatos SEO para la página de cuenta de usuario.
   * Esta página no debe ser indexada por los motores de búsqueda debido a que contiene
   * información privada del usuario.
   */
  private configureSEO(): void {
    // Establecer el título de la página
    this._seoService.setTitle('Mi Cuenta | Magrolabs');
    
    // Configurar para que no sea indexada por robots
    this._seoService.setIndexFollow(false);
    
    // Establecer descripción (aunque no se indexe, es buena práctica)
    this._seoService.setDescription('Panel de cuenta de usuario de Magrolabs. Acceso restringido.');
    
    // Configurar meta robots adicionales para mayor seguridad
    this._seoService.meta.updateTag({ name: 'robots', content: 'noindex,nofollow,noarchive,nosnippet,noimageindex' });
    
    // Configurar X-Robots-Tag para mayor protección
    this._seoService.meta.updateTag({ name: 'X-Robots-Tag', content: 'noindex,nofollow' });
    
    // Eliminar o configurar canonical para evitar problemas de SEO
    // En este caso, al no indexarse, no es necesario canonical
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
