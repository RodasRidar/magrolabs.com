import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { ShoppingCart, ItemShoppingCart } from '../models/item-cart.model';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {
  private readonly CART_COOKIE_NAME = 'shopping_cart';
  private cartState = new BehaviorSubject<boolean>(false);
  cartState$ = this.cartState.asObservable();

  private $ShoppingCart = new BehaviorSubject<ShoppingCart>(<ShoppingCart>{
    items: [],
    total: 0,
    totalItems: 0,
    subTotal: 0,
    totalDiscount: 0
  });

  shoppingCart$ = this.$ShoppingCart.asObservable();

  constructor(private cookieService: CookieService) {
    this.loadCartFromCookies();
  }
  
  private loadCartFromCookies() {
    const cartJson = this.cookieService.get(this.CART_COOKIE_NAME);
    if (cartJson) {
      const cart: ShoppingCart = JSON.parse(cartJson);
      this.$ShoppingCart.next(cart);
    }
  }

  openCart() {
    this.cartState.next(true);
  }

  closeCart() {
    this.cartState.next(false);
  }

  toggleCart() {
    this.cartState.next(!this.cartState.value);
  }

  setShoppingCart(shoppingCart: ShoppingCart) {
    this.$ShoppingCart.next(shoppingCart);
    this.saveCartToCookies(shoppingCart);
  }

  addProductToCart(product: ItemShoppingCart) {
    let shoppingCart = this.getShoppingCart();
    const item = shoppingCart.items.find(item => item.product.id === product.product.id);
    if (item) {
      shoppingCart.items.map(item => {
        if (item.product.id === product.product.id) {
          item.quantity += product.quantity;
        }
      })
      
    } else {
      shoppingCart.items.push(product);
    }
    this.setShoppingCart(shoppingCart);
  }

  getShoppingCart(): ShoppingCart {
    return this.$ShoppingCart.value;
  }

  getTotalItemsByShoppingCart(shoppingCart: ShoppingCart): number {
    let totalItems = 0;
    if (shoppingCart.items.length === 0) return totalItems;
    shoppingCart.items.forEach(item => {
      totalItems += item.quantity;
    });
    return totalItems;
  }

  getTotalByShoppingCart(shoppingCart: ShoppingCart): number {
    let total = 0;
    if (shoppingCart.items.length === 0) return total;
    shoppingCart.items.forEach(item => {
      total += item.product.price * item.quantity;
    });

    return total;

  }

  getSubTotalByShoppingCart(shoppingCart: ShoppingCart): number {
    return this.getTotalByShoppingCart(shoppingCart) - this.getTotalDiscountByShoppingCart(shoppingCart);
  }

  getTotalDiscountByShoppingCart(shoppingCart: ShoppingCart): number {
    let totalDiscount = 0;
    if (shoppingCart.items.length === 0) return totalDiscount;
    shoppingCart.items.forEach(item => {
      totalDiscount += ((item.product.discountPercentage ?? 0) / 100) * item.product.price * item.quantity;
    });

    return totalDiscount;

  }

  getNumberOfProductsByShoppingCart(shoppingCart: ShoppingCart): number {
    return shoppingCart.items.length;
  }

  private saveCartToCookies(shoppingCart: ShoppingCart) {
    this.cookieService.set(this.CART_COOKIE_NAME, JSON.stringify(shoppingCart));
  }

  clearCart() {
    this.$ShoppingCart.next(<ShoppingCart>{ items: [], total: 0, totalItems: 0, subTotal: 0, totalDiscount: 0 });
    this.cookieService.delete(this.CART_COOKIE_NAME, '/');
  }
}
