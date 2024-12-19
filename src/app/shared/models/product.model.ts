export interface ProductCart {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  price: number;
  is_on_sale?: boolean;
  discountPercentage?: number;
  is_active?: boolean;
  imageAlt?: string;
  slug: string;
}
