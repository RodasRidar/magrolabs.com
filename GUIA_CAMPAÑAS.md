# 🎯 Guía de Configuración de Campañas - Magrolabs

## 📋 Resumen

Se ha implementado un sistema centralizado y flexible para gestionar diferentes campañas de la **primera creatina**. Ahora puedes cambiar fácilmente entre campañas (gratis, S/ 9.90, S/ 14.90, etc.) modificando solo unos pocos valores en los archivos de environment.

---

## 🚀 Cómo Cambiar de Campaña

### Ubicación de Configuración

Los archivos de configuración están en:
- `src/environments/env.ts` (desarrollo local)
- `src/environments/dev.env.ts` (ambiente de desarrollo)
- `src/environments/prod.env.ts` (producción)

### Pasos para Cambiar la Campaña

1. **Abre el archivo de environment correspondiente**

2. **Busca la sección `campanaPrimeraCreatina`** (aproximadamente línea 13-108)

3. **Modifica solo estos 3 valores:**

```typescript
const campanaPrimeraCreatina = {
  // 👇 Cambiar entre 'gratis' o 'precio-especial'
  tipo: 'precio-especial' as 'gratis' | 'precio-especial',
  
  // 👇 Precio: 0 si es gratis, o el precio promocional (9.90, 14.90, etc.)
  precio: 9.90,
  
  // 👇 Gramos de la primera creatina (usualmente 100)
  gramos: 100,
  
  // ⚠️ NO MODIFICAR la sección 'textos' - se genera automáticamente
  get textos() { ... }
};
```

---

## 📝 Ejemplos de Configuraciones

### Ejemplo 1: Campaña GRATIS

```typescript
const campanaPrimeraCreatina = {
  tipo: 'gratis' as 'gratis' | 'precio-especial',
  precio: 0,
  gramos: 100,
  get textos() { ... }
};
```

**Resultado en la web:**
- "Regístrate ahora y recibe tu **primera creatina gratis**"
- "¿Por qué recibo la primera creatina gratis?"
- "Creatina gratis (100 gr) se entrega en un plazo de..."

---

### Ejemplo 2: Campaña a S/ 9.90

```typescript
const campanaPrimeraCreatina = {
  tipo: 'precio-especial' as 'gratis' | 'precio-especial',
  precio: 9.90,
  gramos: 100,
  get textos() { ... }
};
```

**Resultado en la web:**
- "Regístrate ahora y recibe tu **primera creatina a solo S/ 9.90**"
- "¿Por qué la primera creatina cuesta solo S/ 9.90?"
- "Primera creatina (100 gr) a S/ 9.90 se entrega en un plazo de..."

---

### Ejemplo 3: Campaña a S/ 14.90

```typescript
const campanaPrimeraCreatina = {
  tipo: 'precio-especial' as 'gratis' | 'precio-especial',
  precio: 14.90,
  gramos: 100,
  get textos() { ... }
};
```

**Resultado en la web:**
- "Regístrate ahora y recibe tu **primera creatina a solo S/ 14.90**"
- "¿Por qué la primera creatina cuesta solo S/ 14.90?"
- Todos los textos se actualizan automáticamente

---

## 🎨 Textos que se Actualizan Automáticamente

El sistema actualiza automáticamente más de **30 ubicaciones** en tu sitio web:

### Componentes Actualizados:
- ✅ Hero section (página principal)
- ✅ Landing page (FAQs, secciones de beneficios)
- ✅ Páginas de registro y planes
- ✅ Confirmación de pedidos
- ✅ Páginas de productos (creatinas)
- ✅ Cuenta de usuario
- ✅ Meta tags y SEO
- ✅ Datos estructurados (Schema.org)
- ✅ Twitter Cards
- ✅ Open Graph

### Textos Dinámicos Disponibles:

```typescript
// Ejemplos de uso en templates:
ENV.campanaPrimeraCreatina.textos.ofertaCorta          // "GRATIS" o "S/ 9.90"
ENV.campanaPrimeraCreatina.textos.ofertaMedia          // "gratis" o "a solo S/ 9.90"
ENV.campanaPrimeraCreatina.textos.heroOferta           // "primera creatina gratis" o "primera creatina a solo S/ 9.90"
ENV.campanaPrimeraCreatina.textos.heroOfertaMayuscula  // "Primera creatina GRATIS" o "Primera creatina a S/ 9.90"

// FAQs
ENV.campanaPrimeraCreatina.textos.faqTituloOferta
ENV.campanaPrimeraCreatina.textos.faqRespuestaOferta
ENV.campanaPrimeraCreatina.textos.faqTituloRecepcion
ENV.campanaPrimeraCreatina.textos.faqRespuestaRecepcion(min, max)

// Carritos y descripciones
ENV.campanaPrimeraCreatina.textos.descripcionCarrito(gramos)
ENV.campanaPrimeraCreatina.textos.descripcionSEO

// Botones CTA
ENV.campanaPrimeraCreatina.textos.ctaBoton(dias)
ENV.campanaPrimeraCreatina.textos.ctaBotonAlt

// Notas al pie
ENV.campanaPrimeraCreatina.textos.notaPie(gramos, min, max)
```

