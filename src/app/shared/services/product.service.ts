import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/env';
import {
  ProductDetailResponse,
  ProductListResponse,
} from '../interfaces/product.interfaces';

/**
 * Cliente del catálogo de productos (creatinas). Reemplaza los UUIDs y
 * precios hardcodeados que antes vivían en `environments/env.ts` y en
 * componentes (verification-payment, checkout, pedidos, creatinas).
 *
 * Los slugs canónicos están en
 * `shared/constants/product-slugs.constants.ts` — usar `getBySlug` con
 * uno de ellos para resolver el `id` + `price` real desde BD.
 */
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly API_URL = `${environment.apiMagroLabs}/products`;
  private http = inject(HttpClient);

  /**
   * GET /api/v1/products/by-slug/:slug
   * Resuelve un producto canónico a partir de su slug.
   */
  getBySlug(slug: string): Observable<ProductDetailResponse> {
    return this.http
      .get<ProductDetailResponse>(`${this.API_URL}/by-slug/${slug}`)
      .pipe(catchError(error => throwError(() => error)));
  }

  /**
   * GET /api/v1/products
   * Lista paginada de productos. Útil para listados (catálogo público,
   * admin, etc).
   */
  getAll(page = 1, limit = 20, category?: string): Observable<ProductListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (category) params = params.set('category', category);

    return this.http
      .get<ProductListResponse>(this.API_URL, { params })
      .pipe(catchError(error => throwError(() => error)));
  }
}
