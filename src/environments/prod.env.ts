const production = true;
const encrypt = false;
const precioCreatinaOnePurchase = 69;
const precioCreatinaSubscription = 55;
const precioCreatina3kgOnePurchase = 590;
const precioCreatina3kgSubscription = 470;
const precioCreatina500gSubscription = 99;

// ============================================
// CONFIGURACIÓN DE CAMPAÑA DE PRIMERA CREATINA
// ============================================
// Tipos de campaña soportados:
// - 'gratis': Primera creatina completamente gratis (S/ 0.00)
// - 'precio-especial': Primera creatina con precio promocional (ej: S/ 9.90, S/ 14.90, etc.)
// 
// Para cambiar de campaña, solo modifica estos valores:

const campanaPrimeraCreatina = {
  // Tipo de campaña: 'gratis' | 'precio-especial'
  tipo: 'precio-especial' as 'gratis' | 'precio-especial',
  
  // Precio de la primera creatina (0 si es gratis, ej: 9.90, 14.90, etc.)
  precio: 9.90,
  
  // Gramos de la primera creatina
  gramos: 100,
  
  // Textos dinámicos según el tipo de campaña
  get textos() {
    if (this.tipo === 'gratis') {
      return {
        // Textos cortos
        ofertaCorta: 'GRATIS',
        ofertaMedia: 'gratis',
        ofertaConPrecio: 'gratis (S/ 0.00)',
        
        // Textos para hero/landing
        heroOferta: 'primera creatina gratis',
        heroOfertaMayuscula: 'Primera creatina GRATIS',
        
        // Textos para FAQs
        faqTituloRecepcion: '¿Cuándo recibiré mi creatina gratis?',
        faqTituloOferta: '¿Por qué recibo la primera creatina gratis?',
        faqRespuestaOferta: 'Te regalamos la primera creatina porque estamos 100% convencidos de la calidad de nuestro producto. Queremos que experimentes los beneficios reales de una creatina monohidratada pura antes de cualquier compromiso. Es nuestra forma de demostrar confianza en lo que ofrecemos.',
        faqRespuestaRecepcion: (plazoMin: number, plazoMax: number) => 
          `Después de completar tu registro, tu creatina gratis llegará a tu casa en un plazo de ${plazoMin} a ${plazoMax} horas. Te enviaremos el código de seguimiento para que puedas rastrear tu paquete en tiempo real.`,
        
        // Textos para descripciones
        descripcionCarrito: (gramos: number) => `Creatina ${gramos}gr (prueba gratis)`,
        descripcionSEO: 'Primera creatina GRATIS',
        
        // Textos para promociones
        promocionTitulo: '¿Por qué recibo la primera creatina gratis?',
        promocionRespuesta: (plazoMax: number, diasPrueba: number) => 
          `Después de completar tu registro, recibirás tu primera creatina gratis dentro de ${plazoMax} horas. Durante los primeros ${diasPrueba} días, puedes probar tranquilamente tu creatina de 100 gramos, este es tu período de prueba. Luego, pasarás a una suscripción de pago y comenzarán tus pagos y entregas mensuales. ¿Te das de baja en tus primeros ${diasPrueba} días? Entonces perderás tus beneficios gratis.`,
        
        // CTA buttons
        ctaBoton: (dias: number) => `Prueba gratis de ${dias} días →`,
        ctaBotonAlt: 'Obtener creatina gratis',
        
        // Notas al pie
        notaPie: (gramos: number, plazoMin: number, plazoMax: number) => 
          `Creatina gratis (${gramos} gr) se entrega en un plazo de ${plazoMin} a ${plazoMax} horas.`,
      };
    } else {
      // precio-especial
      const precioFormateado = this.precio.toFixed(2);
      return {
        // Textos cortos
        ofertaCorta: `S/ ${precioFormateado}`,
        ofertaMedia: `a solo S/ ${precioFormateado}`,
        ofertaConPrecio: `a S/ ${precioFormateado}`,
        
        // Textos para hero/landing
        heroOferta: `primera creatina a solo S/ ${precioFormateado}`,
        heroOfertaMayuscula: `Primera creatina a S/ ${precioFormateado}`,
        
        // Textos para FAQs
        faqTituloRecepcion: '¿Cuándo recibiré mi primera creatina?',
        faqTituloOferta: `¿Por qué la primera creatina cuesta solo S/ ${precioFormateado}?`,
        faqRespuestaOferta: `Ofrecemos tu primera creatina a un precio especial de S/ ${precioFormateado} porque queremos que pruebes la calidad superior de nuestro producto. Estamos tan convencidos de nuestra creatina monohidratada pura que te damos esta oportunidad única de probarla a un precio increíble antes de comprometerte con la suscripción.`,
        faqRespuestaRecepcion: (plazoMin: number, plazoMax: number) => 
          `Después de completar tu registro y pago de S/ ${precioFormateado}, tu primera creatina llegará a tu casa en un plazo de ${plazoMin} a ${plazoMax} horas. Te enviaremos el código de seguimiento para que puedas rastrear tu paquete en tiempo real.`,
        
        // Textos para descripciones
        descripcionCarrito: (gramos: number) => `Creatina ${gramos}gr (primera a S/ ${precioFormateado})`,
        descripcionSEO: `Primera creatina a S/ ${precioFormateado}`,
        
        // Textos para promociones
        promocionTitulo: `¿Por qué la primera creatina cuesta solo S/ ${precioFormateado}?`,
        promocionRespuesta: (plazoMax: number, diasPrueba: number) => 
          `Después de completar tu registro, recibirás tu primera creatina por solo S/ ${precioFormateado} dentro de ${plazoMax} horas. Durante los primeros ${diasPrueba} días, puedes probar tu creatina de 100 gramos, este es tu período de prueba. Luego, pasarás a una suscripción de pago regular y comenzarán tus pagos y entregas mensuales normales. ¿Te das de baja en tus primeros ${diasPrueba} días? No hay problema, solo pagarás los S/ ${precioFormateado} de tu primera creatina.`,
        
        // CTA buttons
        ctaBoton: (dias: number) => `Prueba ${dias} días por S/ ${precioFormateado} →`,
        ctaBotonAlt: `Obtener por S/ ${precioFormateado}`,
        
        // Notas al pie
        notaPie: (gramos: number, plazoMin: number, plazoMax: number) => 
          `Primera creatina (${gramos} gr) a S/ ${precioFormateado} se entrega en un plazo de ${plazoMin} a ${plazoMax} horas.`,
      };
    }
  }
};

