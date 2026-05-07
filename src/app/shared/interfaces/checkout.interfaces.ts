import { TypeDocument } from './auth.interfaces';
import { CreateAddressRequest } from './address.interfaces';
import { OrderItemRequest } from './order.interfaces';

/**
 * Datos del usuario para el checkout consolidado.
 * Si la request lleva JWT (usuario autenticado), `password` es ignorado y se hace updateUser.
 * Si la request NO lleva JWT, `password` es requerido y se hace register.
 */
export interface CheckoutUser {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  documentNumber?: string;
  documentType?: TypeDocument;
  isSignUpAcepted?: boolean;
  referralCodeBy?: string;
}

/**
 * Datos de la dirección. Si `id` está presente y la request lleva JWT,
 * el backend actualiza esa dirección; en otro caso crea una nueva.
 */
export interface CheckoutAddress extends CreateAddressRequest {
  id?: string;
}

export interface CheckoutOrder {
  items: OrderItemRequest[];
  discount?: number;
  code_discount?: string;
  shipping_cost?: number;
}

/**
 * Modo de pago:
 * - PORTAL: redirect al portal Flow (Yape, transferencia, efectivo, tarjeta sin enrolar).
 *   Requiere urlReturn.
 * - CHARGE: cargo síncrono a tarjeta enrolada. Requiere customerId.
 */
export type CheckoutPaymentMode = 'PORTAL' | 'CHARGE';

export interface CheckoutPayment {
  /** Por defecto 'PORTAL' (compatibilidad con clientes viejos). */
  mode?: CheckoutPaymentMode;
  /** Código numérico de Flow: 11=tarjeta, 152=Yape, 153=transferencia, 29=efectivo. */
  paymentMethod: number;
  subject: string;
  /** Requerido solo para mode='PORTAL'. */
  urlReturn?: string;
  currency?: string;
  /** Requerido solo para mode='CHARGE'. flowCustomerId del usuario. */
  customerId?: string;
}

export interface CheckoutRequest {
  user: CheckoutUser;
  address: CheckoutAddress;
  order: CheckoutOrder;
  payment: CheckoutPayment;
}

export interface CheckoutPaymentResponse {
  url: string;
  token: string;
  flowOrder: number;
}

/** Solo se incluye en la respuesta cuando mode='CHARGE'. */
export interface CheckoutChargeSummary {
  flowOrder: number;
  commerceOrder: string;
  amount: number;
  currency: string;
  status: number;
}

export interface CheckoutTokens {
  token: string;
  refreshToken: string;
}

export interface CheckoutResponseData {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  order: {
    id: string;
    total_amount: number;
    status: string;
  };
  /** Solo presente en mode='PORTAL'. */
  payment?: CheckoutPaymentResponse;
  /** Solo presente en mode='CHARGE'. */
  charge?: CheckoutChargeSummary;
  /** Solo presente cuando fue cliente nuevo o auto-login. */
  tokens?: CheckoutTokens;
}

export interface CheckoutResponse {
  status: string;
  data: CheckoutResponseData;
}

// ─────────────────────────────────────────────────────────────────────────
// Prepare-card (POST /api/v1/checkout/prepare-card)
// ─────────────────────────────────────────────────────────────────────────

export interface PrepareCardRequest {
  email: string;
  first_name: string;
  last_name: string;
  documentNumber?: string;
  urlReturn: string;
}

export interface PrepareCardResponseData {
  customerId: string;
  token: string;
  url: string;
}

export interface PrepareCardResponse {
  status: string;
  data: PrepareCardResponseData;
}
