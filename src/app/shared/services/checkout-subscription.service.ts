import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/env';
import {
  CheckoutSubscriptionRequest,
  CheckoutSubscriptionResponse,
  ValidateCardResponse,
} from '../interfaces/checkout-subscription.interfaces';

/**
 * Cliente del endpoint consolidado POST /api/v1/checkout/subscription.
 * Reemplaza la orquestación HTTP de 5-8 llamadas que antes hacía el
 * frontend (createOrder → chargeCustomer → createSubscription →
 * createSubscriptionOrder → updateOrderDetails → createTransaction).
 */
@Injectable({
  providedIn: 'root',
})
export class CheckoutSubscriptionService {
  private readonly API_URL = `${environment.apiMagroLabs}/checkout/subscription`;
  private http = inject(HttpClient);

  processSubscription(
    request: CheckoutSubscriptionRequest,
  ): Observable<CheckoutSubscriptionResponse> {
    return this.http.post<CheckoutSubscriptionResponse>(this.API_URL, request).pipe(
      catchError(error => throwError(() => error)),
    );
  }

  /**
   * GET /api/v1/checkout/subscription/validate-card?customerId=...
   *
   * Verifica que la tarjeta enrolada en Flow para el customer sea de
   * crédito (no débito). Flow no soporta cobro recurrente confiable de
   * tarjetas de débito; si el customer registró débito, el primer cargo
   * podría pasar pero el cobro mensual fallará después.
   *
   * El caller debe interpretar `data.allowed` + `data.reason`:
   * - `allowed: true` → continuar al pago.
   * - `allowed: false, reason: DEBIT_NOT_ALLOWED` → tarjeta de débito,
   *   pedir al cliente que registre otra de crédito.
   * - `allowed: false, reason: NO_CARD` → no se detectó tarjeta en Flow
   *   (registro falló del lado de Flow).
   * - `allowed: false, reason: UNKNOWN_PAY_MODE` → Flow devolvió un
   *   pay_mode no reconocido (raro; log + bloquear por seguridad).
   *
   * **Resiliencia**: reintentos automáticos con backoff exponencial
   * (300ms → 600ms → 1200ms). Tras 3 intentos fallidos, el error se
   * propaga al caller, que decide si bloquear o permitir continuar
   * (best-effort para no bloquear al usuario por un error transitorio).
   */
  validateCard(customerId: string): Observable<ValidateCardResponse> {
    const params = new HttpParams().set('customerId', customerId);
    return this.http
      .get<ValidateCardResponse>(`${this.API_URL}/validate-card`, { params })
      .pipe(
        retry({
          count: 2, // 1 intento original + 2 reintentos = 3 totales
          delay: (_err, retryIndex) => timer(300 * Math.pow(2, retryIndex - 1)),
          // 300ms (retry #1), 600ms (retry #2). Si los 3 fallan, propaga.
        }),
        catchError(error => throwError(() => error)),
      );
  }
}
