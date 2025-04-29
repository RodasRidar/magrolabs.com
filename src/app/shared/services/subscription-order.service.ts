import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/env';
import { 
  CreateSubscriptionOrderRequest,
  OrderStatusEnum,
  PaginatedSubscriptionOrdersResponse,
  SubscriptionOrderResponse,
  UpdateSubscriptionOrderRequest,
  UpdateSubscriptionOrderStatusRequest
} from '../interfaces/subscription-order.interface';
import { SubscriptionOrder, SubscriptionOrderStatus } from '../models/subscription-order.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionOrderService {
  private readonly API_URL = `${environment.apiMagroLabs}/subscription-orders`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener todas las órdenes de suscripción
   * @param page Número de página
   * @param limit Límite de elementos por página
   * @param status Estado de las órdenes a filtrar (opcional)
   */
  getAllSubscriptionOrders(
    page: number = 1, 
    limit: number = 10, 
    status?: OrderStatusEnum
  ): Observable<PaginatedSubscriptionOrdersResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedSubscriptionOrdersResponse>(this.API_URL, { params })
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Crear una nueva orden de suscripción
   * @param orderData Datos de la orden de suscripción
   */
  createSubscriptionOrder(orderData: CreateSubscriptionOrderRequest): Observable<SubscriptionOrderResponse> {
    return this.http.post<SubscriptionOrderResponse>(this.API_URL, orderData)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Obtener una orden de suscripción por su ID
   * @param id ID de la orden de suscripción
   */
  getSubscriptionOrderById(id: string): Observable<SubscriptionOrderResponse> {
    return this.http.get<SubscriptionOrderResponse>(`${this.API_URL}/${id}`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Actualizar una orden de suscripción
   * @param id ID de la orden de suscripción
   * @param orderData Datos a actualizar
   */
  updateSubscriptionOrder(id: string, orderData: UpdateSubscriptionOrderRequest): Observable<SubscriptionOrderResponse> {
    return this.http.put<SubscriptionOrderResponse>(`${this.API_URL}/${id}`, orderData)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Eliminar una orden de suscripción (soft delete)
   * @param id ID de la orden de suscripción
   */
  deleteSubscriptionOrder(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/${id}`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Obtener órdenes por ID de suscripción
   * @param subscriptionId ID de la suscripción
   * @param page Número de página
   * @param limit Límite de elementos por página
   */
  getOrdersBySubscriptionId(
    subscriptionId: string,
    page: number = 1,
    limit: number = 10
  ): Observable<PaginatedSubscriptionOrdersResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedSubscriptionOrdersResponse>(
      `${this.API_URL}/subscription/${subscriptionId}`,
      { params }
    ).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Actualizar el estado de una orden de suscripción
   * @param id ID de la orden de suscripción
   * @param statusData Datos del nuevo estado
   */
  updateSubscriptionOrderStatus(
    id: string, 
    statusData: UpdateSubscriptionOrderStatusRequest
  ): Observable<SubscriptionOrderResponse> {
    return this.http.patch<SubscriptionOrderResponse>(
      `${this.API_URL}/${id}/status`,
      statusData
    ).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getAll(): Observable<SubscriptionOrder[]> {
    return this.http.get<SubscriptionOrder[]>(this.API_URL);
  }

  getById(id: string): Observable<SubscriptionOrder> {
    return this.http.get<SubscriptionOrder>(`${this.API_URL}/${id}`);
  }

  getBySubscriptionId(subscriptionId: string): Observable<SubscriptionOrder[]> {
    return this.http.get<SubscriptionOrder[]>(`${this.API_URL}/subscription/${subscriptionId}`);
  }

  create(order: Partial<SubscriptionOrder>): Observable<SubscriptionOrder> {
    return this.http.post<SubscriptionOrder>(this.API_URL, order);
  }

  update(id: string, order: Partial<SubscriptionOrder>): Observable<SubscriptionOrder> {
    return this.http.put<SubscriptionOrder>(`${this.API_URL}/${id}`, order);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  updateStatus(id: string, status: SubscriptionOrderStatus): Observable<SubscriptionOrder> {
    return this.http.patch<SubscriptionOrder>(`${this.API_URL}/${id}/status`, { status });
  }
} 