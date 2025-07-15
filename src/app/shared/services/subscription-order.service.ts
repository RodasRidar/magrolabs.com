import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/env';
import { 
  CreateSubscriptionOrderRequest,
  UpdateSubscriptionOrderRequest,
  UpdateSubscriptionOrderStatusRequest,
  PaginatedSubscriptionOrdersResponse,
  SubscriptionOrderResponse
} from '../interfaces/subscription-order.interface';
import { OrderStatus } from '../interfaces/order.interfaces';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionOrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiMagroLabs}/subscription-orders`;

  /**
   * Obtiene todas las órdenes de suscripción con opciones de paginación y filtrado
   * 
   * @param page Número de página
   * @param limit Cantidad de elementos por página
   * @param includeDeleted Incluir elementos eliminados
   * @param subscriptionId Filtrar por ID de suscripción
   * @param status Filtrar por estado
   * @returns Observable con los resultados paginados
   */
  getAllSubscriptionOrders(
    page = 1,
    limit = 10,
    includeDeleted = false,
    subscriptionId?: string,
    status?: OrderStatus
  ): Observable<PaginatedSubscriptionOrdersResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('includeDeleted', includeDeleted.toString());

    if (subscriptionId) {
      params = params.set('subscriptionId', subscriptionId);
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedSubscriptionOrdersResponse>(this.apiUrl, { params })
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Obtiene una orden de suscripción específica por su ID
   * 
   * @param id ID de la orden de suscripción
   * @returns Observable con la información de la orden
   */
  getSubscriptionOrderById(id: string): Observable<SubscriptionOrderResponse> {
    return this.http.get<SubscriptionOrderResponse>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Obtiene todas las órdenes asociadas a una suscripción específica
   * 
   * @param subscriptionId ID de la suscripción
   * @param page Número de página
   * @param limit Cantidad de elementos por página
   * @returns Observable con los resultados paginados
   */
  getOrdersBySubscriptionId(
    subscriptionId: string,
    page = 1,
    limit = 10
  ): Observable<PaginatedSubscriptionOrdersResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedSubscriptionOrdersResponse>(
      `${this.apiUrl}/subscription/${subscriptionId}`,
      { params }
    ).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Crea una nueva orden de suscripción
   * 
   * @param data Datos para crear la orden
   * @returns Observable con la orden creada
   */
  createSubscriptionOrder(data: CreateSubscriptionOrderRequest): Observable<SubscriptionOrderResponse> {
    return this.http.post<SubscriptionOrderResponse>(this.apiUrl, data)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Actualiza una orden de suscripción existente
   * 
   * @param id ID de la orden a actualizar
   * @param data Datos para actualizar
   * @returns Observable con la orden actualizada
   */
  updateSubscriptionOrder(id: string, data: UpdateSubscriptionOrderRequest): Observable<SubscriptionOrderResponse> {
    return this.http.put<SubscriptionOrderResponse>(`${this.apiUrl}/${id}`, data)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Actualiza el estado de una orden de suscripción
   * 
   * @param id ID de la orden
   * @param statusData Datos del estado a actualizar
   * @returns Observable con la orden actualizada
   */
  updateSubscriptionOrderStatus(
    id: string, 
    statusData: UpdateSubscriptionOrderStatusRequest
  ): Observable<SubscriptionOrderResponse> {
    return this.http.patch<SubscriptionOrderResponse>(
      `${this.apiUrl}/${id}/status`,
      statusData
    ).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Elimina una orden de suscripción (soft delete)
   * 
   * @param id ID de la orden a eliminar
   * @returns Observable de la operación
   */
  deleteSubscriptionOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }
} 