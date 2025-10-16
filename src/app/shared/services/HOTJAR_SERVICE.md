# Hotjar Service

Servicio para integrar Hotjar Analytics en la aplicación. **Solo se ejecuta en el ambiente de producción.**

## Características

- ✅ **Carga automática solo en producción**: Utiliza `environment.production` para verificar
- ✅ **Compatible con SSR**: Verifica que esté en el navegador con `isPlatformBrowser`
- ✅ **Singleton**: Se inyecta como servicio providedIn 'root'
- ✅ **Inicialización automática**: Se inicializa en el constructor del servicio
- ✅ **Métodos opcionales**: trigger e identify para funcionalidades avanzadas

## Configuración

### ID de Hotjar
- **hjid**: 6549097
- **hjsv**: 6

Estos valores están hardcodeados en el servicio. Si necesitas cambiarlos, edita el archivo:
```
src/app/shared/services/hotjar.service.ts
```

## Uso

### Inicialización Automática

El servicio se inicializa automáticamente cuando se inyecta en el `AppComponent`:

```typescript
import { HotjarService } from './shared/services/hotjar.service';

export class AppComponent {
  private _hotjar = inject(HotjarService);
  
  // El servicio se auto-inicializa en el constructor
  // Solo carga Hotjar si environment.production === true
}
```

### Métodos Disponibles

#### 1. `trigger(eventName: string)`
Dispara un evento personalizado en Hotjar (solo en producción):

```typescript
this._hotjar.trigger('custom-event-name');
```

#### 2. `identify(userId: string, attributes?: any)`
Identifica a un usuario en Hotjar (solo en producción):

```typescript
this._hotjar.identify('user-123', {
  email: 'user@example.com',
  plan: 'premium'
});
```

#### 3. `isAvailable(): boolean`
Verifica si Hotjar está disponible y cargado:

```typescript
if (this._hotjar.isAvailable()) {
  console.log('Hotjar está listo');
}
```

## Comportamiento por Ambiente

### Producción (`environment.production === true`)
- ✅ Hotjar se carga completamente
- ✅ Script inyectado en el DOM
- ✅ Tracking activo
- ✅ Métodos trigger e identify funcionales

### Desarrollo/Staging (`environment.production === false`)
- ❌ Hotjar NO se carga
- ❌ Sin inyección de scripts
- ❌ Sin tracking
- ❌ Métodos trigger e identify no ejecutan nada (silent fail)

## Logs de Consola

### En Producción:
```
✅ Hotjar initialized in production
```

### En caso de error:
```
❌ Error initializing Hotjar: [error details]
```

## Verificación

Para verificar que Hotjar está cargado correctamente en producción:

1. Abre las DevTools del navegador
2. En la consola, ejecuta:
```javascript
window.hj
window._hjSettings
```

3. Deberías ver los objetos de Hotjar si está cargado correctamente

## Seguridad

- ✅ Solo se ejecuta en el navegador (no en SSR)
- ✅ Manejo de errores con try-catch
- ✅ Verificaciones de existencia antes de ejecutar métodos
- ✅ No expone información sensible

## Ejemplo Completo

```typescript
import { Component, inject } from '@angular/core';
import { HotjarService } from './shared/services/hotjar.service';

@Component({
  selector: 'app-checkout',
  template: '...'
})
export class CheckoutComponent {
  private hotjar = inject(HotjarService);

  onPurchaseComplete(userId: string) {
    // Identificar usuario después de compra
    this.hotjar.identify(userId, {
      purchaseComplete: true,
      timestamp: new Date().toISOString()
    });

    // Disparar evento personalizado
    this.hotjar.trigger('purchase-complete');
  }
}
```

## Mantenimiento

### Actualizar hjid o hjsv:
Edita las líneas en `hotjar.service.ts`:
```typescript
h._hjSettings = { hjid: 6549097, hjsv: 6 };
```

### Deshabilitar temporalmente:
Opción 1 - Comentar la inyección en AppComponent:
```typescript
// private _hotjar = inject(HotjarService);
```

Opción 2 - Modificar la condición de inicialización en el servicio:
```typescript
if (isPlatformBrowser(this.platformId) && environment.production && false) {
  this.initialize();
}
```

## Testing

No se recomienda testear este servicio en entornos de desarrollo. Para testing:

1. Crea un mock del servicio
2. O utiliza un hjid de testing separado

## Referencias

- [Documentación oficial de Hotjar](https://help.hotjar.com/hc/en-us/articles/115011639927)
- [API de Hotjar](https://help.hotjar.com/hc/en-us/articles/115011867948)
