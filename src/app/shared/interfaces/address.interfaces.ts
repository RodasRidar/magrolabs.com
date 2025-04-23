/**
 * Interfaces para direcciones
 */

// Interfaces de Request

export interface CreateAddressRequest {
  /**
   * Avenida/Calle
   * @example "Av. Arequipa 1250"
   */
  avenue: string;

  /**
   * Departamento/Estado
   * @example "Lima"
   */
  department: string;

  /**
   * Código de ubigeo del departamento
   * @example "15"
   */
  department_ubigeo: string;

  /**
   * Provincia
   * @example "Lima"
   */
  province: string;

  /**
   * Código de ubigeo de la provincia
   * @example "1501"
   */
  province_ubigeo: string;

  /**
   * Distrito
   * @example "Lince"
   */
  district: string;

  /**
   * Código de ubigeo del distrito
   * @example "150116"
   */
  district_ubigeo: string;

  /**
   * Código postal
   * @example "15046"
   */
  postalcode?: string;

  /**
   * Número de puerta
   * @example "123"
   */
  number?: string;

  /**
   * Referencias adicionales para ubicar la dirección
   * @example "Cerca al parque principal, edificio de color azul"
   */
  reference?: string;
}

export interface UpdateAddressRequest {
  /**
   * Avenida/Calle
   * @example "Av. Arequipa 1260"
   */
  avenue?: string;

  /**
   * Departamento/Estado
   * @example "Lima"
   */
  department?: string;

  /**
   * Código de ubigeo del departamento
   * @example "15"
   */
  department_ubigeo?: string;

  /**
   * Provincia
   * @example "Lima"
   */
  province?: string;

  /**
   * Código de ubigeo de la provincia
   * @example "1501"
   */
  province_ubigeo?: string;

  /**
   * Distrito
   * @example "Lince"
   */
  district?: string;

  /**
   * Código de ubigeo del distrito
   * @example "150116"
   */
  district_ubigeo?: string;

  /**
   * Código postal
   * @example "15046"
   */
  postalcode?: string;

  /**
   * Número de puerta
   * @example "125"
   */
  number?: string;

  /**
   * Referencias adicionales para ubicar la dirección
   * @example "Cerca al parque principal, edificio de color azul, puerta negra"
   */
  reference?: string;
}

// Interfaces de Response

export interface UserSummaryResponse {
  /**
   * ID único del usuario
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  id: string;

  /**
   * Nombre del usuario
   * @example "Juan"
   */
  first_name: string;

  /**
   * Apellido del usuario
   * @example "Pérez"
   */
  last_name: string;

  /**
   * Correo electrónico del usuario
   * @example "juan.perez@example.com"
   */
  email: string;
}

export interface AddressResponse {
  /**
   * ID único de la dirección
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  id: string;

  /**
   * Avenida/Calle
   * @example "Av. Arequipa 1250"
   */
  avenue: string;

  /**
   * Departamento/Estado
   * @example "Lima"
   */
  department: string;

  /**
   * Código de ubigeo del departamento
   * @example "15"
   */
  department_ubigeo: string;

  /**
   * Provincia
   * @example "Lima"
   */
  province: string;

  /**
   * Código de ubigeo de la provincia
   * @example "1501"
   */
  province_ubigeo: string;

  /**
   * Distrito
   * @example "Lince"
   */
  district: string;

  /**
   * Código de ubigeo del distrito
   * @example "150116"
   */
  district_ubigeo: string;

  /**
   * Código postal
   * @example "15046"
   */
  postalcode?: string;

  /**
   * Número de puerta
   * @example "123"
   */
  number?: string;

  /**
   * Referencias adicionales para ubicar la dirección
   * @example "Cerca al parque principal, edificio de color azul"
   */
  reference?: string;

  /**
   * Usuarios asociados a esta dirección
   */
  users?: UserSummaryResponse[];

  /**
   * Fecha de creación de la dirección
   * @example "2023-01-01T00:00:00.000Z"
   */
  created_at: string;

  /**
   * Fecha de última actualización de la dirección
   * @example "2023-01-01T00:00:00.000Z"
   */
  updated_at: string;
}

export interface AddressListResponse {
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
     * Lista de direcciones
     */
    addresses: AddressResponse[];

    /**
     * Información de paginación
     */
    pagination?: {
      /**
       * Número total de direcciones
       * @example 5
       */
      total: number;

      /**
       * Página actual
       * @example 1
       */
      page: number;

      /**
       * Límite de direcciones por página
       * @example 10
       */
      limit: number;

      /**
       * Número total de páginas
       * @example 1
       */
      totalPages: number;
    };
  };
}

export interface AddressDetailResponse {
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
     * Información de la dirección
     */
    address: AddressResponse;
  };
} 