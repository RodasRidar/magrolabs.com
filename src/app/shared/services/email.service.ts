import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/env';

/**
 * Interfaz para la solicitud de email de bienvenida
 */
export interface WelcomeEmailRequest {
  email: string;
}

/**
 * Interfaz para la respuesta de email de bienvenida
 */
export interface WelcomeEmailResponse {
  success: boolean;
  message: string;
}

/**
 * Servicio para el manejo de emails
 */
@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiMagroLabs}/email`;

  /**
   * Envía un email de bienvenida al usuario
   * @param email Email del usuario al cual enviar la bienvenida
   * @returns Observable con la respuesta del envío
   */
  sendWelcomeEmail(email: string): Observable<WelcomeEmailResponse> {
    const requestBody: WelcomeEmailRequest = {
      email: email
    };

    return this.http.post<WelcomeEmailResponse>(`${this.apiUrl}/welcome`, requestBody)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Método auxiliar para validar formato de email
   * @param email Email a validar
   * @returns true si el email es válido, false en caso contrario
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Método wrapper que incluye validación de email
   * @param email Email del usuario
   * @returns Observable con la respuesta del envío o error si el email es inválido
   */
  sendWelcomeEmailWithValidation(email: string): Observable<WelcomeEmailResponse> {
    if (!this.isValidEmail(email)) {
      throw new Error('Formato de email inválido');
    }

    return this.sendWelcomeEmail(email);
  }

  /**
   * Maneja errores HTTP del servicio de email
   * @param error Error HTTP recibido
   * @returns Observable con error formateado
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Error desconocido al enviar email';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud inválida - Verifique el formato del email';
          break;
        case 401:
          errorMessage = 'No autorizado para enviar emails';
          break;
        case 404:
          errorMessage = 'Servicio de email no encontrado';
          break;
        case 500:
          errorMessage = 'Error interno del servidor de email';
          break;
        case 503:
          errorMessage = 'Servicio de email temporalmente no disponible';
          break;
        default:
          errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
      }
    }

    console.error('EmailService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  };
} 