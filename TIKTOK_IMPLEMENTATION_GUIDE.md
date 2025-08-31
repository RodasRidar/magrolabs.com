# Guía de Implementación - TikTok Analytics Service

## Cómo usar el servicio en tus componentes

### 1. Importar el servicio en tu componente

```typescript
import { TiktokAnalyticsService, TikTokContent } from '../shared/services/tiktok-analytics.service';

export class TuComponente {
  constructor(private tiktokAnalytics: TiktokAnalyticsService) {}
}
```

### 2. Ejemplos de implementación por ruta

#### Landing Page (`/`)
```typescript
export class LandingComponent {
  constructor(private tiktokAnalytics: TiktokAnalyticsService) {}
  
  ngOnInit() {
    // Rastrear vista de página principal
    this.tiktokAnalytics.trackViewContent({
      contents: [{
        content_id: 'landing-page',
        content_type: 'product_group',
        content_name: 'Landing Principal'
      }],
      currency: 'PEN'
    });
  }
}
```

#### Páginas de Productos (`/productos/creatinas/:slug`)
```typescript
export class CreatinasComponent {
  constructor(private tiktokAnalytics: TiktokAnalyticsService) {}
  
  ngOnInit() {
    // Al cargar un producto específico
    this.tiktokAnalytics.trackViewContent({
      contents: [{
        content_id: this.product.id,
        content_type: 'product',
        content_name: this.product.name
      }],
      value: this.product.price,
      currency: 'PEN'
    });
  }
  
  onAddToCart() {
    // Al añadir al carrito
    this.tiktokAnalytics.trackAddToCart({
      contents: [{
        content_id: this.product.id,
        content_type: 'product',
        content_name: this.product.name
      }],
      value: this.product.price,
      currency: 'PEN'
    });
  }
}
```

#### Registro (`/registro`)
```typescript
export class CreateAccountComponent {
  constructor(private tiktokAnalytics: TiktokAnalyticsService) {}
  
  onSubmitRegistration(userData: any) {
    // Identificar usuario (opcional - solo si tienes los datos)
    this.tiktokAnalytics.identify({
      email: userData.email,
      external_id: userData.userId
    });
    
    // Rastrear registro completado
    this.tiktokAnalytics.trackCompleteRegistration({
      contents: [{
        content_id: 'registration',
        content_type: 'product_group',
        content_name: 'Registro Completado'
      }],
      currency: 'PEN'
    });
  }
}
```

#### Checkout (`/checkout`)
```typescript
export class CheckoutComponent {
  constructor(private tiktokAnalytics: TiktokAnalyticsService) {}
  
  ngOnInit() {
    // Al iniciar checkout
    this.tiktokAnalytics.trackInitiateCheckout({
      contents: this.cartItems.map(item => ({
        content_id: item.productId,
        content_type: 'product',
        content_name: item.productName
      })),
      value: this.totalAmount,
      currency: 'PEN'
    });
  }
  
  onCompletePurchase(orderData: any) {
    // Al completar compra
    this.tiktokAnalytics.trackPurchase({
      contents: orderData.items.map((item: any) => ({
        content_id: item.productId,
        content_type: 'product',
        content_name: item.productName
      })),
      value: orderData.total,
      currency: 'PEN'
    });
  }
}
```

#### Loyalty WebShop (`/loyalty-webshop`)
```typescript
export class LoyaltyWebshopComponent {
  constructor(private tiktokAnalytics: TiktokAnalyticsService) {}
  
  ngOnInit() {
    // Rastrear vista de tienda loyalty
    this.tiktokAnalytics.trackViewContent({
      contents: [{
        content_id: 'loyalty-webshop',
        content_type: 'product_group',
        content_name: 'Loyalty WebShop'
      }],
      currency: 'PEN'
    });
  }
}
```

#### Páginas de Artículos Loyalty (`/loyalty-webshop/articulos/:slug`)
```typescript
export class ClothingComponent {
  constructor(private tiktokAnalytics: TiktokAnalyticsService) {}
  
  ngOnInit() {
    // Al ver un artículo específico
    this.tiktokAnalytics.trackViewContent({
      contents: [{
        content_id: this.article.id,
        content_type: 'product',
        content_name: this.article.name
      }],
      value: this.article.points, // En puntos loyalty
      currency: 'PEN'
    });
  }
}
```

### 3. Implementación Global en App Component

```typescript
// En app.component.ts
export class AppComponent {
  constructor(
    private tiktokAnalytics: TiktokAnalyticsService,
    private router: Router
  ) {}
  
  ngOnInit() {
    // Rastrear cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Aquí puedes implementar tracking automático de páginas
      this.trackPageView(event.url);
    });
  }
  
  private trackPageView(url: string) {
    // Lógica para rastrear vista de página automáticamente
    const pageMap: { [key: string]: string } = {
      '/': 'Landing',
      '/registro': 'Registro',
      '/productos': 'Productos',
      '/loyalty-webshop': 'Loyalty WebShop',
      '/checkout': 'Checkout'
    };
    
    const pageName = pageMap[url] || 'Página Genérica';
    
    this.tiktokAnalytics.trackViewContent({
      contents: [{
        content_id: url,
        content_type: 'product_group',
        content_name: pageName
      }],
      currency: 'PEN'
    });
  }
}
```

### 4. Mejores Prácticas

1. **Identificación de Usuario**: Llama a `identify()` cuando tengas datos del usuario (después del login o registro)
2. **Moneda**: Usa siempre 'PEN' para Perú
3. **Content IDs**: Usa IDs únicos y consistentes para productos
4. **Content Types**: 
   - 'product' para productos individuales
   - 'product_group' para categorías o páginas generales
5. **Valores**: Siempre incluye valores numéricos cuando sea relevante

### 5. Variables de Entorno (Opcional)

Puedes agregar una variable de entorno para controlar si el tracking está activo:

```typescript
// En environments/
export const environment = {
  production: false,
  tiktokTrackingEnabled: true
};
```

Y luego en el servicio:
```typescript
import { environment } from '../../environments/environment';

// En cada método del servicio
if (!environment.tiktokTrackingEnabled) {
  return;
}
```
