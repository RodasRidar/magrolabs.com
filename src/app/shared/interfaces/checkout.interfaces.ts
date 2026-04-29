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

export interface CheckoutPayment {
  /** Código numérico de Flow: 11=tarjeta, 152=Yape, 153=transferencia, 29=efectivo. */
  paymentMethod: number;
  subject: string;
  urlReturn: string;
  currency?: string;
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
  payment: CheckoutPaymentResponse;
  /** Solo presente cuando fue cliente nuevo (registro dentro del checkout). */
  tokens?: CheckoutTokens;
}

export interface CheckoutResponse {
  status: string;
  data: CheckoutResponseData;
}
