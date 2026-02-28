import { Component, OnInit, inject, DestroyRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserDetailResponse } from '../../../shared/interfaces/user.interfaces';
import { Subscription, SubscriptionStatusEnum } from '../../../shared/interfaces/subscription.interface';
import { OrderResponse, OrderStatus } from '../../../shared/interfaces/order.interfaces';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../shared/services/auth.service';
import { Subject } from 'rxjs';
import { environment } from '../../../../environments/env';
import { LoyaltyTierImageRoutes } from '../../../shared/interfaces/loyalty.interfaces';
import { SeoService } from '../../../shared/services/seo.service';
import { ProfileCompletionService } from '../../../shared/services/profile-completion.service';
import { VerificationPaymentModalService } from '../../../shared/services/verification-payment-modal.service';
import { VerificationPaymentModalComponent } from '../../../shared/ui/verification-payment-modal/verification-payment-modal.component';
import { SummaryService } from '../../../shared/services/summary-service.service';
import { SummaryEnum } from '../../../shared/models/summary.model';
import { Router } from '@angular/router';
import { ToastService } from '../../../shared/services/toast.service';
import { MonthlyRewardModalService } from '../../../shared/services/monthly-reward-modal.service';
import { MonthlyRewardModalComponent } from '../../../shared/ui/monthly-reward-modal/monthly-reward-modal.component';
import { CreditTransactionService, TransactionType } from '../../../shared/services/credit-transactions.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [CommonModule, RouterLink, VerificationPaymentModalComponent, MonthlyRewardModalComponent, ButtonComponent],
  templateUrl: './cuenta.component.html',
  styleUrl: './cuenta.component.css'
})
export class CuentaComponent implements OnInit {
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private destroy$ = new Subject<void>();
  private _seoService = inject(SeoService);
  profileCompletionService = inject(ProfileCompletionService);
  verificationPaymentModalService = inject(VerificationPaymentModalService);
  private _summaryService = inject(SummaryService);
  private _router = inject(Router);
  private _toastService = inject(ToastService);
  monthlyRewardModalService = inject(MonthlyRewardModalService);
  private _creditTransactionService = inject(CreditTransactionService);

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

  // Saludo dinámico
  greetingMessage = computed(() => {
    const user = this.user();
    if (!user) return '';
    
    const hour = new Date().getHours();
    let greeting = '';
    let emoji = '';
    
    if (hour >= 6 && hour < 12) {
      greeting = 'Buenos días';
      emoji = '☀️';
    } else if (hour >= 12 && hour < 19) {
      greeting = 'Buenas tardes';
      emoji = '🌤️';
    } else {
      greeting = 'Buenas noches';
      emoji = '🌙';
    }
    
    // Usar solo el primer nombre si tiene varios nombres separados por espacios
    const firstName = user.first_name.split(' ')[0];
    
    return `¡${greeting} ${firstName}!, qué gusto tenerte de vuelta ${emoji}`;
  });

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

  // Información de suscripción formateada
  subscriptionPlanName = computed(() => {
    return 'Creatina Magrolabs de 250gr - Mensual';
  });

  subscriptionPrice = computed(() => {
    const sub = this.subscription();
    if (!sub || !sub.subscriptionPlan?.price) return 'No disponible';
    
    const basePrice = sub.subscriptionPlan.price;
    const discount = sub.discount || 0;
    
    // Si hay descuento, calcular el precio con descuento
    if (discount > 0) {
      const discountedPrice = basePrice * (1 - discount / 100);
      return `S/${discountedPrice.toFixed(0)} / mes`;
    }
    
    return `S/${basePrice} / mes`;
  });

  // Información sobre el descuento
  hasDiscount = computed(() => {
    const sub = this.subscription();
    return sub?.discount && sub.discount > 0;
  });

  discountPercentage = computed(() => {
    return this.subscription()?.discount || 0;
  });

  originalPrice = computed(() => {
    return this.subscription()?.subscriptionPlan?.price || 0;
  });

