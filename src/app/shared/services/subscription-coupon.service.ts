import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/env';
import {
  ValidateSubscriptionCouponRequest,
  ValidateSubscriptionCouponResponse,
} from '../interfaces/subscription-coupon.interfaces';

/**
 * Cliente del endpoint POST /api/v1/subscription-coupons/validate.
 * Endpoint público (los guests aplican cupones antes de loguearse).
 */
@Injectable({
  providedIn: 'root',
})
export class SubscriptionCouponService {
  private readonly API_URL = `${environment.apiMagroLabs}/subscription-coupons`;
  private http = inject(HttpClient);

  validateCoupon(
    request: ValidateSubscriptionCouponRequest,
  ): Observable<ValidateSubscriptionCouponResponse> {
    return this.http.post<ValidateSubscriptionCouponResponse>(`${this.API_URL}/validate`, request).pipe(
      catchError(error => throwError(() => error)),
    );
  }
}
