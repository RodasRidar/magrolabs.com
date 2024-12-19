import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'discount',
  standalone: true
})

export class DiscountPipe implements PipeTransform {
  transform(price: number, discount: number): number {
    if (price && discount) {
      const discountedPrice = price - (price * discount) / 100;
      return discountedPrice;
    }
    return price;
  }
}