---

## ⚡ Flujo de Trabajo Recomendado

### Para Cambiar de Campaña:

1. **Decide la nueva campaña:**
   - ¿Será gratis?
   - ¿Tendrá un precio especial?
   - ¿Cuántos gramos?

2. **Modifica los 3 archivos de environment:**
   - `env.ts` (para desarrollo local)
   - `dev.env.ts` (para testing en desarrollo)
   - `prod.env.ts` (para producción)

3. **Valores a cambiar:**
   ```typescript
   tipo: 'gratis' o 'precio-especial'
   precio: 0 o el precio deseado (9.90, 14.90, etc.)
   gramos: 100 (o la cantidad deseada)
   ```

4. **Guarda los cambios**

5. **Reinicia el servidor de desarrollo** (si está corriendo)

6. **Verifica en tu navegador:**
   - Hero section
   - FAQs
   - Páginas de registro
   - Página de productos

7. **Deploy a producción** cuando estés satisfecho

---

## 🔍 Testing

### Antes de Deploy a Producción:

- [ ] Verifica la página principal (Hero)
- [ ] Lee las FAQs - ¿tienen sentido los textos?
- [ ] Revisa el flujo de registro completo
- [ ] Verifica las páginas de productos
- [ ] Comprueba las meta tags (inspecciona el HTML)
- [ ] Prueba el carrito de compras

---

## 🛠️ Archivos Modificados

### Archivos de Configuración:
- `src/environments/env.ts`
- `src/environments/dev.env.ts`
- `src/environments/prod.env.ts`

### Componentes Actualizados:
- `src/app/ecommerce/landing/components/hero/hero.component.html`
- `src/app/ecommerce/landing/landing.component.html`
- `src/app/ecommerce/landing/landing.component.ts`
- `src/app/ecommerce/signup/pages/plans/plans.component.html`
- `src/app/ecommerce/signup/pages/plans/plans.component.ts`
- `src/app/ecommerce/signup/pages/verification-payment/verification-payment.component.html`
- `src/app/ecommerce/signup/pages/verification-payment/verification-payment.component.ts`
- `src/app/ecommerce/signup/pages/confirmation/confirmation.component.ts`
- `src/app/ecommerce/signup/signup.component.ts`
- `src/app/ecommerce/landing/pages/productos/pages/creatinas/creatinas.component.ts`
- `src/app/account/pages/cuenta/cuenta.component.ts`
- `src/app/shared/services/profile-completion.service.ts`
- `src/index.html`

---

## ⚠️ Notas Importantes

1. **Siempre actualiza los 3 archivos de environment** (env.ts, dev.env.ts, prod.env.ts) para mantener consistencia.

2. **No modifiques la sección `get textos()`** - está diseñada para generar automáticamente todos los textos según el tipo y precio.

3. **Las variables legacy** (`creatinaFreeGramos`, `creatinaFreePrecio`) se mantienen por compatibilidad pero están marcadas como deprecadas. Usa `campanaPrimeraCreatina` en código nuevo.

4. **Reinicia el servidor de desarrollo** después de cambiar los archivos de environment.

5. **Los textos en español usan "S/"** para el símbolo de moneda (Soles peruanos).

---

## 🎯 Ventajas del Nuevo Sistema

✅ **Centralizado**: Un solo lugar para configurar la campaña
✅ **Resiliente**: Fácil volver a campañas anteriores
✅ **Automático**: Todos los textos se actualizan automáticamente
✅ **SEO-friendly**: Meta tags y datos estructurados se adaptan
✅ **Type-safe**: TypeScript asegura que uses los valores correctos
✅ **Escalable**: Fácil agregar nuevos tipos de campaña en el futuro

---

## 🆘 Soporte

Si tienes preguntas o encuentras algún problema:

1. Verifica que modificaste los 3 archivos de environment
2. Reinicia el servidor de desarrollo
3. Revisa la consola del navegador por errores
4. Verifica que los valores `tipo`, `precio` y `gramos` son correctos

---

## 📅 Historial de Campañas Sugeridas

Puedes mantener un registro aquí de las campañas que has usado:

| Fecha | Tipo | Precio | Gramos | Notas |
|-------|------|--------|--------|-------|
| 2025-11 | precio-especial | 9.90 | 100 | Campaña de lanzamiento S/ 9.90 |
| 2025-XX | gratis | 0.00 | 100 | Campaña original gratis |
| 2025-XX | precio-especial | 14.90 | 100 | Campaña futura sugerida |

---

**¡Éxito con tus campañas! 🚀**
