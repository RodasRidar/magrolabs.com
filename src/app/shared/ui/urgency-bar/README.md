# Urgency Bar Component

Componente de barra de urgencia con temporizador de cuenta regresiva para aumentar conversiones. Diseño minimalista dark mode.

## Características

- ✅ Temporizador de 48 horas inicial
- ✅ Cambia a "última oportunidad" con 12 horas cuando el tiempo se agota
- ✅ Se ejecuta solo en el navegador (SSR compatible)
- ✅ Persiste el estado en localStorage
- ✅ **Diseño minimalista dark mode** con fondo negro puro
- ✅ **Color de marca #d07d66** para elementos destacados
- ✅ Animaciones suaves y no intrusivas
- ✅ **Efecto marquesina mejorado en móviles < 768px**: 
  - Scroll infinito sin espacios vacíos
  - Duración de 22.5 segundos (50% más lento)
  - Contenido duplicado para continuidad perfecta
- ✅ **Gestión de unidades disponibles**: Decrementa automáticamente al completar compras/suscripciones
- ✅ **Copy limpio y directo**: Mensajes concisos sin elementos innecesarios
- ✅ **Responsive**: Desktop centrado, móvil con marquee

## Diseño UI/UX

### Barra de Urgencia (Fase 1 y 2)
- **Fondo**: Negro puro (#000000) con borde inferior sutil (#d07d66/20)
- **Tipografía**: Gray-300 para texto normal, #d07d66 para información importante
- **Mensaje**: 
  - Fase 1: "{{ X }} packs gratis disponibles"
  - Fase 2: "Solo quedan {{ X }} unidades"
- **Temporizador**: Números en color #d07d66 con formato HH:MM:SS
- **Separadores**: Líneas verticales sutiles en gray-700
- **Espaciado**: Max-width 7xl con padding responsive

### Barra de Beneficios (Post-oferta)
- **Fondo**: Negro puro consistente con la barra de urgencia
- **Emojis**: 🚀 (Envío Express) + 📦 (Envío gratis)
- **Mensajes**: 
  - "Envío Express 24H" (destacado en #d07d66)
  - "Envío gratis en Lima Metropolitana" (gratis destacado en #d07d66)
- **Layout**: Dos secciones separadas por divisor vertical

## Uso

```typescript
import { UrgencyBarComponent } from '../../shared/ui/urgency-bar/urgency-bar.component';

@Component({
  imports: [UrgencyBarComponent],
  // ...
})
```

```html
<app-urgency-bar></app-urgency-bar>
```

## Lógica del Temporizador

1. **Fase 1 (48 horas)**: 
   - Badge: "Oferta Flash"
   - Mensaje: "{{ X }} packs gratis disponibles hoy"
   - Colores: Rojo-naranja vibrante
   
2. **Fase 2 (12 horas)**: 
   - Badge: "¡Última Chance!"
   - Mensaje: "Solo quedan {{ X }} unidades del pack gratuito"
   - Colores: Rojo intenso con mayor urgencia
   
3. **Finalización**: 
   - Transición automática a Barra de Beneficios
   - Diseño premium verde esmeralda
   - Mensaje: "Entrega rápida en Lima Metropolitana - Envío Express Gratis"

### Ocultamiento Automático y Barra de Envío
Cuando el temporizador de la Fase 2 llega a 0:
- La propiedad `isVisible` se establece en `false`
- Se guarda en localStorage con la clave `urgencyBarVisible: 'false'`
- El intervalo del temporizador se detiene
- La barra de urgencia desaparece
- **Aparece automáticamente una nueva barra verde con el mensaje**: "Envío rápido 24h y gratis para Lima Metropolitana"
- El estado persiste entre recargas de página

## Gestión de Unidades

### Decrementar Unidades
Cuando se completa una compra o suscripción, llama al método estático:

```typescript
import { UrgencyBarComponent } from '../../shared/ui/urgency-bar/urgency-bar.component';

// En el componente de confirmación
UrgencyBarComponent.decrementUnits();
```

### Resetear Unidades
Para reiniciar el contador de unidades (útil para testing o administración):

```typescript
// Resetear a 10 unidades (por defecto)
UrgencyBarComponent.resetUnits();

// O especificar un número personalizado
UrgencyBarComponent.resetUnits(5);
```

## Almacenamiento Local

- `offerEndTime`: Timestamp del fin de la oferta actual
- `isLastChance`: Boolean que indica si está en fase 2
- `unitsAvailable`: Número de unidades disponibles (10 en fase 1, 3 en fase 2)
- `urgencyBarVisible`: Boolean que controla la visibilidad de la barra ('true' o 'false')

### Reiniciar la Barra
Para volver a mostrar la barra después de que se haya ocultado:

```typescript
// En la consola del navegador o en código
localStorage.setItem('urgencyBarVisible', 'true');
localStorage.removeItem('offerEndTime');
localStorage.removeItem('isLastChance');
localStorage.setItem('unitsAvailable', '10');
// Recargar la página
window.location.reload();
```

## Integración con Confirmación

El componente de confirmación automáticamente decrementa las unidades cuando:
- Se completa una suscripción exitosa
- Se completa una compra con registro
- Se completa una compra sin registro
- Se completa una suscripción fuera de Lima Metropolitana

Las unidades se preservan incluso después de `localStorage.clear()` para mantener la continuidad de la campaña.

## Testing y Desarrollo

### Botón de Testing (⚡4s)
El componente incluye un botón pequeño amarillo al lado del temporizador que permite establecer el contador a 4 segundos del final para testing rápido.

**Características:**
- Solo visible en desarrollo
- Color amarillo para fácil identificación
- Al hacer clic, establece el temporizador a 4 segundos
- Útil para probar la transición entre fases
- Modifica el localStorage automáticamente

**Para testing en consola:**
```typescript
// Establecer a 4 segundos del final
component.setCountdownToFourSeconds();
```

### Recomendaciones para Producción
Si deseas ocultar el botón en producción, puedes:

1. **Agregar una condición en el HTML:**
```html
<button 
    *ngIf="!isProduction"
    (click)="setCountdownToFourSeconds()"
    ...>
```

2. **En el componente TypeScript:**
```typescript
import { environment } from '../../../environments/env';

isProduction = environment.production;
```
