import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { UserService } from '../shared/services/user.service';
import { UserDetailResponse } from '../shared/interfaces/user.interfaces';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [],
  templateUrl: './account.component.html',
})
export class AccountComponent {
  private _router = inject(Router);
  private _authService = inject(AuthService);
  private _userService = inject(UserService);

  user: UserDetailResponse | null = null;
  isUserMenuOpen = false;
  isMobileMenuOpen = false;
  subscription: any = null;
  lastOrder: any = null;

  ngOnInit() {
    //this.loadUserData();
    //this.loadSubscriptionData();
    //this.loadLastOrder();
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout() {
    this._authService.logout().subscribe({
      next: () => {
        this._router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
      }
    });
  }

  private loadUserData() {
    this._userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (error) => {
        console.error('Error al cargar datos del usuario:', error);
      }
    });
  }

  private loadSubscriptionData() {
    // TODO: Implementar carga de datos de suscripción
    this.subscription = {
      status: 'Activa'
    };
  }

  private loadLastOrder() {
    // TODO: Implementar carga del último pedido
    this.lastOrder = {
      status: 'En proceso'
    };
  }
}
