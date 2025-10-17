/**
 * Interfaces para órdenes
 */

// Enumerado para los estados de orden
export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  REFUNDED = 'REFUNDED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

// Interfaces de Request

export interface OrderItemRequest {
  /**
   * ID del producto
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  product_id: string;

  /**
   * Cantidad del producto
   * @example 2
   */
  quantity: number;
}

export interface CreateOrderRequest {
  /**
   * ID de la dirección de envío
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  shipping_address: string;

  /**
   * Costo de envío
   * @example 10.99
   */
  shipping_cost?: number;

  /**
   * Código de descuento
   * @example "SUMMER2023"
   */
  code_discount?: string;

  /**
   * Monto de descuento
   * @example 5.5
   */
  discount?: number;

  /**
   * Método de pago
   * @example "credit_card"
   */
  payment_method: string;

  /**
   * Indica si se muestra el módulo de fidelidad en web
   * @example true
   */
  isLoyaltyWebShow?: boolean;

  /**
   * Ítems de la orden
   */
  orderItems: OrderItemRequest[];
}

export interface UpdateOrderStatusRequest {
  /**
   * Nuevo estado de la orden
   * @example "PROCESSING"
   */
  status: OrderStatus;
}

// Interfaces de Response

export interface OrderItemResponse {
  /**
   * ID único del ítem
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  id: string;

  /**
   * ID de la orden
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  order_id: string;

  /**
   * ID del producto
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  product_id: string;

  /**
   * Cantidad del producto
   * @example 2
   */
  quantity: number;

  /**
   * Precio unitario del producto al momento de la compra
   * @example 29.99
   */
  price: number;
  unit_price?: number;
  /**
   * Información del producto
   */
  product?: any;
}

export interface OrderResponse {
  /**
   * ID único de la orden
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  id: string;

  /**
   * ID del usuario que realizó la orden
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  user_id: string;

  /**
   * Estado actual de la orden
   * @example "PROCESSING"
   */
  status: OrderStatus;

  /**
   * Total de la orden
   * @example 59.98
   */
  total_amount: number;

  /**
   * Costo de envío
   * @example 10.99
   */
  shipping_cost: number;

  /**
   * Código de descuento aplicado
   * @example "SUMMER2023"
   */
  code_discount?: string;

  /**
   * Monto de descuento
   * @example 5.5
   */
  discount: number;

  /**
   * Método de pago utilizado
   * @example "credit_card"
   */
  payment_method: string;

  /**
   * ID de la dirección de envío
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  shipping_address: string;

  order_date: string;

  /**
   * Información de la dirección de envío
   */

  address?: any;

  trackingNumber?: string;

  /**
   * Ítems de la orden
   */
  orderItems: OrderItemResponse[];

  /**
   * Fecha de creación de la orden
   * @example "2023-01-01T00:00:00.000Z"
   */
  created_at: string;

  /**
   * Fecha de última actualización de la orden
   * @example "2023-01-02T00:00:00.000Z"
   */
  updated_at: string;
}

export interface OrderListResponse {
  /**
   * Estado de la operación
   * @example "success"
   */
  status: string;

  /**
   * Datos de la respuesta
   */
  data: {
    /**
     * Lista de órdenes
     */
    orders: OrderResponse[];

    /**
     * Información de paginación
     */
    pagination: {
      /**
       * Número total de órdenes
       * @example 25
       */
      total: number;

      /**
       * Página actual
       * @example 1
       */
      page: number;

      /**
       * Límite de órdenes por página
       * @example 10
       */
      limit: number;

      /**
       * Número total de páginas
       * @example 3
       */
      totalPages: number;
    };
  };
}

export interface OrderDetailResponse {
  /**
   * Estado de la operación
   * @example "success"
   */
  status: string;

  /**
   * Datos de la respuesta
   */
  data: {
    /**
     * Información de la orden
     */
    order: OrderResponse;
  };
}

export interface OrderCancelResponse {
  /**
   * Estado de la operación
   * @example "success"
   */
  status: string;

  /**
   * Mensaje de la operación
   * @example "Orden cancelada correctamente"
   */
  message: string;
} 


export interface UpdateOrderDetailsRequest {
  status?: OrderStatus;
  shipping_address?: string;
  discount?: number;
  payment_method?: PaymentMethod;
  code_discount?: string;
  isLoyaltyWebShow?: boolean;
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  PAGO_EFECTIVO = 'PAGO_EFECTIVO',
  YAPE = 'YAPE'
}