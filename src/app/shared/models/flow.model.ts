export interface FlowModelRequest {
    apiKey?: string;
    s?: string; // Firma con secretKey
}
// 📌 Interfaz para la solicitud de creación de cliente
export interface CreateCustomerRequest extends FlowModelRequest {
    name: string;
    email: string;
    externalId: string; //ID del sistema externo
  }

  export interface EditCustomerRequest extends FlowModelRequest {
    name: string;
    email: string;
    externalId: string; //ID del sistema externo
    customerId: string;
  }

  export interface EditCustomerResponse extends CreateCustomerResponse {}

  // 📌 Interfaz para la respuesta de creación de cliente
  export interface CreateCustomerResponse {
    customerId: string;
    created: string; // Fecha de creación
    email: string;
    name: string;
    pay_mode: string;
    creditCardType?: string; // Puede ser opcional si no tiene tarjeta
    last4CardDigits?: string;
    externalId: string;
    status: string; // Estado del cliente
    registerDate: string;
  }
  
  // 📌 Interfaz para la solicitud de registro de tarjeta
export interface RegisterCardRequest extends FlowModelRequest{
    customerId: string;
    url_return: string;
  }
  
  // 📌 Interfaz para la respuesta de registro de tarjeta
  export interface RegisterCardResponse {
    url: string;   // URL de redirección para registrar la tarjeta
    token: string; // Token único de la transacción
  }
  export interface RegisterStatusResponse {
    status: string;       // Estado del registro ("1" para éxito, otros valores para error)
    customerId: string;   // ID del cliente en Flow
    creditCardType: string; // Tipo de tarjeta (Visa, MasterCard, etc.)
    last4CardDigits: string; // Últimos 4 dígitos de la tarjeta
  }
  export interface CreateSubscriptionRequest extends FlowModelRequest {
    planId: string;
    customerId: string;
    subscription_start?: string;
    couponId?: number;
    trial_period_days?: number;
    periods_number?: number;
  }
  
  export interface FlowPaymentRequest extends FlowModelRequest{
    commerceOrder: string; // Orden del comercio
    subject: string; // Descripción de la orden
    currency: string; // Moneda de la orden
    amount: number; // Monto de la orden
    email: string; // Email del pagador
    paymentMethod: FlowPaymentMethod; // Identificador del medio de pago (opcional)
    urlConfirmation: string; // URL donde Flow confirmará el pago
    urlReturn: string; // URL de retorno del comercio
    optional?: string; // Datos opcionales en formato JSON
    timeout?: number; // Tiempo en segundos antes de que expire la orden (opcional)
    merchantId?: string; // ID del comercio asociado (opcional)
    payment_currency?: string; // Moneda esperada de pago (opcional)
  }
  export enum FlowPaymentMethod {
    CARD_ENROLLED = 0,
    DEBIT_CREDIT_CARD = 11,
    RECURRENT_PAYMENT = 158,
    YAPE = 152,
    BANK_TRANSFER = 153,
    PAGO_EFECTIVO = 29,
  }

  export interface FlowPaymentResponse {
    url: string; // URL de redirección para el pago
    token: string; // Token único de la transacción
    flowOrder: string; // Orden del comercio
  }

  export interface CreateSubscriptionResponse {
    subscriptionId: string;
    planId: string;
    plan_name: string;
    customerId: string;
    created: string;
    subscription_start: string;
    subscription_end: string;
    period_start: string;
    period_end: string;
    next_invoice_date: string;
    trial_period_days: number;
    trial_start: string;
    trial_end: string;
    cancel_at_period_end: number;
    cancel_at?: string | null;
    periods_number: number;
    days_until_due: number;
    status: number;
    discount_balance: string;
    newPlanId: number;
    new_plan_scheduled_change_date?: string | null;
    in_new_plan_next_attempt_date?: string | null;
    morose: number;
    discount?: Discount;
    invoices?: Invoice[];
  }
  
  interface Discount {
    id: number;
    type: string;
    created: string;
    start: string;
    end: string;
    deleted: string;
    status: number;
    coupon: Coupon;
  }
  
  interface Coupon {
    id: number;
    name: string;
    percent_off: number;
    currency: string;
    amount: number;
    created: string;
    duration: number;
    times: number;
    max_redemptions: number;
    expires: string;
    status: number;
    redemtions: number;
  }
  
  interface Invoice {
    id: number;
    subscriptionId: string;
    customerId: string;
    created: string;
    subject: string;
    currency: string;
    amount: number;
    period_start: string;
    period_end: string;
    attemp_count: number;
    attemped: number;
    next_attemp_date: string;
    due_date: string;
    status: number;
    error: number;
    errorDate: string;
    errorDescription: string;
    items: InvoiceItem[];
    payment?: Payment;
    outsidePayment?: OutsidePayment;
    paymentLink: string;
    chargeAttemps?: ChargeAttempt[];
  }
  
  interface InvoiceItem {
    id: number;
    subject: string;
    type: number;
    currency: string;
    amount: number;
  }
  
  interface Payment {
    flowOrder: number;
    commerceOrder: string;
    requestDate: string;
    status: number;
    subject: string;
    currency: string;
    amount: number;
    payer: string;
    optional?: Record<string, string>;
    pending_info?: PendingInfo;
    paymentData?: PaymentData;
    merchantId: string;
  }
  
  interface PendingInfo {
    media: string;
    date: string;
  }
  
  interface PaymentData {
    date: string;
    media: string;
    conversionDate: string;
    conversionRate: number;
    amount: number;
    currency: string;
    fee: number;
    balance: number;
    transferDate: string;
  }
  
  interface OutsidePayment {
    date: string;
    comment: string;
  }
  
  interface ChargeAttempt {
    id: number;
    date: string;
    customerId: string;
    invoiceId: number;
    commerceOrder: string;
    currency: string;
    amount: number;
    errorCode: number;
    errorDescription: string;
  }
  