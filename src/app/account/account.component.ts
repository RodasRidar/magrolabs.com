import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLinkActive, RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { UserService } from '../shared/services/user.service';
import { UserDetailResponse } from '../shared/interfaces/user.interfaces';
import { CommonModule } from '@angular/common';
import { CreditTransactionService } from '../shared/services/credit-transactions.service';
import { TooltipComponent } from '../shared/ui/tooltip/tooltip.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive, TooltipComponent],
  templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit {
  private _router = inject(Router);
  private _authService = inject(AuthService);
  private _userService = inject(UserService);
  private _creditTransactionService = inject(CreditTransactionService);

  user: UserDetailResponse | null = null;
  isUserMenuOpen = false;
  isMobileMenuOpen = false;
  subscription: any = null;
  lastOrder: any = null;
  loyaltyPoints = 10;
  loyaltyProgressWidth = '0%';
  maxLoyaltyPoints = 200;
  totalCredits = '0';
  isLoadingCredits = true;

  ngOnInit() {
    this.loadUserData();
    this.loadSubscriptionData();
    this.loadLastOrder();
    
    // Iniciar con 0% y luego animar hasta el porcentaje actual
    setTimeout(() => {
      this.loyaltyProgressWidth = this.calculateProgressPercentage() + '%';
    }, 500);
  }

  calculateProgressPercentage(): number {
    return (this.loyaltyPoints / this.maxLoyaltyPoints) * 100;
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
        console.log('user', user);
        this.user = user;
        // Cargar créditos después de obtener el usuario
        this.loadUserCredits();
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

  private loadUserCredits() {
    this.isLoadingCredits = true;
    const userId = this.user?.id;
    
    if (userId) {
      this._creditTransactionService.getTotalCredits(userId).subscribe({
        next: (response) => {
          if (response?.data?.totalCredits) {
            this.totalCredits = response.data.totalCredits;
          }
          this.isLoadingCredits = false;
        },
        error: (error) => {
          console.error('Error al obtener créditos del usuario:', error);
          this.isLoadingCredits = false;
        }
      });
    } else {
      this.isLoadingCredits = false;
    }
  }
}
