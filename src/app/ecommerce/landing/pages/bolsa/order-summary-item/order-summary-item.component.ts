import { NgOptimizedImage, CurrencyPipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ItemShoppingCart, ShoppingCart } from '../../../../../shared/models/item-cart.model';
import { DiscountPipe } from '../../../../../shared/pipes/discount.pipe';
import { ShoppingCartService } from '../../../../../shared/services/cart-service.service';
import { ProductQuantityComponent } from '../../../../../shared/ui/product-quantity/product-quantity.component';

@Component({
  selector: 'app-order-summary-item',
  standalone: true,
  imports: [NgOptimizedImage, RouterLink, DiscountPipe, CurrencyPipe, ProductQuantityComponent, CommonModule],
  templateUrl: './order-summary-item.component.html'
})
export class OrderSummaryItemComponent {

  @Input() item: ItemShoppingCart = <ItemShoppingCart>{};
  @Output() quantityValueChanged = new EventEmitter<number>();
  @Output() deleteItem = new EventEmitter<ItemShoppingCart>();

  shoppingCart: ShoppingCart = <ShoppingCart>{};
  private readonly _shoppingCartService = inject(ShoppingCartService);

  state = 'active';


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

  quantityValue(value: number) {
    this.quantityValueChanged.emit(value);
  }

  deleteItemFromCart() {
    this.deleteItem.emit(this.item);
  }
}