// Mantener variables legacy para compatibilidad (DEPRECADAS - usar campanaPrimeraCreatina)
const creatinaFreeGramos = campanaPrimeraCreatina.gramos;
const creatinaFreePrecio = 45;

const creatinaSubscription250 = 250;
const creatinaOnePurchase250 = 250;
const creatina3kg = 3;
const creditoRegaloPorCompraMes = 10;
const creditoRegaloPorCompraAño = 120;
const creditoRegaloPorAmigoReferido = creditoRegaloPorCompraMes;
const plazoDeEntregaDiasHabiles = { min: 1, max: 2};
const plazoDeEntregaDiasHabilesCreatinaFree = { min: 1, max: 2};
const plazoDeEntregaHoras = { min: plazoDeEntregaDiasHabiles.min * 24, max: plazoDeEntregaDiasHabiles.max * 24};
const plazoDeEntregaHorasCreatinaFree = { min: plazoDeEntregaDiasHabilesCreatinaFree.min * 24, max: plazoDeEntregaDiasHabilesCreatinaFree.max * 24};
const diasNormalesDePruebaOperiodoDeReflexion = 7;
const envioGratisA = {LIMA_METRO: 'Lima Metropolitana'};
const nroServicios250g = 80;
const nroServicios3kg = 720;
const nroServicios100g = 30;
const isEncuestaActive = true;
const emailAtencionClientes = 'hola@magrolabs.com';
const telefonoAtencionClientes = '51950794501';
const rucEmpresa = '20614056577';
const nroReviews = 12;
const urlApiFlow = 'https://flow.cl/api';
const flowCreatina250Gr2025PlanId = '2025-creatina-250gr-mensual';
const flowCreatina250Gr2025_79_PlanId = '2025-creatina-250gr-mensual-79';
const flowCreatina250Gr2025_55_PlanId = '2026-creatina-250gr-mensual-55';
const flowPlanIdTest = 'TEST-PROD-TWO-SOLES';
const flowApiKey= '1F64DDDA-4266-4F9E-9E4E-8C8E5301L580';
const flowSecretKey = '60344fc39a48449030be09ecc53c2bd3f20b8b98';
const flowApiUrl = 'https://function.magrolabs.com/api/flow/';
const flowUrlReturn = 'https://www.magrolabs.com/api/flow-return';
const flowUrlConfirmation = 'https://api.magrolabs.com/api/v1/orders/pagos/flow/confirmacion';
const creatina2025Descuento = '20%';
const plazoDeEntregaMensualesCreatina = { min: 17, max: 23};
const garantíaDeSatisfacción = 90;
const diasAntesDeSiguienteCobroSubscripcion = 5;
const fechaUltimaActualizacionCondicionesUso = '01/12/2024';
const fechaUltimaActualizacionTerminosCondiciones = '02/12/2024';
const fechaUltimaActualizacionPrivacidad = '03/12/2024';
const fechaUltimaActualizacionCookies = '04/12/2024';
const apiMagroLabs = 'https://api.magrolabs.com/api/v1';
const flowUrlReturnPagoPorAdmin = 'https://www.magrolabs.com/api/flow-return-pedidos';
const useProxy = false;
const cancelDiscout = 20;
const flowCouponId50PercentDiscount = 5104;
const diasReembolsoCreditosLoyaltyWebshop = 14;
const flowUrlConfirmationSubscription = 'https://api.magrolabs.com/api/v1/subscriptions/confirm-payment'
const flowCouponId30PercentDiscount = 5215;
const precioEnvioFueraLimaMetropolitana = 14;
const tiktokTrackingEnabled = true;
const tiktokPixelId = 'D632L4JC77U5AUBMNBGG'; // ID del pixel de TikTok para producción
const metaTrackingEnabled = true;
const metaPixelId = '797277002911669'; // ID del pixel de Meta para producción
const metaDebug = false;
const isBlackFridayActive = false;
const creatina100GrDescuentoBlackFriday = '80%';

