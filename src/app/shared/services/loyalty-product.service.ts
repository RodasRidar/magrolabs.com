import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/env';
import {
  LoyaltyProductDetailResponse,
  LoyaltyProductListResponse,
} from '../interfaces/loyalty-product.interfaces';

/**
 * Cliente de la tienda de productos canjeables por Magropuntos.
 * Reemplaza el `PRODUCTS_CONFIG` hardcodeado en
 * `loyalty-webshop/.../clothing.component.ts`.
 */
@Injectable({
  providedIn: 'root',
})
export class LoyaltyProductService {
  private readonly API_URL = `${environment.apiMagroLabs}/loyalty-products`;
  private http = inject(HttpClient);

  /** Lista todos los productos activos de la tienda. PÚBLICO. */
  getAll(): Observable<LoyaltyProductListResponse> {
    return this.http
      .get<LoyaltyProductListResponse>(this.API_URL)
      .pipe(catchError(error => throwError(() => error)));
  }

  /** Detalle de un producto por slug. PÚBLICO. */
  getBySlug(slug: string): Observable<LoyaltyProductDetailResponse> {
    return this.http
      .get<LoyaltyProductDetailResponse>(`${this.API_URL}/by-slug/${slug}`)
      .pipe(catchError(error => throwError(() => error)));
  }
}
