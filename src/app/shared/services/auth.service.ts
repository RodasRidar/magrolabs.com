import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { 
  AuthResponse, 
  LoginUserRequest, 
  RefreshTokenRequest, 
  RefreshTokenResponse, 
  RegisterUserRequest, 
  UserResponse 
} from '../interfaces/auth.interfaces';
import { environment } from '../../../environments/env';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiMagroLabs}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';
  
  private currentUserSubject = new BehaviorSubject<UserResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    //this.loadUserFromStorage();
  }

  /**
   * Cargar usuario desde el almacenamiento local
   
  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userData = localStorage.getItem(this.USER_KEY);
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData) as UserResponse;
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.logout();
      }
    }
  }*/

  /**
   * Registrar un nuevo usuario
   */
  register(userData: RegisterUserRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  /**
   * Iniciar sesión de usuario
   */
  login(credentials: LoginUserRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  /**
   * Renovar token de acceso
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    const request: RefreshTokenRequest = { refreshToken };
    
    return this.http.post<RefreshTokenResponse>(`${this.API_URL}/refresh-token`, request)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            localStorage.setItem(this.TOKEN_KEY, response.data.token);
            localStorage.setItem(this.REFRESH_TOKEN_KEY, response.data.refreshToken);
          }
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Cerrar sesión de usuario
   */
  logout(): Observable<boolean> {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    return of(true);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): UserResponse | null {
    return this.currentUserSubject.value;
  }

  /**
   * Manejar respuesta de autenticación
   */
  private handleAuthResponse(response: AuthResponse): void {
    if (response.success && response.data) {
      localStorage.setItem(this.TOKEN_KEY, response.data.token);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.data.refreshToken);
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
      this.currentUserSubject.next(response.data.user);
      this.isAuthenticatedSubject.next(true);
    }
  }
} 