import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/env';
import { CheckoutRequest, CheckoutResponse } from '../interfaces/checkout.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private readonly API_URL = `${environment.apiMagroLabs}/checkout`;
  private http = inject(HttpClient);

  /**
   * Llama al endpoint consolidado POST /api/v1/checkout. El backend ejecuta
   * usuario + dirección + orden en una transacción y luego inicia el pago en
   * Flow. Si Flow falla, la orden se soft-deletea y el endpoint devuelve 502.
   *
   * Si el usuario está autenticado (interceptor agrega Authorization), el
   * backend hace updateUser; si no, hace register.
   */
  processCheckout(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(this.API_URL, request).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
