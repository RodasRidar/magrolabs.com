/**
 * Interfaces para productos y categorías de productos
 */

// Interfaces de Request para productos

export interface CreateProductRequest {
  /**
   * Nombre del producto
   * @example "Smartphone XYZ Pro"
   */
  name: string;

  /**
   * Descripción detallada del producto
   * @example "Smartphone de última generación con cámara de 48MP y pantalla AMOLED de 6.5 pulgadas"
   */
  description: string;

  /**
   * Precio del producto
   * @example 599.99
   */
  price: number;

  /**
   * Cantidad disponible en inventario
   * @example 100
   */
  stock: number;

  /**
   * Código SKU (opcional)
   * @example "SMRT-XYZ-PRO-128"
   */
  sku?: string;

  /**
   * ID de la categoría del producto
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  category_id: string;

  /**
   * Indica si el producto es destacado
   * @example false
   */
  featured?: boolean;

  /**
   * Peso del producto (opcional)
   * @example 0.25
   */
  weight?: number;

  /**
   * Dimensiones del producto (opcional)
   * @example "15.5 x 7.1 x 0.8 cm"
   */
  dimensions?: string;
}

export interface UpdateProductRequest {
  /**
   * Nombre del producto
   * @example "Smartphone XYZ Pro Max"
   */
  name?: string;

  /**
   * Descripción detallada del producto
   * @example "Smartphone de última generación con cámara de 108MP y pantalla AMOLED de 6.8 pulgadas"
   */
  description?: string;

  /**
   * Precio del producto
   * @example 699.99
   */
  price?: number;

  /**
   * Cantidad disponible en inventario
   * @example 50
   */
  stock?: number;

  /**
   * Código SKU
   * @example "SMRT-XYZ-PROMAX-256"
   */
  sku?: string;

  /**
   * ID de la categoría del producto
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  category_id?: string;

  /**
   * Indica si el producto es destacado
   * @example true
   */
  featured?: boolean;

  /**
   * Peso del producto
   * @example 0.28
   */
  weight?: number;

  /**
   * Dimensiones del producto
   * @example "16.8 x 7.8 x 0.8 cm"
   */
  dimensions?: string;
}

// Interfaces de Request para imágenes de productos

export interface CreateProductImageRequest {
  /**
   * URL de la imagen
   * @example "https://example.com/images/product-xyz-pro.jpg"
   */
  url: string;

  /**
   * Texto alternativo para la imagen
   * @example "Smartphone XYZ Pro - Vista frontal"
   */
  alt?: string;

  /**
   * Orden de la imagen
   * @example 1
   */
  order?: number;

  /**
   * Indica si es la imagen principal
   * @example true
   */
  is_main?: boolean;

  /**
   * ID del producto al que pertenece la imagen
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  product_id: string;
}

export interface UpdateProductImageRequest {
  /**
   * URL de la imagen
   * @example "https://example.com/images/product-xyz-pro-updated.jpg"
   */
  url?: string;

  /**
   * Texto alternativo para la imagen
   * @example "Smartphone XYZ Pro - Nueva vista frontal"
   */
  alt?: string;

  /**
   * Orden de la imagen
   * @example 0
   */
  order?: number;

  /**
   * Indica si es la imagen principal
   * @example true
   */
  is_main?: boolean;
}

// Interfaces de Request para categorías de productos

export interface CreateProductCategoryRequest {
  /**
   * Nombre de la categoría
   * @example "Smartphones"
   */
  name: string;

  /**
   * Descripción de la categoría
   * @example "Teléfonos inteligentes de última generación"
   */
  description?: string;
}

export interface UpdateProductCategoryRequest {
  /**
   * Nombre de la categoría
   * @example "Smartphones y Tablets"
   */
  name?: string;

  /**
   * Descripción de la categoría
   * @example "Dispositivos móviles inteligentes de última generación"
   */
  description?: string;
}

// Interfaces de Response para productos

export interface ProductImageResponse {
  /**
   * ID único de la imagen
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  id: string;

  /**
   * ID del producto al que pertenece la imagen
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  product_id: string;

  /**
   * URL de la imagen
   * @example "https://example.com/images/product-xyz-pro.jpg"
   */
  image_url: string;

  /**
   * Indica si es la imagen principal
   * @example true
   */
  is_main: boolean;

  /**
   * Orden de la imagen
   * @example 0
   */
  order: number;

  /**
   * Fecha de creación de la imagen
   * @example "2023-01-01T00:00:00.000Z"
   */
  created_at: string;

  /**
   * Fecha de última actualización de la imagen
   * @example "2023-01-01T00:00:00.000Z"
   */
  updated_at: string;
}

export interface ProductCategoryResponse {
  /**
   * ID único de la categoría
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  id: string;

  /**
   * Nombre de la categoría
   * @example "Smartphones"
   */
  name: string;

  /**
   * Descripción de la categoría
   * @example "Teléfonos inteligentes de última generación"
   */
  description?: string;
}

export interface ProductResponse {
  /**
   * ID único del producto
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  id: string;

  /**
   * Nombre del producto
   * @example "Smartphone XYZ Pro"
   */
  name: string;

  /**
   * Descripción detallada del producto
   * @example "Smartphone de última generación con cámara de 48MP y pantalla AMOLED de 6.5 pulgadas"
   */
  description: string;

  /**
   * Precio del producto
   * @example 599.99
   */
  price: number;

  /**
   * Cantidad disponible en inventario
   * @example 100
   */
  stock: number;

  /**
   * Código SKU
   * @example "SMRT-XYZ-PRO-128"
   */
  sku?: string;

  /**
   * ID de la categoría del producto
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  category_id: string;

  /**
   * Información de la categoría
   */
  category: ProductCategoryResponse;

  /**
   * Indica si el producto es destacado
   * @example false
   */
  featured: boolean;

  /**
   * Peso del producto
   * @example 0.25
   */
  weight?: number;

  /**
   * Dimensiones del producto
   * @example "15.5 x 7.1 x 0.8 cm"
   */
  dimensions?: string;

  /**
   * Lista de imágenes del producto
   */
  images: ProductImageResponse[];

  /**
   * Reseñas del producto
   */
  reviews?: any[];

  /**
   * Fecha de creación del producto
   * @example "2023-01-01T00:00:00.000Z"
   */
  created_at: string;

  /**
   * Fecha de última actualización del producto
   * @example "2023-01-01T00:00:00.000Z"
   */
  updated_at: string;
}

// Interfaces de Response para operaciones CRUD

export interface ProductListResponse {
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
     * Lista de productos
     */
    products: ProductResponse[];

    /**
     * Información de paginación
     */
    pagination: {
      /**
       * Número total de productos
       * @example 100
       */
      total: number;

      /**
       * Página actual
       * @example 1
       */
      page: number;

      /**
       * Límite de productos por página
       * @example 10
       */
      limit: number;

      /**
       * Número total de páginas
       * @example 10
       */
      totalPages: number;
    };
  };
}

export interface ProductDetailResponse {
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
     * Información del producto
     */
    product: ProductResponse;
  };
}

export interface ProductCategoryListResponse {
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
     * Lista de categorías
     */
    categories: ProductCategoryResponse[];
  };
}

export interface ProductCategoryDetailResponse {
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
     * Información de la categoría
     */
    category: ProductCategoryResponse & {
      /**
       * Productos en esta categoría
       */
      products?: ProductResponse[];
    };
  };
}

export interface ProductImageDetailResponse {
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
     * Información de la imagen
     */
    image: ProductImageResponse;
  };
}

export interface SuccessMessageResponse {
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