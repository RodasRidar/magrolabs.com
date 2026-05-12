import { Component, inject, input, InputSignal, OnInit, OnDestroy, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { ShoppingCartService } from '../../../../shared/services/cart-service.service';
import { CartComponent } from '../../../../shared/ui/cart/cart.component';
import { AuthService } from '../../../../shared/services/auth.service';
import { UserResponse } from '../../../../shared/interfaces/auth.interfaces';
import { Subscription } from 'rxjs';
import { UrgencyBarComponent } from '../../../../shared/ui/urgency-bar/urgency-bar.component';
import { BlackFridayBarComponent } from '../../../../shared/ui/black-friday-bar/black-friday-bar.component';
import { environment } from '../../../../../environments/env';

@Component({
    selector: 'app-navbar',
    imports: [CommonModule, ButtonComponent, RouterLink, NgOptimizedImage, CartComponent, RouterLinkActive, BlackFridayBarComponent, UrgencyBarComponent],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
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
export class NavbarComponent implements OnInit, OnDestroy {
  isCheckout = input.required<boolean>();
  
  private readonly _shoppingCartService = inject(ShoppingCartService);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _elementRef = inject(ElementRef);
  private readonly _cdr = inject(ChangeDetectorRef);
  private _subscriptions: Subscription[] = [];
  
  isLoading = false;
  showCart = 'inactivate';
  numItemsCart = 0;
  cartState = 'start';
  user: UserResponse | null = null;
  isAuthenticated = false;
  isUserMenuOpen = false;

  state = 'inactive';
  type = input.required<NavbarTypeEnum.ECOMMERCE | NavbarTypeEnum.LANDING | NavbarTypeEnum.BOLSA>();
  navbarTypeEnum = NavbarTypeEnum;
  static navbarTypeEnum: any;
  ENV = environment

  ngOnInit(): void {
    this._subscriptions.push(
      this._shoppingCartService.shoppingCart$.subscribe(shoppingCart => {
        this.numItemsCart = this._shoppingCartService.getTotalItemsByShoppingCart(shoppingCart);
        this.cartState = this.cartState === 'start' ? 'end' : 'start';
        setTimeout(() => {
          this.cartState = 'start';
          this._cdr.detectChanges();
        }, 500);
      }),

      this._authService.currentUser$.subscribe(user => {
        this.user = user;
        this._cdr.detectChanges();
      }),

      this._authService.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;
        this._cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this._elementRef.nativeElement.contains(event.target)) {
      this.isUserMenuOpen = false;
    }
  }

  toggleNavbar(): void {
    this.state = this.state === 'active' ? 'inactive' : 'active';
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  verCarrito(): void {
    this._shoppingCartService.toggleCart();
  }

  logout(): void {
    this._authService.logout().subscribe({
      next: () => {
        this.isUserMenuOpen = false;
        this._router.navigate(['/']);
      }
    });
  }
}

export enum NavbarTypeEnum {
  ECOMMERCE = 'ecommerce',
  LANDING = 'landing',
  BOLSA = 'bolsa'
}