/**
 * Tipos relacionados con cupones de descuento.
 *
 * El backend (POST /api/v1/coupons/validate) recibe el código + carrito y
 * devuelve el descuento ya resuelto en soles (`discount_amount`). El
 * frontend NO calcula nada del descuento — solo muestra lo que el backend
 * ya validó y computó.
 */

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface ValidateCouponItem {
  product_id: string;
  quantity: number;
}

export interface ValidateCouponRequest {
  code: string;
  items: ValidateCouponItem[];
  /** Subtotal del carrito (sin descuento ni envío). */
  subtotal: number;
}

export interface ValidateCouponResponseData {
  /** Código en uppercase tal como está en BD (ej. "MAGRO9"). */
  code: string;
  description: string | null;
  discount_type: DiscountType;
  /** Valor de la regla (10 = 10%, 9.10 = S/.9.10). */
  discount_value: number;
  /** Soles efectivamente descontados. Es lo que se resta al subtotal. */
  discount_amount: number;
}

export interface ValidateCouponResponse {
  status: string;
  data: ValidateCouponResponseData;
}

/**
 * Códigos de error que el backend puede devolver al validar un cupón.
 * Mapeados a mensajes amigables en checkout.component.ts.
 */
export type CouponErrorCode =
  | 'INVALID_COUPON_VALIDATE_PAYLOAD'
  | 'COUPON_NOT_FOUND'
  | 'COUPON_NOT_STARTED'
  | 'COUPON_EXPIRED'
  | 'COUPON_USAGE_EXCEEDED'
  | 'COUPON_MIN_SUBTOTAL_NOT_MET'
  | 'COUPON_PRODUCT_NOT_ELIGIBLE'
  | 'COUPON_QTY_NOT_MET';
