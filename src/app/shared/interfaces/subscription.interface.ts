/**
 * Interfaces para el sistema de suscripciones
 */

/**
 * Representa los estados posibles de una suscripción
 */
export enum SubscriptionStatusEnum {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}
  
  /**
   * Representa un plan de suscripción
   */
  export interface SubscriptionPlan {
    id: string;
    name: string;
    description?: string;
    price: number;
    period: string; // 'monthly', 'quarterly', 'yearly', etc.
    discount_rate?: number;
    created_at: string;
    updated_at: string;
  }
  
  /**
   * Datos mínimos de usuario para mostrar en suscripciones
   */
  export interface SubscriptionUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  }
  
  /**
   * Imagen principal de producto para mostrar en suscripciones
   */
  export interface SubscriptionProductImage {
    id: string;
    image_url: string;
    is_main: boolean;
  }
  
  /**
   * Datos mínimos de producto para mostrar en suscripciones
   */
  export interface SubscriptionProduct {
    id: string;
    name: string;
    price: number;
    images?: SubscriptionProductImage[];
  }
  
  /**
   * Datos de orden asociada a una suscripción
   */
  export interface SubscriptionOrder {
    id: string;
    subscription_id: string;
    order_id: string;
    order?: {
      id: string;
      order_date: string;
      total_amount: number;
      status: string;
    };
    shipment_date?: string;
    status: string;
    tracking_number?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
  }
  
  /**
   * Representa una suscripción completa
   */
  export interface Subscription {
    id: string;
    user_id: string;
    subscription_plan_id: string;
    start_date: string;
    end_date?: string;
    status: SubscriptionStatusEnum;
    next_billing_date?: string;
    next_shipment?: string;
    wanna_scoop: boolean;
    credits: number;
    created_at: string;
    updated_at: string;
    updated_by: string;
    is_deleted: boolean;
    paused_until?: string;
  }
  
  /**
   * Información para crear una suscripción desde el frontend
   */
  export interface CreateSubscriptionRequest {
    user_id?: string; // Opcional, si no se proporciona se usa el del usuario autenticado
    subscription_plan_id: string;
    start_date: string;
    end_date?: string;
    status?: SubscriptionStatusEnum;
    next_billing_date?: string;
    next_shipment?: string;
    wanna_scoop?: boolean;
    credits?: number;
  }
  
  /**
   * Información para actualizar una suscripción desde el frontend
   */
  export interface UpdateSubscriptionRequest {
    subscription_plan_id?: string;
    product_id?: string;
    end_date?: string;
    status?: SubscriptionStatusEnum;
    next_billing_date?: string;
    next_shipment?: string;
    wanna_scoop?: boolean;
    credits?: number;
  }
  
  /**
   * Información para crear un plan de suscripción desde el frontend
   */
  export interface CreateSubscriptionPlanRequest {
    name: string;
    description?: string;
    price: number;
    period: string;
    discount_rate?: number;
  }
  
  /**
   * Información para actualizar un plan de suscripción desde el frontend
   */
  export interface UpdateSubscriptionPlanRequest {
    name?: string;
    description?: string;
    price?: number;
    period?: string;
    discount_rate?: number;
  }
  
  /**
   * Respuesta paginada de suscripciones
   */
  export interface PaginatedSubscriptionsResponse {
    status: string;
    data: {
      subscriptions: Subscription[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };  
  }
  
  /**
   * Respuesta de una sola suscripción
   */
  export interface SubscriptionResponse {
    status: string
    data: {
      subscription: Subscription;
    };
  }
  
  /**
   * Respuesta de planes de suscripción
   */
  export interface SubscriptionPlansResponse {
    subscriptionPlans: SubscriptionPlan[];
  }
  
  /**
   * Respuesta de un solo plan de suscripción
   */
  export interface SubscriptionPlanResponse {
    status: string;
    data: {
      subscriptionPlan: SubscriptionPlan;
    };
  } 