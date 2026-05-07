import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/env';
import {
  CheckoutRequest,
  CheckoutResponse,
  PrepareCardRequest,
  PrepareCardResponse,
} from '../interfaces/checkout.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private readonly API_URL = `${environment.apiMagroLabs}/checkout`;
  private http = inject(HttpClient);

  /**
   * POST /api/v1/checkout — endpoint consolidado.
   * Bifurca según payment.mode:
   *   - 'PORTAL' (default): backend hace payment/create y devuelve url+token
   *     para redirigir al cliente al portal de Flow.
   *   - 'CHARGE': backend hace customer/charge síncrono. La respuesta NO trae
   *     payment.url; trae charge con el flowOrder cobrado.
   *
   * Si el usuario está autenticado (interceptor agrega Authorization), el
   * backend hace updateUser; si no, hace register o auto-login con el
   * password del form.
   */
  processCheckout(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(this.API_URL, request).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * POST /api/v1/checkout/prepare-card — prepara el enrolamiento de tarjeta.
   * Devuelve { customerId, token, url } para que el frontend monte el widget
   * de Flow Elements (FlowWidgetAddCardComponent).
   *
   * - Con JWT: usa el flowCustomerId del user (lo crea en Flow si no existe).
   * - Sin JWT (guest): valida email no duplicado y crea customer Flow efímero.
   */
  prepareCard(request: PrepareCardRequest): Observable<PrepareCardResponse> {
    return this.http.post<PrepareCardResponse>(`${this.API_URL}/prepare-card`, request).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
