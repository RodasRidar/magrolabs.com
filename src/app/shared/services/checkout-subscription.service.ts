import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/env';
import {
  CheckoutSubscriptionRequest,
  CheckoutSubscriptionResponse,
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
}
