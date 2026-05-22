import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/env';
import {
  ValidateCouponRequest,
  ValidateCouponResponse,
} from '../interfaces/coupon.interfaces';

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  private readonly API_URL = `${environment.apiMagroLabs}/coupons`;
  private http = inject(HttpClient);

  /**
   * POST /api/v1/coupons/validate — endpoint público.
   * Valida un código de cupón contra el carrito y devuelve `discount_amount`
   * resuelto en soles. NO consume el cupón (no incrementa current_uses);
   * eso lo hace el backend dentro de la tx del checkout cuando se persiste
   * la orden.
   */
  validateCoupon(request: ValidateCouponRequest): Observable<ValidateCouponResponse> {
    return this.http.post<ValidateCouponResponse>(`${this.API_URL}/validate`, request).pipe(
      catchError(error => throwError(() => error)),
    );
  }
}
