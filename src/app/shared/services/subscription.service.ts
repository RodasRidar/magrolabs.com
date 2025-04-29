import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/env';
import { 
  CreateSubscriptionRequest,
  PaginatedSubscriptionsResponse,
  SubscriptionResponse,
  SubscriptionStatusEnum,
  UpdateSubscriptionRequest,
  SubscriptionPlansResponse,
  SubscriptionPlanResponse,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest
} from '../interfaces/subscription.interface';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly API_URL = `${environment.apiMagroLabs}/subscriptions`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener todas las suscripciones
   * @param page Número de página
   * @param limit Límite de elementos por página
   * @param status Estado de las suscripciones a filtrar (opcional)
   */
  getAllSubscriptions(
    page: number = 1, 
    limit: number = 10, 
    status?: SubscriptionStatusEnum
  ): Observable<PaginatedSubscriptionsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedSubscriptionsResponse>(this.API_URL, { params })
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Crear una nueva suscripción
   * @param subscriptionData Datos de la suscripción
   */
  createSubscription(subscriptionData: CreateSubscriptionRequest): Observable<SubscriptionResponse> {
    return this.http.post<SubscriptionResponse>(this.API_URL, subscriptionData)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Obtener las suscripciones del usuario autenticado
   * @param page Número de página
   * @param limit Límite de elementos por página
   * @param status Estado de las suscripciones a filtrar (opcional)
   */
  getMySubscriptions(
    page: number = 1, 
    limit: number = 10, 
    status?: SubscriptionStatusEnum
  ): Observable<PaginatedSubscriptionsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedSubscriptionsResponse>(`${this.API_URL}/me`, { params })
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Obtener una suscripción por su ID
   * @param id ID de la suscripción
   */
  getSubscriptionById(id: string): Observable<SubscriptionResponse> {
    return this.http.get<SubscriptionResponse>(`${this.API_URL}/${id}`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Actualizar una suscripción
   * @param id ID de la suscripción
   * @param subscriptionData Datos a actualizar
   */
  updateSubscription(id: string, subscriptionData: UpdateSubscriptionRequest): Observable<SubscriptionResponse> {
    return this.http.put<SubscriptionResponse>(`${this.API_URL}/${id}`, subscriptionData)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Eliminar una suscripción (soft delete)
   * @param id ID de la suscripción
   */
  deleteSubscription(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/${id}`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Cancelar una suscripción
   * @param id ID de la suscripción
   */
  cancelSubscription(id: string): Observable<SubscriptionResponse> {
    return this.http.patch<SubscriptionResponse>(`${this.API_URL}/${id}/cancel`, {})
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Pausar una suscripción
   * @param id ID de la suscripción
   */
  pauseSubscription(id: string): Observable<SubscriptionResponse> {
    return this.http.patch<SubscriptionResponse>(`${this.API_URL}/${id}/pause`, {})
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Reactivar una suscripción pausada
   * @param id ID de la suscripción
   */
  reactivateSubscription(id: string): Observable<SubscriptionResponse> {
    return this.http.patch<SubscriptionResponse>(`${this.API_URL}/${id}/reactivate`, {})
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  // Métodos para gestionar planes de suscripción

  /**
   * Obtener todos los planes de suscripción
   */
  getAllSubscriptionPlans(): Observable<SubscriptionPlansResponse> {
    return this.http.get<SubscriptionPlansResponse>(`${this.API_URL}/plans`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Obtener un plan de suscripción por su ID
   * @param id ID del plan
   */
  getSubscriptionPlanById(id: string): Observable<SubscriptionPlanResponse> {
    return this.http.get<SubscriptionPlanResponse>(`${this.API_URL}/plans/${id}`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Crear un nuevo plan de suscripción
   * @param planData Datos del plan
   */
  createSubscriptionPlan(planData: CreateSubscriptionPlanRequest): Observable<SubscriptionPlanResponse> {
    return this.http.post<SubscriptionPlanResponse>(`${this.API_URL}/plans`, planData)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Actualizar un plan de suscripción
   * @param id ID del plan
   * @param planData Datos a actualizar
   */
  updateSubscriptionPlan(id: string, planData: UpdateSubscriptionPlanRequest): Observable<SubscriptionPlanResponse> {
    return this.http.put<SubscriptionPlanResponse>(`${this.API_URL}/plans/${id}`, planData)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Eliminar un plan de suscripción
   * @param id ID del plan
   */
  deleteSubscriptionPlan(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/plans/${id}`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }
} 