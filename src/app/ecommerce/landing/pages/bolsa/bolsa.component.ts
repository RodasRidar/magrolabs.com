import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ItemShoppingCart, ShoppingCart } from '../../../../shared/models/item-cart.model';
import { ShoppingCartService } from '../../../../shared/services/cart-service.service';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { NavbarComponent, NavbarTypeEnum } from '../../components/navbar/navbar.component';
import { OrderSummaryItemComponent } from './order-summary-item/order-summary-item.component';
import { CardComponent } from '../../../../shared/ui/card/card.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../../shared/ui/breadcrumb/breadcrumb.component';

@Component({
    selector: 'app-bolsa',
    imports: [RouterLink, NavbarComponent, OrderSummaryItemComponent, CurrencyPipe, ButtonComponent, AsyncPipe, CardComponent, BreadcrumbComponent],
    templateUrl: './bolsa.component.html'
})
export class BolsaComponent {
  navbarTypeEnum = NavbarTypeEnum;

  readonly breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', link: '/' },
    { label: 'Tienda', link: '/productos' },
    { label: 'Carrito' },
  ];
  state = 'active';
  private _shoppingCartService = inject(ShoppingCartService);
  private destroyRef = inject(DestroyRef);

  shoppingCart: ShoppingCart = <ShoppingCart>{};

  $shoppingCart = this._shoppingCartService.shoppingCart$;

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
          this.shoppingCart.totalItems = this._shoppingCartService.getTotalItemsByShoppingCart(shoppingCart);
          this.shoppingCart.total = this._shoppingCartService.getTotalByShoppingCart(shoppingCart);
          this.shoppingCart.subTotal = this._shoppingCartService.getSubTotalByShoppingCart(shoppingCart);
          this.shoppingCart.totalDiscount = this._shoppingCartService.getTotalDiscountByShoppingCart(shoppingCart);
        }
      })
  }

  quantityValueChanged(value: number, product: ItemShoppingCart) {
    product.quantity = value
    this.shoppingCart.totalItems = this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart);
    this.shoppingCart.total = this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart);
    this.shoppingCart.subTotal = this._shoppingCartService.getSubTotalByShoppingCart(this.shoppingCart);
    this.shoppingCart.totalDiscount = this._shoppingCartService.getTotalDiscountByShoppingCart(this.shoppingCart);
    this._shoppingCartService.setShoppingCart(this.shoppingCart);
  }

  deleteItem(product: ItemShoppingCart) {
    this.shoppingCart.items = this.shoppingCart.items.filter(item => item.product.id !== product.product.id);
    this.shoppingCart.totalItems = this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart);
    this.shoppingCart.total = this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart);
    this.shoppingCart.subTotal = this._shoppingCartService.getSubTotalByShoppingCart(this.shoppingCart);
    this.shoppingCart.totalDiscount = this._shoppingCartService.getTotalDiscountByShoppingCart(this.shoppingCart);
    this._shoppingCartService.setShoppingCart(this.shoppingCart);
  }
}
