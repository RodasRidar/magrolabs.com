import { Component, OnInit, inject, HostListener } from '@angular/core';
import { Router, RouterLinkActive, RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { UserService } from '../shared/services/user.service';
import { UserDetailResponse } from '../shared/interfaces/user.interfaces';
import { CommonModule } from '@angular/common';
import { CreditTransactionService } from '../shared/services/credit-transactions.service';
import { LoyaltyService } from '../shared/services/loyalty.service';
import { LoyaltyTierImageRoutes } from '../shared/interfaces/loyalty.interfaces';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit {
  private _router = inject(Router);
  private _authService = inject(AuthService);
  private _userService = inject(UserService);
  private _creditTransactionService = inject(CreditTransactionService);
  private _loyaltyService = inject(LoyaltyService);

  user: UserDetailResponse | null = null;
  isMobileMenuOpen = false;
  subscription: any = null;
  lastOrder: any = null;
  loyaltyPoints = 10;
  loyaltyProgressWidth = '0%';
  maxLoyaltyPoints = 200;
  totalCredits = '0';
  isLoadingCredits = true;
  
  // Tier y imagen dinámica
  tierImageRoutes: LoyaltyTierImageRoutes | null = null;
  tierDisplayName = 'MagroPoints';
  isLoadingTier = true;

  ngOnInit() {
    this.loadUserData();
    
    // Iniciar con 0% y luego animar hasta el porcentaje actual
    setTimeout(() => {
      this.loyaltyProgressWidth = this.calculateProgressPercentage() + '%';
    }, 500);
  }

  calculateProgressPercentage(): number {
    return (this.loyaltyPoints / this.maxLoyaltyPoints) * 100;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Prevenir scroll del body cuando el menú está abierto
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.querySelector('[aria-controls="mobile-menu"]');
    
    // Cerrar menú móvil si se hace clic fuera del menú y del botón
    if (this.isMobileMenuOpen && 
        mobileMenu && 
        !mobileMenu.contains(target) && 
        mobileMenuButton && 
        !mobileMenuButton.contains(target)) {
      this.closeMobileMenu();
    }
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
        // Cargar créditos y tier después de obtener el usuario
        this.loadUserCredits();
        this.loadUserTier();
      },
      error: (error) => {
        console.error('Error al cargar datos del usuario:', error);
      }
    });
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

  private loadUserTier() {
    this.isLoadingTier = true;
    const userId = this.user?.id;
    
    if (userId) {
      this._loyaltyService.getUserTierInfo(userId).subscribe({
        next: (tierInfo) => {
          this.tierImageRoutes = tierInfo.imageRoutes;
          this.tierDisplayName = tierInfo.displayName;
          this.isLoadingTier = false;
        },
        error: (error) => {
          console.error('Error al obtener tier del usuario:', error);
          // Mantener valores por defecto en caso de error
          this.tierImageRoutes = null;
          this.tierDisplayName = 'MagroPoints';
          this.isLoadingTier = false;
        }
      });
    } else {
      this.isLoadingTier = false;
    }
  }
}
