import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CreditTransactionService, CreditTransaction, TransactionType } from '../../../shared/services/credit-transactions.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../../shared/services/auth.service';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/env';

interface TransactionHistoryItem {
  date: Date;
  description: string;
  amount: number;
  type: TransactionType;
}

@Component({
  selector: 'app-credito',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './credito.component.html',
  styleUrl: './credito.component.css'
})
export class CreditoComponent implements OnInit {
  private _creditTransactionService = inject(CreditTransactionService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private destroy$ = new Subject<void>();

  ENV = environment;
  // Crédito disponible
  totalCredits = '0';
  isLoadingCredits = true;

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
    this.loadUserCredits();
    this.loadTransactions();

    this.destroyRef.onDestroy(() => {
      this.destroy$.next();
      this.destroy$.complete();
    });

      const nombre = this.authService.getCurrentUser()?.first_name || 'Tu amigo';
      const codigo = this.authService.getCurrentUser()?.referralCode || '';
      this.urlShared = 'https://magrolabs.com/referido-por-amigo?codigo=' + codigo + '&nombre=' + nombre;
      this.urlShared = this.urlShared.replace(/ /g, '%20');

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
    this.transactions.map(transaction => {
      const description = transaction.description || this.getDefaultDescription(transaction);
      
      if (description.toLowerCase().includes('amigo')) {
        this.invitationCredits += parseFloat(transaction.amount);
      }
    });

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
      year: undefined
    });
  }

  formatAmount(amount: number, type: TransactionType): string {
    const formatted = Math.abs(amount).toFixed(2);
    if (amount >= 0 && type === TransactionType.EARNED) {
      return `+ S/${formatted}`;
    } else {
      return `- S/${formatted}`;
    }
  }

  getAmountClass(amount: number, type: TransactionType): string {
    if (amount >= 0 && type === TransactionType.EARNED) {
      return 'text-green-700';
    } else {
      return 'text-red-700';
    }
  }
}
