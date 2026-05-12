import { PaymentMethod } from './order.interfaces';

/**
 * Tipos del endpoint consolidado POST /api/v1/checkout/subscription.
 *
 * El backend ejecuta el patrón saga completo: cleanup intento previo +
 * validación cupón + cargo Flow + tx con reintentos + sanity check +
 * createSubscription Flow con reintentos + tokens auto-login.
 *
 * El frontend solo construye el payload y maneja la respuesta — toda la
 * orquestación HTTP queda del lado backend.
 */

export interface CheckoutSubscriptionOrderItem {
  product_id: string;
  quantity: number;
}

export interface CheckoutSubscriptionOrder {
  /**
   * - 'new': el backend crea una orden nueva.
   * - 'update': el backend actualiza la orden existente (sobre-escribe).
   *   Requiere `orderId`.
   */
  mode: 'new' | 'update';
  orderId?: string;
  shipping_address: string;
  payment_method: PaymentMethod;
  orderItems: CheckoutSubscriptionOrderItem[];
  /** Código de cupón (opcional). El backend lo re-valida server-side. */
  code_discount?: string;
  isLoyaltyWebShow?: boolean;
}

export interface ChargeReference {
  flowOrder: number;
  commerceOrder: string;
}

export interface CheckoutSubscriptionRequest {
  /** flowCustomerId del usuario (debe tener tarjeta ya enrolada en Flow). */
  customerId: string;
  /** Plan en Flow (ej. '2026-creatina-250gr-mensual-55'). */
  flowPlanId: string;
  /** UUID del SubscriptionPlan en BD. */
  backendSubscriptionPlanId: string;
  trialPeriodDays: number;
  firstChargeAmount: number;
  firstChargeSubject: string;
  firstChargeOptionals?: Record<string, any>;
  order: CheckoutSubscriptionOrder;
  /** Solo poblado en reintentos tras TX_FAILED_AFTER_CHARGE. */
  chargeReference?: ChargeReference;
  creditAmount?: number;
}

export interface CheckoutSubscriptionTokens {
  token: string;
  refreshToken: string;
}

export interface CheckoutSubscriptionResponseData {
  order: {
    id: string;
    total_amount: number;
    status: string;
  };
  subscription: {
    id: string;
    status: string;
    flowSubscriptionId?: string;
    /** True si flow.createSubscription falló las 3 veces (job externo reconcilia). */
    pendingFlowSync?: boolean;
  };
  charge: {
    flowOrder: number;
    commerceOrder: string;
    amount: number;
    /** Status verificado por sanity check (no el inmediato del charge). */
    status: number;
  };
  /** Tokens fresquitos para refresco de sesión (auto-login). */
  tokens?: CheckoutSubscriptionTokens;
}

export interface CheckoutSubscriptionResponse {
  status: string;
  data: CheckoutSubscriptionResponseData;
}

/**
 * Resultado de la validación de la tarjeta enrolada del customer.
 * El backend (`GET /api/v1/checkout/subscription/validate-card`) consulta
 * el `pay_mode` que Flow asigna a la tarjeta y decide si el customer
 * puede usarla para una suscripción recurrente.
 *
 * Solo permitimos tarjetas de CRÉDITO porque Flow no cobra recurrente
 * de débito de forma confiable. El frontend usa `allowed` + `reason`
 * para bloquear el flujo si la tarjeta no califica.
 */
export type ValidateCardReason =
  | 'DEBIT_NOT_ALLOWED'
  | 'NO_CARD'
  | 'UNKNOWN_PAY_MODE';

export interface ValidateCardResponseData {
  allowed: boolean;
  pay_mode: string;
  brand?: string;
  last4?: string;
  reason?: ValidateCardReason;
}

export interface ValidateCardResponse {
  status: string;
  data: ValidateCardResponseData;
}
