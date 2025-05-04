/**
 * Interfaces para autenticación
 */

// Interfaces de Request
export type TypeDocument = 'DNI' | 'CE' | 'PASSPORT';

export interface RegisterUserRequest {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  documentNumber?: string;
  documentType?: TypeDocument;
  flowCustomerId?: string;
  isSignUpAcepted: boolean;
  referralCode?: string;
}

export interface LoginUserRequest {
  /**
   * Correo electrónico del usuario
   * @example "usuario@example.com"
   */
  email: string;

  /**
   * Contraseña del usuario
   * @example "Passw0rd123"
   */
  password: string;
}

export interface RefreshTokenRequest {
  /**
   * Token de refresco para obtener un nuevo token de acceso
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  refreshToken: string;
}

// Interfaces de Response

export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  documentNumber?: string;
  documentType?: TypeDocument;
  flowCustomerId?: string;
  isSignUpAcepted: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone?: string;
      documentNumber?: string;
      documentType?: TypeDocument;
      flowCustomerId?: string;
      isSignUpAcepted: boolean;
      referralCode?: string;
    };
    token: string;
    refreshToken: string;
  };
  message: string;
}

export interface RefreshTokenResponse {
  /**
   * Estado de la operación
   * @example true
   */
  success: boolean;

  /**
   * Datos de la respuesta
   */
  data: {
    /**
     * Nuevo token de acceso JWT
     * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     */
    token: string;

    /**
     * Nuevo token de refresco
     * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     */
    refreshToken: string;
  };
} 