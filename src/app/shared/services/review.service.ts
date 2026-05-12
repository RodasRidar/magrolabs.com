import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import {
  CreateReviewRequest,
  Review,
  ReviewsResponse,
  ApproveReviewRequest,
  CanReviewResponse
} from '../interfaces/review.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiMagroLabs}/reviews`;

  /**
   * Obtener todas las reseñas
   * GET /api/v1/reviews
   */
  getAllReviews(params?: {
    product_id?: string;
    is_approved?: boolean;
    page?: number;
    per_page?: number;
  }): Observable<ReviewsResponse> {
    let httpParams = new HttpParams();
    
    if (params?.product_id) {
      httpParams = httpParams.set('product_id', params.product_id);
    }
    if (params?.is_approved !== undefined) {
      httpParams = httpParams.set('is_approved', params.is_approved.toString());
    }
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.per_page) {
      httpParams = httpParams.set('per_page', params.per_page.toString());
    }

    return this.http.get<ReviewsResponse>(this.baseUrl, { params: httpParams });
  }

  /**
   * Crear una nueva reseña
   * POST /api/v1/reviews
   */
  createReview(reviewData: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.baseUrl, reviewData);
  }

  /**
   * Obtener una reseña por ID
   * GET /api/v1/reviews/{id}
   */
  getReviewById(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/${id}`);
  }

  /**
   * Actualizar una reseña
   * PUT /api/v1/reviews/{id}
   */
  updateReview(id: string, reviewData: Partial<CreateReviewRequest>): Observable<Review> {
    return this.http.put<Review>(`${this.baseUrl}/${id}`, reviewData);
  }

  /**
   * Eliminar una reseña (soft delete)
   * DELETE /api/v1/reviews/{id}
   */
  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Aprobar o rechazar una reseña (admin)
   * PATCH /api/v1/reviews/{id}/approve
   */
  approveReview(id: string, approveData: ApproveReviewRequest): Observable<Review> {
    return this.http.patch<Review>(`${this.baseUrl}/${id}/approve`, approveData);
  }

  /**
   * Restaurar una reseña eliminada (admin)
   * PATCH /api/v1/reviews/{id}/restore
   */
  restoreReview(id: string): Observable<Review> {
    return this.http.patch<Review>(`${this.baseUrl}/${id}/restore`, {});
  }

  /**
   * Obtener reseñas por producto (método de conveniencia)
   */
  getReviewsByProduct(productId: string, onlyApproved = true): Observable<ReviewsResponse> {
    return this.getAllReviews({
      product_id: productId,
      is_approved: onlyApproved
    });
  }

  /**
   * Verificar si el usuario puede escribir una reseña para un producto
   * GET /api/v1/reviews/can-review/{product_id}
   */
  canUserReviewProduct(productId: string): Observable<CanReviewResponse> {
    return this.http
      .get<{ status: string; data: CanReviewResponse }>(`${this.baseUrl}/can-review/${productId}`)
      .pipe(map(response => response.data));
  }
} 