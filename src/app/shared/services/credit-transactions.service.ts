import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';

export enum TransactionType {
  EARNED = 'EARNED',
  USED = 'USED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  PAGO_EFECTIVO = 'PAGO_EFECTIVO',
  YAPE = 'YAPE'
}

// Modelo principal de transacción
export interface CreditTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  source?: PaymentMethod;
  amount: string; // Decimal como string
  description?: string;
  created_at: string;
  updated_at: string;
  is_delete: boolean;
}

// Interfaces para solicitudes
export interface CreateCreditTransactionRequest {
  user_id: string;
  type: TransactionType;
  source?: PaymentMethod;
  amount: number;
  description?: string;
}

// Interfaces para respuestas
export interface ApiResponse<T> {
  status: string;
  data: T;
}

export interface TransactionResponse {
  transaction: CreditTransaction;
}

export interface TransactionsListResponse {
  transactions: CreditTransaction[];
}

export interface TotalCreditsResponse {
  totalCredits: string;
}

@Injectable({
  providedIn: 'root'
})
export class CreditTransactionService {
  private readonly apiUrl = `${environment.apiMagroLabs}/credit-transactions`;
  private http = inject(HttpClient);

  /**
   * Crea una nueva transacción de crédito
   */
  createTransaction(data: CreateCreditTransactionRequest): Observable<ApiResponse<TransactionResponse>> {
    return this.http.post<ApiResponse<TransactionResponse>>(this.apiUrl, data);
  }

  /**
   * Obtiene todas las transacciones de un usuario
   */
  getTransactionsByUser(userId: string): Observable<ApiResponse<TransactionsListResponse>> {
    return this.http.get<ApiResponse<TransactionsListResponse>>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Obtiene una transacción por ID
   */
  getTransactionById(id: string): Observable<ApiResponse<TransactionResponse>> {
    return this.http.get<ApiResponse<TransactionResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Elimina una transacción (soft delete)
   */
  deleteTransaction(id: string): Observable<ApiResponse<TransactionResponse>> {
    return this.http.delete<ApiResponse<TransactionResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene el total de créditos de un usuario
   */
  getTotalCredits(userId: string): Observable<ApiResponse<TotalCreditsResponse>> {
    return this.http.get<ApiResponse<TotalCreditsResponse>>(`${this.apiUrl}/user/${userId}/total`);
  }
} 