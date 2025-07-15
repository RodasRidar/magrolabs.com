/**
 * Interfaces para las órdenes de suscripción
 */

import { OrderStatus } from "./order.interfaces";

/**
 * Representa los estados posibles de una orden
 */
  
  /**
   * Información de la suscripción asociada a una orden
   */
  export interface OrderSubscription {
    id: string;
    status: string;
    user?: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
    product?: {
      id: string;
      name: string;
      images?: {
        id: string;
        image_url: string;
        is_main: boolean;
      }[];
    };
  }
  
  /**
   * Información de la orden asociada a una orden de suscripción
   */
  export interface SubscriptionOrderDetail {
    id: string;
    order_date: string;
    total_amount: number;
    status: string;
    shipping_address: string;
    orderItems?: {
      id: string;
      quantity: number;
      unit_price: number;
      subtotal: number;
      product: {
        id: string;
        name: string;
      };
    }[];
  }
  
  /**
   * Representa una orden de suscripción completa
   */
  /**
   * Representa una orden de suscripción completa según el modelo actualizado
   */
  export interface SubscriptionOrder {
    id: string;
    subscription_id: string;
    order_id: string;
    shipment_date: string;
    tracking_number: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    is_delete: boolean;
    order: {
      id: string;
      order_date: string;
      total_amount: string;
      status: OrderStatus;
      shipping_address: string;
    };
  }
  
  /**
   * Información para crear una orden de suscripción desde el frontend
   */
  export interface CreateSubscriptionOrderRequest {
    subscription_id: string;
    order_id: string;
    shipment_date?: string;
    status?: OrderStatus;
    tracking_number?: string;
    notes?: string;
  }
  
  /**
   * Información para actualizar una orden de suscripción desde el frontend
   */
  export interface UpdateSubscriptionOrderRequest {
    shipment_date?: string;
    status?: OrderStatus;
    tracking_number?: string;
    notes?: string;
  }
  
  /**
   * Información para actualizar el estado de una orden de suscripción desde el frontend
   */
  export interface UpdateSubscriptionOrderStatusRequest {
    status: OrderStatus;
  }
  
  /**
   * Respuesta paginada de órdenes de suscripción
   */
  export interface PaginatedSubscriptionOrdersResponse {
    status: string;
    data:{
      subscriptionOrders: SubscriptionOrder[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }
  }
  
  /**
   * Respuesta de una sola orden de suscripción
   */
  export interface SubscriptionOrderResponse {
    subscriptionOrder: SubscriptionOrder;
  } 