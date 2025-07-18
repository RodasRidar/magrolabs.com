import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/env';
import { 
  CreateOrderRequest, 
  OrderCancelResponse, 
  OrderDetailResponse, 
  OrderListResponse, 
  OrderStatus, 
  UpdateOrderStatusRequest,
  UpdateOrderDetailsRequest
} from '../interfaces/order.interfaces';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = `${environment.apiMagroLabs}/orders`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener todas las órdenes (admin)
   * @param page Número de página
   * @param limit Límite de elementos por página
   * @param status Estado de las órdenes a filtrar (opcional)
   * @param includeDeleted Incluir órdenes eliminadas (opcional)
   */
  getAllOrders(
    page: number = 1, 
    limit: number = 10, 
    status?: OrderStatus,
    includeDeleted: boolean = false
  ): Observable<OrderListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    if (includeDeleted) {
      params = params.set('includeDeleted', includeDeleted.toString());
    }

    return this.http.get<OrderListResponse>(this.API_URL, { params })
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Obtener órdenes del usuario actual
   * @param page Número de página
   * @param limit Límite de elementos por página
   * @param status Estado de las órdenes a filtrar (opcional)
   */
  getMyOrders(
    page: number = 1, 
    limit: number = 20, 
    status?: OrderStatus
  ): Observable<OrderListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status !== undefined && status !== null) {
      params = params.set('status', status);
    }

    return this.http.get<OrderListResponse>(`${this.API_URL}/my-orders`, { params })
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Obtener una orden por su ID
   * @param orderId ID de la orden
   */
  getOrderById(orderId: string): Observable<OrderDetailResponse> {
    return this.http.get<OrderDetailResponse>(`${this.API_URL}/${orderId}`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Crear una nueva orden
   * @param orderData Datos de la orden
   */
  createOrder(orderData: CreateOrderRequest): Observable<OrderDetailResponse> {
    return this.http.post<OrderDetailResponse>(this.API_URL, orderData)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Actualizar el estado de una orden (admin)
   * @param orderId ID de la orden
   * @param statusData Datos del nuevo estado
   */
  updateOrderStatus(orderId: string, statusData: UpdateOrderStatusRequest): Observable<OrderDetailResponse> {
    return this.http.patch<OrderDetailResponse>(`${this.API_URL}/${orderId}/status`, statusData)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Cancelar una orden
   * @param orderId ID de la orden
   */
  cancelOrder(orderId: string): Observable<OrderCancelResponse> {
    return this.http.patch<OrderCancelResponse>(`${this.API_URL}/${orderId}/cancel`, {})
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Verificar si existe una dirección (método auxiliar)
   * @param addressId ID de la dirección
   */
  checkAddressExists(addressId: string): Observable<boolean> {
    return this.http.get<{ exists: boolean }>(`${environment.apiMagroLabs}/addresses/check/${addressId}`)
      .pipe(
        map(response => response.exists),
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Obtener el historial de estados de una orden
   * @param orderId ID de la orden
   */
  getOrderStatusHistory(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${orderId}/history`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Buscar órdenes por término de búsqueda (admin)
   * @param term Término de búsqueda
   * @param page Número de página
   * @param limit Límite de elementos por página
   */
  searchOrders(term: string, page: number = 1, limit: number = 10): Observable<OrderListResponse> {
    let params = new HttpParams()
      .set('term', term)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<OrderListResponse>(`${this.API_URL}/search`, { params })
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Obtener estadísticas de órdenes (admin)
   */
  getOrderStats(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/stats`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Actualizar detalles de una orden
   * @param orderId ID de la orden
   * @param orderDetails Detalles de la orden a actualizar
   */
  updateOrderDetails(orderId: string, orderDetails: UpdateOrderDetailsRequest): Observable<OrderDetailResponse> {
    return this.http.put<OrderDetailResponse>(`${this.API_URL}/${orderId}/details`, orderDetails)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }
} 