export const environment = {
    production,
    encrypt,
    precioCreatinaOnePurchase,
    precioCreatinaSubscription,
    
    // Nueva configuración de campaña centralizada
    campanaPrimeraCreatina,
    
    // Variables legacy (deprecadas - usar campanaPrimeraCreatina)
    creatinaFreeGramos,
    creatinaFreePrecio,
    
    creatinaSubscription250,
    creatinaOnePurchase250,
    creditoRegaloPorCompraMes,
    creditoRegaloPorAmigoReferido,
    plazoDeEntregaDiasHabiles,
    diasNormalesDePruebaOperiodoDeReflexion,
    envioGratisA,
    plazoDeEntregaDiasHabilesCreatinaFree,
    nroServicios250g,
    nroServicios3kg,
    nroServicios100g,
    precioCreatina3kgOnePurchase,
    precioCreatina3kgSubscription,
    creditoRegaloPorCompraAño,
    creatina3kg,
    isEncuestaActive,
    emailAtencionClientes,
    telefonoAtencionClientes,
    rucEmpresa,
    precioCreatina500gSubscription,
    nroReviews,
    urlApiFlow,
    flowApiKey,
    flowSecretKey,
    flowCreatina250Gr2025PlanId,
    flowApiUrl,
    flowUrlReturn,
    flowUrlConfirmation,
    creatina2025Descuento,
    plazoDeEntregaMensualesCreatina,
    garantíaDeSatisfacción,
    diasAntesDeSiguienteCobroSubscripcion,
    fechaUltimaActualizacionCondicionesUso,
    fechaUltimaActualizacionTerminosCondiciones,
    fechaUltimaActualizacionPrivacidad,
    fechaUltimaActualizacionCookies,
    apiMagroLabs,
    flowUrlReturnPagoPorAdmin,
    useProxy,
    cancelDiscout,
    flowCouponId50PercentDiscount,
    diasReembolsoCreditosLoyaltyWebshop,
    flowUrlConfirmationSubscription,
    flowPlanIdTest,
    flowCouponId30PercentDiscount,
    precioEnvioFueraLimaMetropolitana,
    tiktokTrackingEnabled,
    tiktok: {
        pixelId: tiktokPixelId,
        enabled: tiktokTrackingEnabled
    },
    metaTrackingEnabled,
    meta: {
        pixelId: metaPixelId,
        enabled: metaTrackingEnabled,
        debug: metaDebug
    },
    plazoDeEntregaHoras,
    plazoDeEntregaHorasCreatinaFree,
    flowCreatina250Gr2025_79_PlanId,
    isBlackFridayActive,
    creatina100GrDescuentoBlackFriday,
    flowCreatina250Gr2025_55_PlanId
};