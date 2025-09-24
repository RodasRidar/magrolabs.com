# Meta Analytics Service - Guía de Implementación

## Descripción
El servicio `MetaAnalyticsService` proporciona una interfaz TypeScript para rastrear eventos de Facebook Pixel (Meta Analytics) en aplicaciones Angular. Este servicio incluye todos los eventos estándar más comunes para ecommerce y marketing digital.

## Configuración

### 1. Environment Configuration
La configuración se maneja a través de los archivos de environment:

```typescript
// src/environments/env.ts
meta: {
  pixelId: '797277002911669',  // Tu ID de Meta Pixel
  enabled: true,               // Habilitar/deshabilitar tracking
  debug: true                  // Mostrar logs en desarrollo
}
```

### 2. Meta Pixel Code
Asegúrate de que el código de Meta Pixel esté incluido en `src/index.html`:

```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'TU_PIXEL_ID');
fbq('track', 'PageView');
</script>
```

## Uso del Servicio

### 1. Inyección del Servicio
```typescript
import { MetaAnalyticsService } from './shared/services/meta-analytics.service';

constructor(private metaAnalytics: MetaAnalyticsService) {}
```

### 2. Inicialización
Inicializa el servicio en el `app.component.ts` o en el módulo principal:

```typescript
ngOnInit() {
  this.metaAnalytics.initialize();
}
```

## Eventos Disponibles

### 1. AddToCart - Agregar al Carrito
```typescript
this.metaAnalytics.trackAddToCart({
  value: 99.99,
  currency: 'USD',
  content_name: 'Creatina 250g',
  content_category: 'Suplementos',
  content_ids: ['CREAT250'],
  content_type: 'product',
  contents: [{
    id: 'CREAT250',
    quantity: 1,
    item_price: 99.99
  }]
});
```

### 2. InitiateCheckout - Iniciar Proceso de Pago
```typescript
this.metaAnalytics.trackInitiateCheckout({
  value: 199.98,
  currency: 'USD',
  content_name: 'Carrito de Compras',
  num_items: 2,
  content_ids: ['CREAT250', 'CREAT500']
});
```

### 3. AddPaymentInfo - Agregar Información de Pago
```typescript
this.metaAnalytics.trackAddPaymentInfo({
  value: 199.98,
  currency: 'USD',
  content_category: 'checkout'
});
```

### 4. Purchase - Compra Completada
```typescript
this.metaAnalytics.trackPurchase({
  value: 199.98,
  currency: 'USD',
  transaction_id: 'TXN_12345',
  content_ids: ['CREAT250', 'CREAT500'],
  content_type: 'product',
  num_items: 2
});
```

### 5. CompleteRegistration - Registro Completado
```typescript
this.metaAnalytics.trackCompleteRegistration({
  content_name: 'Newsletter Signup',
  status: true
});
```

### 6. StartTrial - Iniciar Prueba Gratuita
```typescript
this.metaAnalytics.trackStartTrial({
  value: 0,
  currency: 'USD',
  predicted_ltv: 500 // Valor de vida del cliente predicho
});
```

### 7. Subscribe - Nueva Suscripción
```typescript
this.metaAnalytics.trackSubscribe({
  value: 69.99,
  currency: 'USD',
  predicted_ltv: 839.88 // 12 meses * 69.99
});
```

## Ejemplos de Uso en Componentes

### Componente de Producto
```typescript
// product.component.ts
addToCart(product: Product) {
  // Lógica para agregar al carrito
  this.cartService.addProduct(product);
  
  // Tracking de Meta
  this.metaAnalytics.trackAddToCart({
    value: product.price,
    currency: 'USD',
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id],
    content_type: 'product',
    contents: [{
      id: product.id,
      quantity: 1,
      item_price: product.price
    }]
  });
}
```

