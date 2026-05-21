import { OrderStatus } from '../interfaces/order.interfaces';
import { SubscriptionStatusEnum } from '../interfaces/subscription.interface';
import { FlowChargeStatus } from '../models/flow.model';
import { BadgeColor } from '../ui/badge/badge.component';

export interface StatusBadge {
  color: BadgeColor;
  label: string;
  pulse?: boolean;
}

const FALLBACK: StatusBadge = { color: 'gray', label: 'Desconocido' };

const ORDER_BADGES: Record<OrderStatus, StatusBadge> = {
  [OrderStatus.PENDING_PAYMENT]: { color: 'yellow', label: 'Pendiente de pago' },
  [OrderStatus.PROCESSING]:      { color: 'blue',   label: 'En proceso' },
  [OrderStatus.PAID]:            { color: 'green',  label: 'Pagado' },
  [OrderStatus.SHIPPED]:         { color: 'indigo', label: 'Enviado' },
  [OrderStatus.DELIVERED]:       { color: 'green',  label: 'Entregado' },
  [OrderStatus.REFUNDED]:        { color: 'gray',   label: 'Reembolsado' },
  [OrderStatus.REJECTED]:        { color: 'red',    label: 'Rechazado' },
  [OrderStatus.CANCELLED]:       { color: 'red',    label: 'Cancelado' },
};

const SUBSCRIPTION_BADGES: Record<SubscriptionStatusEnum, StatusBadge> = {
  [SubscriptionStatusEnum.ACTIVE]:    { color: 'green',  label: 'Activa', pulse: true },
  [SubscriptionStatusEnum.TRIAL]:     { color: 'blue',   label: 'Período de prueba' , pulse: true},
  [SubscriptionStatusEnum.PAUSED]:    { color: 'yellow', label: 'Pausada' },
  [SubscriptionStatusEnum.CANCELLED]: { color: 'red',    label: 'Cancelada' },
  [SubscriptionStatusEnum.EXPIRED]:   { color: 'gray',   label: 'Expirada' },
  [SubscriptionStatusEnum.TO_CANCEL]: { color: 'red',    label: 'Por cancelar' },
};

const CHARGE_BADGES: Record<FlowChargeStatus, StatusBadge> = {
  [FlowChargeStatus.PENDING]:   { color: 'yellow', label: 'Pendiente' },
  [FlowChargeStatus.COMPLETED]: { color: 'green',  label: 'Completado' },
  [FlowChargeStatus.REJECTED]:  { color: 'red',    label: 'Rechazado' },
  [FlowChargeStatus.CANCELLED]: { color: 'gray',   label: 'Cancelado' },
};

export function getOrderStatusBadge(status: OrderStatus | string | undefined | null): StatusBadge {
  if (!status) return FALLBACK;
  return ORDER_BADGES[status as OrderStatus] ?? FALLBACK;
}

export function getSubscriptionStatusBadge(status: SubscriptionStatusEnum | undefined | null): StatusBadge {
  if (!status) return { color: 'gray', label: 'Sin suscripción' };
  return SUBSCRIPTION_BADGES[status] ?? FALLBACK;
}

export function getChargeStatusBadge(status: FlowChargeStatus | number | undefined | null): StatusBadge {
  if (status === undefined || status === null) return FALLBACK;
  return CHARGE_BADGES[status as FlowChargeStatus] ?? FALLBACK;
}
