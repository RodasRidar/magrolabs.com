import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  UpdatePasswordRequest, 
  UpdatePasswordResponse, 
  UpdateUserRequest, 
  UpdateUserResponse, 
  UserDetailResponse, 
  UserResponse,
  UsersListResponse
} from '../interfaces/user.interfaces';
import { environment } from '../../../environments/env';
import { TypeDocument } from '../interfaces/auth.interfaces';

// Interfaces para validación
interface ValidationResponse {
  status: string;
  data: {
    exists: boolean;
    isValid: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiMagroLabs}/users`;

  constructor(private http: HttpClient) { }

  /**
   * Validar si existe un email
   * @param email Email a validar
   */
  validateEmail(email: string): Observable<ValidationResponse> {
    return this.http.get<ValidationResponse>(`${this.API_URL}/validate/email?email=${email}`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Validar si existe un número de teléfono
   * @param phone Número de teléfono a validar
   */
  validatePhone(phone: string): Observable<ValidationResponse> {
    return this.http.get<ValidationResponse>(`${this.API_URL}/validate/phone?phone=${phone}`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Validar si existe un número de documento
   * @param document Número de documento a validar
   * @param documentType Tipo de documento
   */
  validateDocument(document: string, documentType: TypeDocument): Observable<ValidationResponse> {
    return this.http.get<ValidationResponse>(`${this.API_URL}/validate/document?documentNumber=${document}&documentType=${documentType}`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Obtener usuario por ID
   * @param userId ID del usuario
   */
  getUserById(userId: string): Observable<UserDetailResponse> {
    return this.http.get<UserResponse>(`${this.API_URL}/${userId}`)
      .pipe(
        map(response => response.data.user),
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Obtener usuario actual (perfil)
   */
  getCurrentUser(): Observable<UserDetailResponse> {
    return this.http.get<UserResponse>(`${this.API_URL}/profile`)
      .pipe(
        map(response => response.data.user),
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Obtener lista de usuarios
   */
  getUsers(): Observable<UserDetailResponse[]> {
    return this.http.get<UsersListResponse>(`${this.API_URL}`)
      .pipe(
        map(response => response.data.users),
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Actualizar datos de usuario
   * @param userId ID del usuario
   * @param userData Datos a actualizar
   */
  updateUser(userId: string, userData: UpdateUserRequest): Observable<UserDetailResponse> {
    return this.http.patch<UpdateUserResponse>(`${this.API_URL}/${userId}`, userData)
      .pipe(
        map(response => response.data.user),
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Actualizar perfil del usuario actual
   * @param userData Datos a actualizar
   */
  updateProfile(userData: UpdateUserRequest): Observable<UserDetailResponse> {
    return this.http.put<UpdateUserResponse>(`${this.API_URL}/profile`, userData)
      .pipe(
        map(response => response.data.user),
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Actualizar contraseña del usuario
   * @param passwordData Datos de contraseña
   */
  updatePassword(passwordData: UpdatePasswordRequest): Observable<string> {
    return this.http.patch<UpdatePasswordResponse>(`${this.API_URL}/password`, passwordData)
      .pipe(
        map(response => response.message),
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Eliminar usuario
   * @param userId ID del usuario
   */
  deleteUser(userId: string): Observable<boolean> {
    return this.http.delete<{status: string, message: string}>(`${this.API_URL}/${userId}`)
      .pipe(
        map(response => response.status === 'success'),
        catchError(error => throwError(() => error))
      );
  }
} 