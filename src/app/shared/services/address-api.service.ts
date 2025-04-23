import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/env';
import { 
  AddressDetailResponse, 
  AddressListResponse, 
  CreateAddressRequest, 
  UpdateAddressRequest 
} from '../interfaces/address.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AddressApiService {
  private readonly API_URL = `${environment.apiMagroLabs}/addresses`;

  constructor(private http: HttpClient) { }

  /**
   * Crear una nueva dirección
   * @param addressData Datos de la dirección
   */
  createAddress(addressData: CreateAddressRequest): Observable<AddressDetailResponse> {
    return this.http.post<AddressDetailResponse>(this.API_URL, addressData)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Obtener una dirección por ID
   * @param addressId ID de la dirección
   */
  getAddressById(addressId: string): Observable<AddressDetailResponse> {
    return this.http.get<AddressDetailResponse>(`${this.API_URL}/${addressId}`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Obtener todas las direcciones
   */
  getAddresses(): Observable<AddressListResponse> {
    return this.http.get<AddressListResponse>(this.API_URL)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Obtener direcciones de un usuario
   * @param userId ID del usuario
   */
  getUserAddresses(userId: string): Observable<AddressListResponse> {
    return this.http.get<AddressListResponse>(`${this.API_URL}/user/${userId}`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Actualizar una dirección
   * @param addressId ID de la dirección
   * @param addressData Datos a actualizar
   */
  updateAddress(addressId: string, addressData: UpdateAddressRequest): Observable<AddressDetailResponse> {
    return this.http.put<AddressDetailResponse>(`${this.API_URL}/${addressId}`, addressData)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Eliminar una dirección
   * @param addressId ID de la dirección
   */
  deleteAddress(addressId: string): Observable<boolean> {
    return this.http.delete<{status: string, message: string}>(`${this.API_URL}/${addressId}`)
      .pipe(
        map(response => response.status === 'success'),
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Asignar una dirección a un usuario
   * @param addressId ID de la dirección
   * @param userId ID del usuario
   
  assignAddressToUser(addressId: string, userId: string): Observable<AddressDetailResponse> {
    return this.http.post<AddressDetailResponse>(`${this.API_URL}/${addressId}/assign/${userId}`, {})
      .pipe(
        catchError(error => throwError(() => error))
      );
  }*/

  /**
   * Desasignar una dirección de un usuario
   * @param addressId ID de la dirección
   * @param userId ID del usuario
   */
  unassignAddressFromUser(addressId: string, userId: string): Observable<boolean> {
    return this.http.delete<{status: string, message: string}>(`${this.API_URL}/${addressId}/unassign/${userId}`)
      .pipe(
        map(response => response.status === 'success'),
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Establecer una dirección como predeterminada para un usuario
   * @param addressId ID de la dirección
   * @param userId ID del usuario
   */
  setDefaultAddress(addressId: string, userId: string): Observable<AddressDetailResponse> {
    return this.http.post<AddressDetailResponse>(`${this.API_URL}/${addressId}/default/${userId}`, {})
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Obtener la dirección predeterminada de un usuario
   * @param userId ID del usuario
   */
  getUserDefaultAddress(userId: string): Observable<AddressDetailResponse> {
    return this.http.get<AddressDetailResponse>(`${this.API_URL}/default/${userId}`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Validar si una dirección existe
   * @param addressData Datos de la dirección a validar
   */
  validateAddress(addressData: Partial<CreateAddressRequest>): Observable<{exists: boolean, addressId?: string}> {
    return this.http.post<{status: string, data: {exists: boolean, addressId?: string}}>(`${this.API_URL}/validate`, addressData)
      .pipe(
        map(response => response.data),
        catchError(error => throwError(() => error))
      );
  }
} 