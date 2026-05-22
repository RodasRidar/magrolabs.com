import { Injectable, inject, PLATFORM_ID, Inject, afterNextRender, DestroyRef } from '@angular/core';
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
import { CookieService } from 'ngx-cookie-service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiMagroLabs}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';
  private readonly IS_AUTHENTICATED_KEY = 'is_authenticated';
  // Duración de las cookies en horas
  private readonly COOKIE_DURATION_HOURS = 12;
  
  private cookieService = inject(CookieService);
  private isBrowser: boolean;
  private destroyRef = inject(DestroyRef);
  
  private currentUserSubject = new BehaviorSubject<UserResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Inicializar de manera síncrona con el estado de la cookie
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Intentar leer la cookie de manera síncrona durante la inicialización
    let initialAuthState = false;
    
    if (this.isBrowser) {
      try {
        initialAuthState = this.cookieService.check(this.IS_AUTHENTICATED_KEY) && 
                         this.cookieService.get(this.IS_AUTHENTICATED_KEY) === 'true';
      } catch (error) {
        console.error('Error checking auth cookie during initialization:', error);
      }
    }
    
    // Inicializar con el valor de la cookie
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(initialAuthState);
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
    
    // Solo inicializar en el navegador después del primer render para cargar datos adicionales
    if (this.isBrowser) {
      // Usamos afterNextRender para asegurarnos de que el código se ejecute solo en el cliente
      afterNextRender(() => {
        try {
          this.loadUserFromStorage();
        } catch (error) {
          console.error('Error initializing auth service:', error);
        }
      });
    }
  }

  /**
   * Obtener expiración de cookie (12 horas)
   */
  private getCookieExpiration(): Date {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + this.COOKIE_DURATION_HOURS);
    return expirationDate;
  }

  /**
   * Guardar valor en cookie
   */
  private saveCookie(key: string, value: string): void {
    if (!this.isBrowser) return;
    
    try {
      this.cookieService.set(
        key, 
        value, 
        { 
          expires: this.getCookieExpiration(), 
          path: '/', 
          sameSite: 'Strict',
          secure: true 
        }
      );
    } catch (error) {
      console.error(`Error saving cookie ${key}:`, error);
    }
  }

  /**
   * Obtener valor de cookie
   */
  private getCookie(key: string): string | null {
    if (!this.isBrowser) return null;
    
    try {
      return this.cookieService.check(key) ? this.cookieService.get(key) : null;
    } catch (error) {
      console.error(`Error getting cookie ${key}:`, error);
      return null;
    }
  }

  /**
   * Eliminar cookie
   */
  private deleteCookie(key: string): void {
    if (!this.isBrowser) return;
    
    try {
      this.cookieService.delete(key, '/');
    } catch (error) {
      console.error(`Error deleting cookie ${key}:`, error);
    }
  }

  /**
   * Cargar usuario desde cookies
   */
  private loadUserFromStorage(): void {
    if (!this.isBrowser) return;
    
    try {
      const token = this.getCookie(this.TOKEN_KEY);
      const userData = this.getCookie(this.USER_KEY);
      
      if (token && userData) {
        const user = JSON.parse(userData) as UserResponse;
        this.currentUserSubject.next(user);
      } else {
        // Si no hay token pero hay cookie de autenticación, es una inconsistencia
        const cookieAuth = this.getAuthenticationFromCookie();
        if (cookieAuth && !token) {
          console.warn('Inconsistencia: Cookie de autenticación presente pero sin token');
          // Opción 1: Mantener la cookie y esperar que el usuario vuelva a hacer login
          // Opción 2: Eliminar la cookie para forzar login
          // this.deleteCookie(this.IS_AUTHENTICATED_KEY);
          // this.isAuthenticatedSubject.next(false);
        }
      }
    } catch (error) {
      console.error('Error loading user from cookies:', error);
      this.logout();
    }
  }

  /**
   * Obtener el estado de autenticación desde cookie
   */
  private getAuthenticationFromCookie(): boolean {
    if (!this.isBrowser) return false;
    
    try {
      return this.cookieService.check(this.IS_AUTHENTICATED_KEY) && 
             this.cookieService.get(this.IS_AUTHENTICATED_KEY) === 'true';
    } catch (error) {
      console.error('Error getting authentication from cookie:', error);
      return false;
    }
  }

  /**
   * Guardar el estado de autenticación en cookie
   */
  private saveAuthenticationToCookie(isAuthenticated: boolean): void {
    if (!this.isBrowser) return;
    
    try {
      this.saveCookie(this.IS_AUTHENTICATED_KEY, isAuthenticated.toString());
    } catch (error) {
      console.error('Error saving authentication to cookie:', error);
    }
  }

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
        tap(response => {
          this.handleAuthResponse(response);
          this.saveAuthenticationToCookie(true);
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  /**
   * Renovar token de acceso
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    if (!this.isBrowser) {
      return throwError(() => new Error('No refresh token available - server side'));
    }
    
    try {
      const refreshToken = this.getCookie(this.REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        return throwError(() => new Error('No refresh token available'));
      }
      
      const request: RefreshTokenRequest = { refreshToken };
      
      return this.http.post<RefreshTokenResponse>(`${this.API_URL}/refresh-token`, request)
        .pipe(
          tap(response => {
            if (response.success && response.data) {
              this.saveCookie(this.TOKEN_KEY, response.data.token);
              this.saveCookie(this.REFRESH_TOKEN_KEY, response.data.refreshToken);
            }
          }),
          catchError(error => {
            console.error('refreshToken catchError', error);
            return throwError(() => error);
          })
        );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Cerrar sesión de usuario
   */
  logout(): Observable<boolean> {
    if (this.isBrowser) {
      try {
        this.deleteCookie(this.TOKEN_KEY);
        this.deleteCookie(this.REFRESH_TOKEN_KEY);
        this.deleteCookie(this.USER_KEY);
        this.deleteCookie(this.IS_AUTHENTICATED_KEY);
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    return of(true);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;
    
    try {
      const cookieAuth = this.getAuthenticationFromCookie();
      return cookieAuth && !!this.getCookie(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    if (!this.isBrowser) return null;
    
    try {
      return this.getCookie(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUserObservable(): Observable<UserResponse | null> {
    return of(this.currentUserSubject.value);
  }

  getCurrentUser(): UserResponse | null {
    return this.currentUserSubject.value;
  }

  //actualizar el flowCustomerId del usuario en el storage
  updateFlowCustomerId(flowCustomerId: string): void {
    const user = this.currentUserSubject.value;
    if (user) {
      user.flowCustomerId = flowCustomerId;
      this.saveCookie(this.USER_KEY, JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }

  /**
   * Manejar respuesta de autenticación
   */
  private handleAuthResponse(response: AuthResponse): void {
    if (response.success && response.data) {
      if (this.isBrowser) {
        try {
          this.saveCookie(this.TOKEN_KEY, response.data.token);
          this.saveCookie(this.REFRESH_TOKEN_KEY, response.data.refreshToken);
          this.saveCookie(this.USER_KEY, JSON.stringify(response.data.user));
        } catch (error) {
          console.error('Error handling auth response:', error);
        }
      }

      this.currentUserSubject.next(response.data.user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  /**
   * Persistir sesión emitida por el endpoint POST /api/v1/checkout cuando
   * registra a un cliente nuevo o hace auto-login. Reusa la misma lógica
   * que login/register: cookies de token+refresh+user_data+is_authenticated
   * y notificación a los BehaviorSubjects.
   */
  setSessionFromCheckout(
    tokens: { token: string; refreshToken: string },
    user: UserResponse
  ): void {
    if (this.isBrowser) {
      try {
        this.saveCookie(this.TOKEN_KEY, tokens.token);
        this.saveCookie(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
        this.saveCookie(this.USER_KEY, JSON.stringify(user));
        this.saveAuthenticationToCookie(true);
      } catch (error) {
        console.error('Error persisting session from checkout:', error);
      }
    }

    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Solicitar recuperación de contraseña
   * @param email Correo electrónico del usuario
   * @returns Observable con la respuesta del servidor
   */
  requestPasswordRecovery(email: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/request-password-recovery`, { email })
      .pipe(
        catchError(error => {
          console.error('Error al solicitar recuperación de contraseña:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Restablecer la contraseña con token
   * @param token Token de recuperación de contraseña
   * @param newPassword Nueva contraseña
   * @returns Observable con la respuesta del servidor
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/reset-password`, { token, newPassword })
      .pipe(
        catchError(error => {
          console.error('Error al restablecer la contraseña:', error);
          return throwError(() => error);
        })
      );
  }
} 