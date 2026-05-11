export interface MetaContent {
  id: string;
  quantity?: number;
}

export interface TrackLoginRequest {
  email: string;
}

export interface TrackCompleteRegistrationRequest {
  email: string;
  firstName: string;
  lastName: string;
}

export interface TrackAddToCartRequest {
  email?: string;
  contentIds: string[];
  contentType?: string;    // default: 'product'
  value: string;           // ej: '59.90'
  currency?: string;       // default: 'PEN'
  contents?: MetaContent[];
}

export interface TrackAddPaymentInfoRequest {
  email: string;
  firstName: string;
  lastName: string;
  zip?: string;
  contentIds: string[];
  contentType?: string;    // default: 'product'
  value: string;
  currency?: string;       // default: 'PEN'
  contents?: MetaContent[];
}

export interface TrackPurchaseRequest {
  email: string;
  firstName: string;
  lastName: string;
  contentIds: string[];
  contentType?: string;    // default: 'product'
  value: string;
  currency?: string;       // default: 'PEN'
  contents?: MetaContent[];
}

export interface TrackInitiateCheckoutRequest {
  email?: string;
  contentIds: string[];
  contentType?: string;
  value?: string;
  currency?: string;
  numItems?: number;
  contents?: MetaContent[];
}

// ─── Response ─────────────────────────────────────────────────────────────────

export interface MetaTrackResponse {
  status: 'success';
  data: { tracked: boolean };
}
