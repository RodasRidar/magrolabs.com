import { Component, inject, input, InputSignal } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { ShoppingCartService } from '../../../../shared/services/cart-service.service';
import { CartComponent } from '../../../../shared/ui/cart/cart.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,ButtonComponent, RouterLink, NgOptimizedImage, CartComponent],
  templateUrl: './navbar.component.html',
  animations: [
    trigger('fadeInOut', [
      state('inactive', style({
        opacity: 0,
        transform: 'translateY(-100%)'
      })),
      state('active', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('inactive => active', [
        animate('200ms ease-in-out')
      ]),
      transition('active => inactive', [
        animate('200ms ease-in-out')
      ])
    ]),
    trigger('cartAnimation', [
      state('start', style({ transform: 'scale(1)' })),
      state('end', style({ transform: 'scale(1.2)' })),
      transition('start => end', [
        animate('0.5s ease')
      ]),
      transition('end => start', [
        animate('0.5s ease')
      ])
      
    ])
  ]
})


export class NavbarComponent {
  isCheckout = input.required<boolean>();
  private _shoppingCartService = inject(ShoppingCartService);
  isLoading: boolean = false;
  showCart = 'inactivate'
  numItemsCart = 0
  cartState = 'start';

  state = 'inactive';
  type = input.required<NavbarTypeEnum.ECOMMERCE | NavbarTypeEnum.LANDING>()
  navbarTypeEnum = NavbarTypeEnum;

  ngOnInit(): void {

    this._shoppingCartService.shoppingCart$.subscribe(shoppingCart => {

      this.numItemsCart = this._shoppingCartService.getTotalItemsByShoppingCart(shoppingCart);
      this.cartState = this.cartState === 'start' ? 'end' : 'start';
      setTimeout(() => {
        this.cartState = 'start';
      }, 500); 
    })

  }

  toggleNavbar(): void {
    this.state = this.state === 'active' ? 'inactive' : 'active';
  }

  verCarrito(){
    this._shoppingCartService.toggleCart();
  }
}

export enum NavbarTypeEnum {
  ECOMMERCE = 'ecommerce',
  LANDING = 'landing'
}