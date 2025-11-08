import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, combineLatest, forkJoin, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from './user.service';
import { AddressApiService } from './address-api.service';
import { SubscriptionService } from './subscription.service';
import { OrderService } from './order.service';
import { CreditTransactionService } from './credit-transactions.service';
import { LoyaltyService } from './loyalty.service';
import { UserDetailResponse } from '../interfaces/user.interfaces';
import { Subscription } from '../interfaces/subscription.interface';
import { environment } from '../../../environments/env';
import { OrderResponse } from '../interfaces/order.interfaces';
import { LoyaltyTierImageRoutes } from '../interfaces/loyalty.interfaces';

export interface ProfileCompletionStatus {
  hasBasicInfo: boolean;
  hasAddress: boolean;
  hasSubscription: boolean;
  isProfileComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
}

export interface AccountDashboardData {
  user: UserDetailResponse | null;
  profileStatus: ProfileCompletionStatus;
  subscription: Subscription | null;
  lastOrder: OrderResponse | null;
  loyaltyPoints: number;
  loyaltyEarnedPoints: number;
  tierInfo: {
    imageRoutes: LoyaltyTierImageRoutes | null;
    displayName: string;
  };
  nextBillingDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileCompletionService {
  private _userService = inject(UserService);
  private _addressApiService = inject(AddressApiService);
  private _subscriptionService = inject(SubscriptionService);
  private _orderService = inject(OrderService);
  private _creditTransactionService = inject(CreditTransactionService);
  private _loyaltyService = inject(LoyaltyService);

  // Señales para tracking individual
  private _hasBasicInfo = signal<boolean>(false);
  private _hasAddress = signal<boolean>(false);
  private _hasSubscription = signal<boolean>(false);
  private _isLoading = signal<boolean>(true);

  // Señales públicas de solo lectura
  readonly hasBasicInfo = this._hasBasicInfo.asReadonly();
  readonly hasAddress = this._hasAddress.asReadonly();
  readonly hasSubscription = this._hasSubscription.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // Computed signals para valores derivados
  readonly isProfileComplete = computed(() => 
    this._hasBasicInfo() && this._hasAddress()
  );

  readonly missingFields = computed(() => {
    const missing: string[] = [];
    if (!this._hasBasicInfo()) missing.push('Información básica');
    if (!this._hasAddress()) missing.push('Dirección de envío');
    if (!this._hasSubscription()) missing.push('Suscripción');
    return missing;
  });

  readonly completionPercentage = computed(() => {
    const totalSteps = 3;
    let completedSteps = 0;
    
    if (this._hasBasicInfo()) completedSteps++;
    if (this._hasAddress()) completedSteps++;
    if (this._hasSubscription()) completedSteps++;
    
    return Math.round((completedSteps / totalSteps) * 100);
  });

  readonly completionStatus = computed<ProfileCompletionStatus>(() => ({
    hasBasicInfo: this._hasBasicInfo(),
    hasAddress: this._hasAddress(),
    hasSubscription: this._hasSubscription(),
    isProfileComplete: this.isProfileComplete(),
    missingFields: this.missingFields(),
    completionPercentage: this.completionPercentage()
  }));

  readonly completionMessage = computed(() => {
    const status = this.completionStatus();
    
    // Si tiene todo completo
    if (status.isProfileComplete && status.hasSubscription) {
      return '¡Tu perfil está completo! 🎉';
    }
    
    // Si tiene perfil completo pero falta suscripción
    if (status.isProfileComplete && !status.hasSubscription) {
      return `Todo listo para activar tu ${environment.campanaPrimeraCreatina.textos.heroOferta}.`;
    }
    
    // Si solo falta la dirección
    if (status.hasBasicInfo && !status.hasAddress) {
      return `Completa tu dirección de envío para tu ${environment.campanaPrimeraCreatina.textos.heroOferta}.`;
    }
    
    // Si falta información básica
    if (!status.hasBasicInfo) {
      return 'Completa tu información personal para comenzar.';
    }
    
    // Caso por defecto
    return `Completa tu perfil para comenzar tu ${environment.campanaPrimeraCreatina.textos.heroOferta}.`;
  });

  /**
   * Carga todos los datos del dashboard en una sola petición optimizada
   */
  loadAllDashboardData(userId: string): Observable<AccountDashboardData> {
    this._isLoading.set(true);

    return forkJoin({
      user: this._userService.getCurrentUser().pipe(catchError(() => of(null))),
      subscriptionData: this._subscriptionService.getMySubscriptions(1, 1).pipe(
        catchError(() => of({ data: { subscriptions: [], total: 0 } }))
      ),
      orderData: this._orderService.getMyOrders(1, 1).pipe(
        catchError(() => of({ data: { orders: [], total: 0 } }))
      ),
      credits: this._creditTransactionService.getTotalCredits(userId).pipe(
        catchError(() => of({ data: { totalCredits: '0' } }))
      ),
      tierInfo: this._loyaltyService.getUserTierInfo(userId).pipe(
        catchError(() => of({
          imageRoutes: null,
          displayName: 'MagroPoints',
          tierData: { totalEarnedCredits: 0 }
        }))
      )
    }).pipe(
      map(({ user, subscriptionData, orderData, credits, tierInfo }) => {
        // Calcular estado de completitud
        const hasBasicInfo = this.validateBasicInfo(user);
        const hasAddress = !!(user && user.address_id);
        const hasSubscription = subscriptionData.data.subscriptions.length > 0;
        
        // Actualizar señales
        this._hasBasicInfo.set(hasBasicInfo);
        this._hasAddress.set(hasAddress);
        this._hasSubscription.set(hasSubscription);
        this._isLoading.set(false);

        const subscription = subscriptionData.data.subscriptions.length > 0 
          ? subscriptionData.data.subscriptions[0] 
          : null;

        const lastOrder = orderData.data.orders.length > 0 
          ? orderData.data.orders[0] 
          : null;

        const profileStatus: ProfileCompletionStatus = {
          hasBasicInfo,
          hasAddress,
          hasSubscription,
          isProfileComplete: hasBasicInfo && hasAddress,
          missingFields: this.getMissingFields(user, hasAddress, hasSubscription),
          completionPercentage: this.calculatePercentage(hasBasicInfo, hasAddress, hasSubscription)
        };

        return {
          user,
          profileStatus,
          subscription,
          lastOrder,
          loyaltyPoints: parseFloat(credits.data.totalCredits) || 0,
          loyaltyEarnedPoints: tierInfo.tierData.totalEarnedCredits || 0,
          tierInfo: {
            imageRoutes: tierInfo.imageRoutes,
            displayName: tierInfo.displayName
          },
          nextBillingDate: subscription?.next_billing_date || ''
        };
      }),
      catchError(error => {
        console.error('Error loading dashboard data:', error);
        this._isLoading.set(false);
        
        // Retornar datos vacíos en caso de error
        return of({
          user: null,
          profileStatus: {
            hasBasicInfo: false,
            hasAddress: false,
            hasSubscription: false,
            isProfileComplete: false,
            missingFields: ['Información básica', 'Dirección', 'Suscripción'],
            completionPercentage: 0
          },
          subscription: null,
          lastOrder: null,
          loyaltyPoints: 0,
          loyaltyEarnedPoints: 0,
          tierInfo: {
            imageRoutes: null,
            displayName: 'MagroPoints'
          },
          nextBillingDate: ''
        });
      })
    );
  }

  private calculatePercentage(hasBasicInfo: boolean, hasAddress: boolean, hasSubscription: boolean): number {
    let completedSteps = 0;
    if (hasBasicInfo) completedSteps++;
    if (hasAddress) completedSteps++;
    if (hasSubscription) completedSteps++;
    return Math.round((completedSteps / 3) * 100);
  }

  constructor() {
  }

  /**
   * Inicializa y carga el estado de completitud del perfil
   */
  loadProfileStatus(): void {
    this._isLoading.set(true);
    
    this.getProfileCompletionStatus().subscribe({
      next: (status) => {
        this._hasBasicInfo.set(status.hasBasicInfo);
        this._hasAddress.set(status.hasAddress);
        this._hasSubscription.set(status.hasSubscription);
        this._isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading profile status:', error);
        this._isLoading.set(false);
      }
    });
  }

  /**
   * Obtiene el estado de completitud del perfil del usuario
   */
  getProfileCompletionStatus(): Observable<ProfileCompletionStatus> {
    return combineLatest([
      this._userService.getCurrentUser(),
      this.checkHasAddress(),
      this.checkHasSubscription()
    ]).pipe(
      map(([user, hasAddress, hasSubscription]) => {
        const hasBasicInfo = this.validateBasicInfo(user);
        const missingFields = this.getMissingFields(user, hasAddress, hasSubscription);
        
        // Calcular porcentaje de completitud
        let totalSteps = 3; // básico, dirección, suscripción
        let completedSteps = 0;
        
        if (hasBasicInfo) completedSteps++;
        if (hasAddress) completedSteps++;
        if (hasSubscription) completedSteps++;
        
        const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
        
        // El perfil está completo si tiene info básica y dirección
        // La suscripción es opcional para considerar el perfil "completo"
        const isProfileComplete = hasBasicInfo && hasAddress;
        
        return {
          hasBasicInfo,
          hasAddress,
          hasSubscription,
          isProfileComplete,
          missingFields,
          completionPercentage
        };
      }),
      catchError(error => {
        console.error('Error checking profile completion:', error);
        return of({
          hasBasicInfo: false,
          hasAddress: false,
          hasSubscription: false,
          isProfileComplete: false,
          missingFields: ['Información básica', 'Dirección', 'Suscripción'],
          completionPercentage: 0
        });
      })
    );
  }

  /**
   * Valida si el usuario tiene la información básica completa
   */
  private validateBasicInfo(user: UserDetailResponse | null): boolean {
    if (!user) return false;
    
    return !!(
      user.first_name &&
      user.last_name &&
      user.email &&
      user.phone &&
      user.documentNumber &&
      user.documentType
    );
  }

  /**
   * Verifica si el usuario tiene una dirección registrada
   */
  private checkHasAddress(): Observable<boolean> {
    return this._userService.getCurrentUser().pipe(
      map(user => {
        if (!user || !user.address_id) return false;
        return true;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Verifica si el usuario tiene una suscripción activa
   */
  private checkHasSubscription(): Observable<boolean> {
    return this._subscriptionService.getMySubscriptions(1, 1).pipe(
      map(response => {
        if (!response.data.subscriptions || response.data.subscriptions.length === 0) {
          return false;
        }
        return true;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Obtiene la lista de campos faltantes
   */
  private getMissingFields(
    user: UserDetailResponse | null,
    hasAddress: boolean,
    hasSubscription: boolean
  ): string[] {
    const missing: string[] = [];
    
    if (!this.validateBasicInfo(user)) {
      missing.push('Información básica');
    }
    
    if (!hasAddress) {
      missing.push('Dirección de envío');
    }
    
    if (!hasSubscription) {
      missing.push('Suscripción');
    }
    
    return missing;
  }

  /**
   * Obtiene mensaje descriptivo de lo que falta completar
   * @deprecated Usar completionMessage signal en su lugar
   */
  getCompletionMessage(status: ProfileCompletionStatus): string {
    // Si tiene todo completo
    if (status.isProfileComplete && status.hasSubscription) {
      return '¡Tu perfil está completo! 🎉';
    }
    
    // Si tiene perfil completo pero falta suscripción
    if (status.isProfileComplete && !status.hasSubscription) {
      return `Todo listo para activar tu ${environment.campanaPrimeraCreatina.textos.heroOferta}.`;
    }
    
    // Si solo falta la dirección
    if (status.hasBasicInfo && !status.hasAddress) {
      return `Completa tu dirección de envío para tu ${environment.campanaPrimeraCreatina.textos.heroOferta}.`;
    }
    
    // Si falta información básica
    if (!status.hasBasicInfo) {
      return 'Completa tu información personal para comenzar.';
    }
    
    // Caso por defecto (no debería llegar aquí normalmente)
    return `Completa tu perfil para comenzar tu ${environment.campanaPrimeraCreatina.textos.heroOferta}.`;
  }

  /**
   * Actualiza manualmente el estado de dirección
   * Útil cuando se crea/actualiza una dirección
   */
  refreshAddressStatus(): void {
    this.checkHasAddress().subscribe({
      next: (hasAddress) => this._hasAddress.set(hasAddress),
      error: (error) => console.error('Error refreshing address status:', error)
    });
  }

  /**
   * Actualiza manualmente el estado de suscripción
   * Útil cuando se crea/cancela una suscripción
   */
  refreshSubscriptionStatus(): void {
    this.checkHasSubscription().subscribe({
      next: (hasSub) => this._hasSubscription.set(hasSub),
      error: (error) => console.error('Error refreshing subscription status:', error)
    });
  }
}
