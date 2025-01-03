import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ItemShoppingCart, ShoppingCart } from '../../../../shared/models/item-cart.model';
import { ShoppingCartService } from '../../../../shared/services/cart-service.service';
import { CurrencyPipe } from '@angular/common';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent, NavbarTypeEnum } from '../../components/navbar/navbar.component';
import { OrderSummaryItemComponent } from './order-summary-item/order-summary-item.component';

@Component({
  selector: 'app-bolsa',
  standalone: true,
  imports: [RouterLink, FooterComponent, NavbarComponent, OrderSummaryItemComponent, CurrencyPipe, ButtonComponent],
  templateUrl: './bolsa.component.html'
})
export class BolsaComponent {
  navbarTypeEnum = NavbarTypeEnum;
  state = 'active';
  private _shoppingCartService = inject(ShoppingCartService);

  shoppingCart: ShoppingCart = <ShoppingCart>{};

  ngOnInit() {
    this._shoppingCartService.cartState$.subscribe(state => {
      state ? this.state = 'active' : this.state = 'inactive';
    });

    this._shoppingCartService.shoppingCart$.subscribe(shoppingCart => {
      if (shoppingCart && shoppingCart.items.length > 0) {
        this.shoppingCart = shoppingCart;
        this.shoppingCart.totalItems = this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart);
        this.shoppingCart.total = this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart);
        this.shoppingCart.subTotal = this._shoppingCartService.getSubTotalByShoppingCart(this.shoppingCart);
        this.shoppingCart.totalDiscount = this._shoppingCartService.getTotalDiscountByShoppingCart(this.shoppingCart);
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