### Componente de Checkout
```typescript
// checkout.component.ts
initiateCheckout() {
  const cartTotal = this.cartService.getTotal();
  const items = this.cartService.getItems();
  
  this.metaAnalytics.trackInitiateCheckout({
    value: cartTotal,
    currency: 'USD',
    content_name: 'Checkout Process',
    num_items: items.length,
    content_ids: items.map(item => item.id)
  });
}

onPaymentInfoAdded() {
  this.metaAnalytics.trackAddPaymentInfo({
    value: this.cartService.getTotal(),
    currency: 'USD'
  });
}
```

### Componente de Confirmación de Orden
```typescript
// order-confirmation.component.ts
ngOnInit() {
  if (this.order) {
    this.metaAnalytics.trackPurchase({
      value: this.order.total,
      currency: this.order.currency,
      transaction_id: this.order.id,
      content_ids: this.order.items.map(item => item.productId),
      content_type: 'product',
      num_items: this.order.items.length
    });
  }
}
```

### Componente de Registro
```typescript
// registration.component.ts
onRegistrationComplete(user: User) {
  this.metaAnalytics.trackCompleteRegistration({
    content_name: 'User Registration',
    status: true
  });
}
```

### Componente de Suscripción
```typescript
// subscription.component.ts
onSubscriptionStart(subscription: Subscription) {
  if (subscription.isTrial) {
    this.metaAnalytics.trackStartTrial({
      value: 0,
      currency: 'USD',
      predicted_ltv: subscription.monthlyPrice * 12
    });
  } else {
    this.metaAnalytics.trackSubscribe({
      value: subscription.monthlyPrice,
      currency: 'USD',
      predicted_ltv: subscription.monthlyPrice * 12
    });
  }
}
```

## Métodos Auxiliares

### Verificar Estado del Servicio
```typescript
const status = this.metaAnalytics.getStatus();
console.log('Meta Analytics Status:', status);
// Output: { initialized: true, enabled: true, pixelId: '***1669' }
```

### Habilitar/Deshabilitar Tracking
```typescript
// Deshabilitar temporalmente
this.metaAnalytics.setEnabled(false);

// Rehabilitar
this.metaAnalytics.setEnabled(true);
```

### Eventos Personalizados
```typescript
this.metaAnalytics.trackCustomEvent('CustomEventName', {
  custom_parameter: 'value',
  another_parameter: 123
});
```

## Debugging

### Modo Debug
Cuando `debug: true` en environment, el servicio mostrará logs detallados:
```
[MetaAnalytics] Meta Analytics inicializado correctamente
[MetaAnalytics] Evento enviado: AddToCart { value: 99.99, currency: 'USD', ... }
```

### Facebook Pixel Helper
Instala la extensión "Facebook Pixel Helper" en Chrome para verificar que los eventos se envíen correctamente.

### Verificación Manual
```typescript
// En la consola del navegador
fbq('track', 'PageView'); // Debería funcionar si el pixel está configurado
```

## Consideraciones de Rendimiento

1. **Lazy Loading**: El servicio se carga solo cuando es necesario
2. **Parámetros Opcionales**: Los parámetros undefined/null se filtran automáticamente
3. **Error Handling**: Los errores se capturan y no afectan la funcionalidad de la app
4. **Configuración por Environment**: Fácil activación/desactivación según el ambiente

## Troubleshooting

### Eventos No Se Envían
1. Verificar que `meta.enabled: true` en environment
2. Confirmar que el Pixel ID es correcto
3. Asegurar que el script de Meta Pixel está en index.html
4. Verificar la consola del navegador para errores

### Errores Comunes
```typescript
// ❌ Incorrecto - faltan parámetros requeridos
this.metaAnalytics.trackPurchase({});

// ✅ Correcto
this.metaAnalytics.trackPurchase({
  value: 99.99,
  currency: 'USD'
});
```

## Testing

El servicio incluye tests completos. Ejecutar con:
```bash
ng test --include="**/meta-analytics.service.spec.ts"
```

Los tests cubren:
- Inicialización del servicio
- Tracking de todos los eventos
- Validación de parámetros
- Limpieza de parámetros
- Estados habilitado/deshabilitado
- Manejo de errores