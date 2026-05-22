/**
 * Tipos del endpoint POST /api/v1/subscription-coupons/validate.
 *
 * Códigos de cupones de creadores aplicables a checkout de suscripciones.
 * Mantenidos separados de los cupones de purchase one-time (Coupons /
 * /api/v1/coupons/validate).
 */

export type SubscriptionDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type SubscriptionCouponAppliesTo = 'FIRST_CHARGE' | 'RECURRING' | 'BOTH';

export interface ValidateSubscriptionCouponRequest {
  code: string;
  firstChargeAmount: number;
  /** Cuota recurrente mensual. Si se omite, recurring_discount_amount = 0. */
  recurringAmount?: number;
}

export interface ValidateSubscriptionCouponResponseData {
  code: string;
  description: string | null;
  discount_type: SubscriptionDiscountType;
  discount_value: number;
  applies_to: SubscriptionCouponAppliesTo;
  /** Soles a descontar del primer cargo (0 si applies_to = RECURRING). */
  first_charge_discount_amount: number;
  /** Soles a descontar de cada cuota mensual (0 si applies_to = FIRST_CHARGE). */
  recurring_discount_amount: number;
  /** ID del cupón en Flow (presente solo si applies_to ∈ {RECURRING, BOTH}). */
  flow_coupon_id: number | null;
  creator_name: string | null;
  creator_external_id: string | null;
}

export interface ValidateSubscriptionCouponResponse {
  status: string;
  data: ValidateSubscriptionCouponResponseData;
}

/**
 * Códigos de error que el backend devuelve. El frontend los mapea a
 * mensajes amigables en `mapSubCouponError`.
 */
export type SubscriptionCouponErrorCode =
  | 'INVALID_SUBSCRIPTION_COUPON_VALIDATE_PAYLOAD'
  | 'SUBSCRIPTION_COUPON_NOT_FOUND'
  | 'SUBSCRIPTION_COUPON_NOT_STARTED'
  | 'SUBSCRIPTION_COUPON_EXPIRED'
  | 'SUBSCRIPTION_COUPON_USAGE_EXCEEDED'
  | 'SUBSCRIPTION_COUPON_MIN_SUBTOTAL_NOT_MET'
  | 'SUBSCRIPTION_COUPON_MISCONFIGURED';
