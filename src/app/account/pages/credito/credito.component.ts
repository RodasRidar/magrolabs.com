import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CreditTransactionService, CreditTransaction, TransactionType } from '../../../shared/services/credit-transactions.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../../shared/services/auth.service';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/env';
import { LoyaltyService } from '../../../shared/services/loyalty.service';
import { LoyaltyTier, LoyaltyTierImageRoutes } from '../../../shared/interfaces/loyalty.interfaces';
import { SeoService } from '../../../shared/services/seo.service';
import { LinkButtonComponent } from '../../../shared/ui/link-button/link-button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';

interface TransactionHistoryItem {
  date: Date;
  description: string;
  amount: number;
  type: TransactionType;
}

@Component({
  selector: 'app-credito',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LinkButtonComponent, CardComponent, PageHeaderComponent, SpinnerComponent],
  templateUrl: './credito.component.html',
  styleUrl: './credito.component.css'
})
export class CreditoComponent implements OnInit {
  private _creditTransactionService = inject(CreditTransactionService);
  private _loyaltyService = inject(LoyaltyService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private destroy$ = new Subject<void>();
  private _seoService = inject(SeoService);

  ENV = environment;
  // Crédito disponible
  totalCredits = '0';
  totalEarningsCredits = 0;
  isLoadingCredits = true;

  // Tier y imagen dinámica
  tierImageRoutes: LoyaltyTierImageRoutes | null = null;
  tierDisplayName = signal<string>('Carbon');
  isLoadingTier = true;

  // Control de visibilidad del card de promoción de Instagram
  showInstagramPromoCard = signal<boolean>(false);

  // Historial de transacciones
  transactions: CreditTransaction[] = [];
  transactionHistory: TransactionHistoryItem[] = [];
  isLoadingTransactions = true;

  // Invitaciones
  invitationCredits = 0;
  isLoadingInvitations = false;
  maxInvitationCredits = 20;

  // Ambiente
  env = environment;

  // Estados
  hasInvitationError = false;
  invitationSuccess = false;
  copiedToClipboard = false;
  urlShared = '';

  ngOnInit(): void {
    // Configuración SEO para página de créditos de usuario
    this.configureSEO();
    
    this.loadUserCredits();
    this.loadTransactions();
    this.loadUserTier();

    this.destroyRef.onDestroy(() => {
      this.destroy$.next();
      this.destroy$.complete();
    });

      const nombre = this.authService.getCurrentUser()?.first_name || 'Tu amigo';
      const codigo = this.authService.getCurrentUser()?.referralCode || '';
      this.urlShared = 'https://magrolabs.com/referido-por-amigo?codigo=' + codigo + '&nombre=' + nombre;
      this.urlShared = this.urlShared.replace(/ /g, '%20');

  }

  /**
   * Configura los metadatos SEO para la página de créditos de usuario.
   * Esta página no debe ser indexada por los motores de búsqueda debido a que contiene
   * información privada del usuario sobre sus créditos y transacciones.
   */
  private configureSEO(): void {
    // Establecer el título de la página
    this._seoService.setTitle('Mis Magropuntos | Magrolabs');
    
    // Configurar para que no sea indexada por robots
    this._seoService.setIndexFollow(false);
    
    // Establecer descripción (aunque no se indexe, es buena práctica)
    this._seoService.setDescription('Panel de Magropuntos y transacciones de usuario de Magrolabs. Acceso restringido.');
    
    // Configurar meta robots adicionales para mayor seguridad
    this._seoService.meta.updateTag({ name: 'robots', content: 'noindex,nofollow,noarchive,nosnippet,noimageindex' });
    
    // Configurar X-Robots-Tag para mayor protección
    this._seoService.meta.updateTag({ name: 'X-Robots-Tag', content: 'noindex,nofollow' });
    
    // Evitar caché del contenido en buscadores
    this._seoService.meta.updateTag({ name: 'cache-control', content: 'no-cache, no-store, must-revalidate' });
    this._seoService.meta.updateTag({ name: 'pragma', content: 'no-cache' });
    this._seoService.meta.updateTag({ name: 'expires', content: '0' });
  }

  private loadUserCredits(): void {
    this.isLoadingCredits = true;
    const userId = this.getLoggedUserId();
    
    if (userId) {
      this._creditTransactionService.getTotalCredits(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
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

  private loadTransactions(): void {
    this.isLoadingTransactions = true;
    const userId = this.getLoggedUserId();
    
    if (userId) {
      this._creditTransactionService.getTransactionsByUser(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response?.data?.transactions) {
              this.transactions = response.data.transactions;
              this.processTransactionHistory();
            }
            this.isLoadingTransactions = false;
          },
          error: (error) => {
            console.error('Error al obtener transacciones del usuario:', error);
            this.isLoadingTransactions = false;
          }
        });
    } else {
      this.isLoadingTransactions = false;
    }
  }

  private processTransactionHistory(): void {
    // Variable para verificar si ya participó en la promoción de Instagram
    let hasInstagramPromo = false;

    this.transactions.map(transaction => {
      const description = transaction.description || this.getDefaultDescription(transaction);
      
      if (description.toLowerCase().includes('amigo')) {
        this.invitationCredits += parseFloat(transaction.amount);
      }

      // Verificar si existe una transacción con "Compartir tu creatina en Instagram"
      if (description.toLowerCase().includes('compartir tu creatina en instagram')) {
        hasInstagramPromo = true;
      }
    });

    // Actualizar el signal: mostrar card solo si NO ha participado en la promo
    this.showInstagramPromoCard.set(!hasInstagramPromo);

    this.transactionHistory = this.transactions.map(transaction => {
      return {
        date: new Date(transaction.created_at),
        description: transaction.description || this.getDefaultDescription(transaction),
        amount: parseFloat(transaction.amount),
        type: transaction.type
      };
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private getDefaultDescription(transaction: CreditTransaction): string {
    if (transaction.type === TransactionType.EARNED) {
      if (transaction.source) {
        return `Crédito obtenido por ${transaction.source}`;
      }
      return '¡Bienvenido al club!';
    } else {
      return 'Crédito utilizado en compra';
    }
  }


  copyInvitationLink(): void {
    navigator.clipboard.writeText(this.urlShared).then(() => {
      this.copiedToClipboard = true;
      setTimeout(() => {
        this.copiedToClipboard = false;
      }, 3000);
    });
  }

  private getLoggedUserId(): string {
    return this.authService.getCurrentUser()?.id || '';
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatAmount(amount: number, type: TransactionType): string {
    const formatted = Math.abs(amount).toFixed(0);
    if (amount >= 0 && type === TransactionType.EARNED) {
      return `+ ${formatted} MP`;
    } else {
      return `- ${formatted} MP`;
    }
  }

  getAmountClass(amount: number, type: TransactionType): string {
    if (amount >= 0 && type === TransactionType.EARNED) {
      return 'text-green-700';
    } else {
      return 'text-red-700';
    }
  }

  private loadUserTier(): void {
    this.isLoadingTier = true;
    const userId = this.getLoggedUserId();
    
    if (userId) {
      this._loyaltyService.getUserTierInfo(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (tierInfo) => {
            this.tierImageRoutes = tierInfo.imageRoutes;
            this.tierDisplayName.set(tierInfo.displayName);
            this.totalEarningsCredits = tierInfo.tierData.totalEarnedCredits;
            this.isLoadingTier = false;
          },
          error: (error) => {
            console.error('Error al obtener tier del usuario:', error);
            // Mantener valores por defecto en caso de error
            this.tierImageRoutes = null;
            this.tierDisplayName.set('Carbon');
            this.totalEarningsCredits = 0;
            this.isLoadingTier = false;
          }
        });
    } else {
      this.isLoadingTier = false;
    }
  }
}
