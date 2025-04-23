/**
 * Interfaces comunes para la API
 */

/**
 * Respuesta genérica de error
 */
export interface ErrorResponse {
  /**
   * Estado de la operación, siempre false en caso de error
   * @example false
   */
  success: false;

  /**
   * Detalles del error
   */
  error: {
    /**
     * Mensaje de error legible para humanos
     * @example "El recurso solicitado no existe"
     */
    message: string;

    /**
     * Código de error para identificación programática
     * @example "RESOURCE_NOT_FOUND"
     */
    code: string;

    /**
     * Traza de la pila para depuración (solo en desarrollo)
     */
    stack?: string;

    /**
     * Detalles adicionales del error (útil para errores de validación)
     */
    details?: Array<{
      /**
       * Campo que causó el error
       * @example "email"
       */
      field: string;

      /**
       * Mensaje de error específico para el campo
       * @example "El correo electrónico no es válido"
       */
      message: string;
    }>;
  };
}

/**
 * Respuesta genérica de éxito con mensaje
 */
export interface SuccessResponse {
  /**
   * Estado de la operación
   * @example "success"
   */
  status: string;

  /**
   * Mensaje del resultado de la operación
   * @example "Operación realizada correctamente"
   */
  message: string;
}

/**
 * Estructura de paginación para respuestas de listas
 */
export interface PaginationInfo {
  /**
   * Número total de elementos
   * @example 100
   */
  total: number;

  /**
   * Página actual
   * @example 1
   */
  page: number;

  /**
   * Límite de elementos por página
   * @example 10
   */
  limit: number;

  /**
   * Número total de páginas
   * @example 10
   */
  totalPages: number;
}

/**
 * Respuesta para peticiones de estado/health
 */
export interface HealthResponse {
  /**
   * Estado del servicio
   * @example "OK"
   */
  status: string;

  /**
   * Marca de tiempo de la respuesta
   * @example "2023-01-01T00:00:00.000Z" 
   */
  timestamp: string;
} 