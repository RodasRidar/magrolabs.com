export enum SubscriptionOrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export interface SubscriptionOrder {
  id: string;
  subscriptionId: string;
  userId: string;
  items: SubscriptionOrderItem[];
  totalAmount: number;
  status: SubscriptionOrderStatus;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionOrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  lastFour?: string;
  expiryDate?: string;
} 