import { ProductCart } from "./product.model";

export interface ItemShoppingCart {
    product: ProductCart;
    quantity: number;
}
export interface ShoppingCart{
    items: ItemShoppingCart[]
    total: number
    totalItems: number
    subTotal: number
    totalDiscount: number
    tax?: number
}