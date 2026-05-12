import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-product-quantity',
    imports: [],
    templateUrl: './product-quantity.component.html'
})
export class ProductQuantityComponent {
  readonly MAX_QUANTITY = 20;
  readonly MIN_QUANTITY = 1;
  @Output() quantityValue = new EventEmitter<number>();
  @Input() predeterminedQuantity = 1;
  currentQuantity = 0;
  // ngOnInit() {
  //   if (this.predeterminedQuantity === 0) {
  //     this.currentQuantity = 1
  //   } else {
  //     this.currentQuantity = this.predeterminedQuantity
  //   }
  // }

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
