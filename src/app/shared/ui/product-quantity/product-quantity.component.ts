import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'app-product-quantity',
    imports: [IconComponent],
    templateUrl: './product-quantity.component.html'
})
export class ProductQuantityComponent {
  readonly MAX_QUANTITY = 20;
  readonly MIN_QUANTITY = 1;
  @Output() quantityValue = new EventEmitter<number>();
  @Input() predeterminedQuantity = 1;
  currentQuantity = 0;

  ngOnChanges() {
    this.currentQuantity = this.predeterminedQuantity
  }

  incrementQuantity() {
    this.currentQuantity = this.currentQuantity <= this.MAX_QUANTITY ? this.currentQuantity + 1 : this.MAX_QUANTITY;
    this.emitValue()
  }

  decrementQuantity() {
    this.currentQuantity = this.currentQuantity >= 1 ? this.currentQuantity - 1 : this.MIN_QUANTITY;
    this.emitValue()
  }

  emitValue() {
    this.quantityValue.emit(this.currentQuantity);
  }

  onQuantityChange(event: Event){
    const inputElement = event.target as HTMLInputElement;
    let value = Number(inputElement.value);

    if (value > this.MAX_QUANTITY) {
      value = this.MAX_QUANTITY;
    } else if (value < this.MIN_QUANTITY) {
      value = this.MIN_QUANTITY;
    }

    this.currentQuantity = value;
  }
}
