/**
 * Interfaces y tipos para Meta Analytics (Facebook Pixel)
 */

export interface MetaEventParameters {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  contents?: Array<{
    id: string;
    quantity?: number;
    item_price?: number;
  }>;
  num_items?: number;
  predicted_ltv?: number;
  status?: boolean;
  [key: string]: any;
}

export interface MetaPurchaseParameters extends MetaEventParameters {
  value: number;
  currency: string;
  transaction_id?: string;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
}

export interface MetaSubscribeParameters extends MetaEventParameters {
  value: number;
  currency: string;
  predicted_ltv?: number;
}

export interface MetaStartTrialParameters extends MetaEventParameters {
  value: number;
  currency: string;
  predicted_ltv?: number;
}

export interface MetaAddToCartParameters extends MetaEventParameters {
  value: number;
  currency: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  contents?: Array<{
    id: string;
    quantity?: number;
    item_price?: number;
  }>;
}

export interface MetaInitiateCheckoutParameters extends MetaEventParameters {
  value: number;
  currency: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
}

export interface MetaCompleteRegistrationParameters extends MetaEventParameters {
  content_name?: string;
  status?: boolean;
}

export interface MetaAddPaymentInfoParameters extends MetaEventParameters {
  value?: number;
  currency?: string;
  content_category?: string;
}

export type MetaEventName = 
  | 'AddPaymentInfo'
  | 'AddToCart'
  | 'CompleteRegistration'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'StartTrial'
  | 'Subscribe';

export interface MetaAnalyticsConfig {
  pixelId: string;
  enabled: boolean;
  debug?: boolean;
}

declare global {
  interface Window {
    fbq: (action: string, eventName: string, parameters?: any) => void;
  }
}