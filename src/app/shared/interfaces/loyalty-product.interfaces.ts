/**
 * Productos canjeables por Magropuntos (tabla `LoyaltyProduct` del
 * backend). Antes estaban hardcodeados como `PRODUCTS_CONFIG` en
 * `loyalty-webshop/.../clothing.component.ts`. Ahora vienen del endpoint.
 */

export type LoyaltyTier = 'BRONCE' | 'PLATA' | 'ORO' | 'PLATINO' | 'DIAMANTE';

export interface LoyaltyProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  /** Precio en Magropuntos (puntos de lealtad), NO en soles. */
  price: number;
  image: string;
  color: string | null;
  category: string | null;
  features: string[];
  tier: LoyaltyTier;
  magropoint_img: string | null;
  is_out_of_stock: boolean;
  is_active: boolean;
  is_delete: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyProductListResponse {
  status: string;
  data: { loyaltyProducts: LoyaltyProduct[] };
}

export interface LoyaltyProductDetailResponse {
  status: string;
  data: { loyaltyProduct: LoyaltyProduct };
}
