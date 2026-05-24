import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, inject, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '../button/button.component';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { ProductQuantityComponent } from '../product-quantity/product-quantity.component';
import { DiscountPipe } from '../../pipes/discount.pipe';
import { ShoppingCart, ItemShoppingCart } from '../../models/item-cart.model';
import { ShoppingCartService } from '../../services/cart-service.service';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    imports: [CommonModule, ButtonComponent, RouterLink, ProductQuantityComponent, DiscountPipe, NgOptimizedImage, IconComponent],
    animations: [
        trigger('fadeInOut', [
            state('inactive', style({
                opacity: 0,
                transform: 'translateX(100%)'
            })),
            state('active', style({
                opacity: 1,
                transform: 'translateX(0)'
            })),
            transition('inactive => active', [
                animate('200ms ease-in-out')
            ]),
            transition('active => inactive', [
                animate('300ms ease-in-out')
            ])
        ])
    ]
})
export class CartComponent {
  readonly MAX_QUANTITY = 20;
  readonly MIN_QUANTITY = 0;
  state = 'active';
  businessColor = 'orange';
  shoppingCart: ShoppingCart = <ShoppingCart>{};
  private _shoppingCartService = inject(ShoppingCartService);
  private _router = inject(Router);
  private PLATAFORMID = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  isProductPage = false;

  ngOnInit() {
    this._shoppingCartService.cartState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(state => {
        state ? this.state = 'active' : this.state = 'inactive';
      });

    this._shoppingCartService.shoppingCart$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(shoppingCart => {
        if (shoppingCart && shoppingCart.items.length > 0) {
          this.shoppingCart = shoppingCart;
          this.shoppingCart.totalItems = this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart);
          this.shoppingCart.total = this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart);
          this.shoppingCart.subTotal = this._shoppingCartService.getSubTotalByShoppingCart(this.shoppingCart);
          this.shoppingCart.totalDiscount = this._shoppingCartService.getTotalDiscountByShoppingCart(this.shoppingCart);
        }
      });

    if(isPlatformBrowser(this.PLATAFORMID)) {
      if (window.location.pathname == '/productos') {
        this.isProductPage = true;
      }
      else {
        this.isProductPage = false;
      }
    }

    this._router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          const currentUrl = event.url.split('/').pop()?.split('?').shift() || '';
          if (currentUrl === 'productos' || window.location.pathname == 'productos') {
            this.isProductPage = true;
          }
          else {
            this.isProductPage = false;
          }
        }
      });
  }

  toggle() {
    if (this.state === 'active') {
      this.state = 'inactive';
    } else {
      this.state = 'active';
    }
    this._shoppingCartService.toggleCart();
  }

  get TextColorClass() {
    const colorsList: { [key: string]: string } = {
      indigo: 'text-indigo-500',
      gray: 'text-fg-subtle',
      red: 'text-red-500',
      yellow: 'text-yellow-500',
      green: 'text-green-500',
      blue: 'text-blue-500',
      purple: 'text-purple-500',
      pink: 'text-pink-500',
      sky: 'text-sky-500',
      orange: 'text-primary-hover',
      teal: 'text-teal-500',
      lime: 'text-lime-500',
      fuchsia: 'text-fuchsia-500',
      black: 'text-fg',
    };
    return colorsList[this.businessColor];
  }

  get TextHoverClass() {
    const colorsList: { [key: string]: string } = {
      indigo: 'hover:text-indigo-300',
      gray: 'hover:text-fg-subtle',
      red: 'hover:text-red-300',
      yellow: 'hover:text-yellow-300',
      green: 'hover:text-green-300',
      blue: 'hover:text-blue-300',
      purple: 'hover:text-purple-300',
      pink: 'hover:text-pink-300',
      sky: 'hover:text-sky-300',
      orange: 'hover:text-orange-300',
      teal: 'hover:text-teal-300',
      lime: 'hover:text-lime-300',
      fuchsia: 'hover:text-fuchsia-300',
      black: 'hover:text-grey-700',
    };
    return colorsList[this.businessColor];
  }

  quantityValue(value: number, product: ItemShoppingCart) {
    product.quantity = value
    this.shoppingCart.totalItems = this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart);
    this.shoppingCart.total = this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart);
    this.shoppingCart.subTotal = this._shoppingCartService.getSubTotalByShoppingCart(this.shoppingCart);
    this.shoppingCart.totalDiscount = this._shoppingCartService.getTotalDiscountByShoppingCart(this.shoppingCart);
    this._shoppingCartService.setShoppingCart(this.shoppingCart);
  }

  deleteItemFromCart(product: ItemShoppingCart) {
    this.shoppingCart.items = this.shoppingCart.items.filter(item => item.product.id !== product.product.id);
    this.shoppingCart.totalItems = this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart);
    this.shoppingCart.total = this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart);
    this.shoppingCart.subTotal = this._shoppingCartService.getSubTotalByShoppingCart(this.shoppingCart);
    this.shoppingCart.totalDiscount = this._shoppingCartService.getTotalDiscountByShoppingCart(this.shoppingCart);
    this._shoppingCartService.setShoppingCart(this.shoppingCart);
  }

  goCheckout() {
    this._shoppingCartService.toggleCart();
    setTimeout(() => {
      this._router.navigate(['/checkout']);
    }, 300);
  }
}