  subscriptionStartDate = computed(() => {
    const sub = this.subscription();
    if (!sub || !sub.start_date) return 'No disponible';
    return new Date(sub.start_date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  });

  // Nombre del producto del último pedido
  lastOrderProductName = computed(() => {
    const order = this.lastOrder();
    if (!order || !order.orderItems || order.orderItems.length === 0) {
      return 'No disponible';
    }
    
    // Si tiene la información del producto
    if (order.orderItems[0].product?.name) {
      return order.orderItems[0].product.name;
    }
    
    // Fallback: retornar un nombre genérico basado en la cantidad de productos
    if (order.orderItems.length === 1) {
      return 'Producto';
    }
    return `${order.orderItems.length} productos`;
  });

  statusEnum = SubscriptionStatusEnum;
  ENV = environment;

  ngOnInit() {
    // Configuración SEO para página de cuenta de usuario
    this.configureSEO();
    
    // Cargar todos los datos en una sola petición
    this.loadAllDashboardData();

    // Verificar si hay recompensa mensual para mostrar
    this.checkMonthlyReward();

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

  /**
   * Abre el modal de verificación de pago con los datos necesarios
   */
  openVerificationPaymentModal(): void {
    const currentUser = this.user();
    console.log('Current user data before opening modal:', currentUser);
    if (!currentUser) {
      console.error('No user data available');
      return;
    }

    // Verificar que el usuario tenga dirección
    if (!this.profileCompletionService.hasAddress()) {
      console.error('User needs to complete address before subscribing');
      this._toastService.warning('Dirección requerida', 'Por favor, completa tu dirección de envío para activar tu prueba.');
      // Redireccionar al perfil con parámetro para indicar el flujo
      this._router.navigate(['/cuenta'], { 
        queryParams: { isFromFreeCreatineFlow: 'true' } 
      });
      return;
    }

    // Preparar los datos del summary con la información del usuario actual
    
    // Actualizar el summary con los datos actuales del usuario
    this._summaryService.setUserData({
      nombre: currentUser.first_name,
      apellido: currentUser.last_name,
      email: currentUser.email,
      nroDocument: currentUser.documentNumber || '',
      cellphone: currentUser.phone || '',
      typeDocument: currentUser.documentType || 'DNI' as any,
      id: currentUser.id,
      isSignUpAcepted: true,
      customerId: currentUser.flowCustomerId || '',

    });

    this.authService.updateFlowCustomerId(currentUser.flowCustomerId || '');
    // Configurar el plan de suscripción
    this._summaryService.setChoosePlan({
      selection: SummaryEnum.CREATINA_250G_SUBSCRIPTION,
      descriptionOne: 'Plan mensual de S/' + environment.precioCreatinaSubscription + '.',
      descriptionTwo: 'Ganas ' + environment.creditoRegaloPorCompraMes + ' Magropuntos 🎁 .',
      descrptionThree: environment.campanaPrimeraCreatina.textos.descripcionCarrito(environment.campanaPrimeraCreatina.gramos),
      descrptionFour: 'Periodo de prueba de ' + environment.diasNormalesDePruebaOperiodoDeReflexion + ' días.',
      quantity: 1
    });

    // Configurar la dirección si existe
    if (currentUser.address) {
      const address = currentUser.address; // Usar la primera dirección
      console.log('Setting address from user data:', address);
      
      this._summaryService.setAddress({
        id: address.id,
        tipoVia: address.avenue || '', // avenue es el nombre de la calle/avenida
        nombreVia: address.avenue || '', // Mantener coherencia
        numero: address.number || '',
        codigoPostal: address.postalcode || '',
        distrito: address.district_ubigeo || '',
        provincia: address.province_ubigeo || '',
        department: address.department_ubigeo|| '',
        reference: address.reference || ''
      });
    }

    // Abrir el modal con callback para recargar datos después de cerrar
    this.verificationPaymentModalService.open(
      this._summaryService.getSummary()!,
      () => this.reloadDashboardAfterModalClose()
    );
  }

  /**
   * Recarga los datos del dashboard después de cerrar el modal
   * Útil para reflejar cambios después de una suscripción exitosa
   */
  private reloadDashboardAfterModalClose(): void {
    console.log('Reloading dashboard data after modal close...');
    this.loadAllDashboardData();
  }

  /**
   * Verifica si el usuario recibió su recompensa mensual hoy
   * Si es así y no se ha mostrado el modal, lo muestra
   */
  private checkMonthlyReward(): void {
    const userId = this.getLoggedUserId();
    if (!userId) {
      return;
    }

    // No mostrar si ya se mostró hoy
    if (this.monthlyRewardModalService.wasShownToday()) {
      return;
    }

    // Obtener transacciones del usuario
    this._creditTransactionService.getTransactionsByUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response?.data?.transactions) {
            // Buscar transacciones de hoy del tipo EARNED con descripción de bienvenida mensual
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayReward = response.data.transactions.find(transaction => {
              const transactionDate = new Date(transaction.created_at);
              transactionDate.setHours(0, 0, 0, 0);
              
              // Verificar si es de hoy, tipo EARNED, y tiene descripción de bienvenida mensual
              return transaction.type === TransactionType.EARNED &&
                     transactionDate.getTime() === today.getTime() 
                     //&&transaction.description?.toLowerCase().includes('bienvenido');
            });

            // Si encontró una recompensa de hoy, mostrar el modal
            if (todayReward) {
              // Esperar un pequeño delay para que cargue el dashboard primero
              setTimeout(() => {
                this.monthlyRewardModalService.open({
                  points: parseFloat(todayReward.amount),
                  date: new Date(todayReward.created_at)
                });
              }, 1500);
            }
          }
        },
        error: (error) => {
          console.error('Error checking monthly reward:', error);
        }
      });
  }
}
