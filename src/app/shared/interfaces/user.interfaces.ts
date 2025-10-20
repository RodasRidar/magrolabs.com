/**
 * Interfaces para usuarios
 */

import { AddressListResponse, AddressResponse } from "./address.interfaces";
import { TypeDocument } from "./auth.interfaces";

// Interfaces de Request

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  documentNumber?: string;
  documentType?: TypeDocument;
  flowCustomerId?: string;
  isSignUpAcepted?: boolean;
  email?: string;
  address_id?: string;
  birth_date?: string;
}

export interface UpdatePasswordRequest {
  /**
   * Contraseña actual del usuario
   * @example "Password123"
   */
  currentPassword: string;

  /**
   * Nueva contraseña del usuario (mínimo 8 caracteres)
   * @example "NewPassword456"
   */
  newPassword: string;

  /**
   * Confirmación de la nueva contraseña
   * @example "NewPassword456"
   */
  confirmPassword: string;
}

// Interfaces de Response

export interface UserDetailResponse {
  /**
   * ID único del usuario
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  id: string;

  /**
   * Correo electrónico del usuario
   * @example "usuario@example.com"
   */
  email: string;

  /**
   * Nombre del usuario
   * @example "Juan Carlos"
   */
  first_name: string;

  /**
   * Apellido del usuario
   * @example "Pérez Rodríguez"
   */
  last_name: string;

  /**
   * Número de teléfono
   * @example "912345678"
   */
  phone?: string;

  /**
   * Número de documento de identidad
   * @example "12345678"
   */
  documentNumber?: string;

  /**
   * Tipo de documento
   * @example "DNI"
   */
  documentType?: TypeDocument;

  /**
   * Indica si el usuario aceptó los términos del registro
   * @example true
   */
  isSignUpAcepted: boolean;

  /**
   * Direcciones del usuario
   */

  /**
   * Fecha de nacimiento del usuario
   * @example "1990-01-01"
   */
  birth_date?: string;

  /**
   * Fecha de creación del usuario
   * @example "2023-01-01T00:00:00.000Z"
   */
  created_at: string;

  /**
   * Fecha de última actualización del usuario
   * @example "2023-01-01T00:00:00.000Z"
   */
  flowCustomerId?: string;
  updated_at: string;
  address?: AddressResponse | null;
}

export interface UsersListResponse {
  /**
   * Estado de la operación
   * @example true
   */
  status: string;

  /**
   * Datos de la respuesta
   */
  data: {
    /**
     * Lista de usuarios
     */
    users: UserDetailResponse[];
  };
}

export interface UserResponse {
  /**
   * Estado de la operación
   * @example "success"
   */
  status: string;

  /**
   * Datos de la respuesta
   */
  data: {
    /**
     * Información del usuario
     */
    user: UserDetailResponse;
  };
}

export interface UpdateUserResponse {
  /**
   * Estado de la operación
   * @example "success"
   */
  status: string;

  /**
   * Datos de la respuesta
   */
  data: {
    /**
     * Información actualizada del usuario
     */
    user: UserDetailResponse;
  };
}

export interface UpdatePasswordResponse {
  /**
   * Estado de la operación
   * @example "success"
   */
  status: string;

  /**
   * Mensaje del resultado de la operación
   * @example "Contraseña actualizada correctamente"
   */
  message: string;
} 