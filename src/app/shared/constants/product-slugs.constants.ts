/**
 * Slugs canónicos de los productos de creatina mantenidos en la BD
 * backend. El frontend pide al endpoint `GET /api/v1/products/by-slug/:slug`
 * para resolver el `id` + `price` reales en cada caso de uso.
 *
 * IMPORTANTE: estos slugs coinciden con los slugs públicos de las
 * URLs indexadas en `sitemap.xml` (`/productos/creatinas/<slug>`). NO
 * cambiarlos sin actualizar también el sitemap y los redirects de SEO.
 *
 * Notas:
 * - `creatina-monohidratada-250-gr` apunta al producto de compra única
 *   en BD (00000009, S/.69). La página `/productos/creatinas/250-gr`
 *   muestra opciones de compra única y suscripción mensual; la
 *   suscripción usa un slug interno (`-suscripcion`) que no está en URL.
 * - `creatina-monohidratada-3-kg` apunta al producto compra única de 3kg
 *   (00000005, S/.590). Existe también una variante anual interna
 *   (`-3-kg-anual`, 00000004, S/.470) sin URL pública directa.
 */
export const CREATINA_PRODUCT_SLUGS = {
  /**
   * Primera creatina de campaña (S/.29.90, 100gr) — slug `creatina-monohidratada-100-gr`.
   * Usado por `VerificationPaymentComponent` para el primer cargo de suscripción.
   * URL pública: /productos/creatinas/creatina-monohidratada-100-gr
   */
  FIRST_CREATINE_CAMPAIGN: 'creatina-monohidratada-100-gr',

  /**
   * Creatina de suscripción mensual (S/.55.00, 250gr) — slug INTERNO.
   * Producto que Flow factura cada mes a partir del segundo cobro.
   * No tiene URL pública directa (la página /250-gr es compra única).
   */
  CREATINE_MONTHLY_SUBSCRIPTION: 'creatina-monohidratada-250-gr-suscripcion',

  /**
   * Creatina de compra única (S/.69.00, 250gr) — slug `creatina-monohidratada-250-gr`.
   * Usado por `CheckoutComponent` para órdenes one-purchase.
   * URL pública: /productos/creatinas/creatina-monohidratada-250-gr
   */
  CREATINE_ONE_PURCHASE: 'creatina-monohidratada-250-gr',
} as const;

export type CreatinaProductSlug = typeof CREATINA_PRODUCT_SLUGS[keyof typeof CREATINA_PRODUCT_SLUGS];
