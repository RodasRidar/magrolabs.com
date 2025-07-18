const production = false;
const encrypt = false;
const precioCreatinaOnePurchase = 86;
const precioCreatinaSubscription = 69;
const precioCreatina3kgOnePurchase = 590;
const precioCreatina3kgSubscription = 470;
const precioCreatina500gSubscription = 99;
const creatinaFreeGramos = 100;
const creatinaSubscription250 = 250;
const creatinaOnePurchase250 = 250;
const creatina3kg = 3;
const creditoRegaloPorCompraMes = 10;
const creditoRegaloPorCompraAño = 120;
const creditoRegaloPorAmigoReferido = creditoRegaloPorCompraMes;
const plazoDeEntregaDiasHabiles = { min: 1, max: 4};
const plazoDeEntregaDiasHabilesCreatinaFree = { min: 3, max: 6};
const diasNormalesDePruebaOperiodoDeReflexion = 7;
const envioGratisA = {LIMA_METRO: 'Lima Metropolitana'};
const nroServicios250g = 80;
const nroServicios3kg = 720;
const nroServicios100g = 30;
const isEncuestaActive = true;
const emailAtencionClientes = 'hola@magrolabs.com';
const telefonoAtencionClientes = '51974680428';
const rucEmpresa = '20614056577';
const nroReviews = 6;
const urlApiFlow = 'https://sandbox.flow.cl/api';
const flowApiKey= '1F64DDDA-4266-4F9E-9E4E-8C8E5301L580';
const flowSecretKey = '60344fc39a48449030be09ecc53c2bd3f20b8b98';
const flowCreatina250Gr2025PlanId = '2025-creatina-250gr-mensual';
const flowPlanIdTest = 'TEST-PROD-TWO-SOLES';
const flowApiUrl = 'https://dev-function.magrolabs.com/api/flow/';
const flowUrlReturn = 'https://develop.magrolabs.com/registro/confirmacion';
const flowUrlConfirmation = 'https://dev-api.magrolabs.com/api/v1/orders/pagos/flow/confirmacion';
const creatina2025Descuento = '20%'
const plazoDeEntregaMensualesCreatina = { min: 17, max: 23};
const garantíaDeSatisfacción = 90;
const diasAntesDeSiguienteCobroSubscripcion = 5;
const fechaUltimaActualizacionCondicionesUso = '01/12/2024';
const fechaUltimaActualizacionTerminosCondiciones = '02/12/2024';
const fechaUltimaActualizacionPrivacidad = '03/12/2024';
const fechaUltimaActualizacionCookies = '04/12/2024';
const creatinaFreePrecio = 35;
const apiMagroLabs = 'https://dev-api.magrolabs.com/api/v1';
const flowUrlReturnPagoPorAdmin = 'https://develop.magrolabs.com/cuenta/pedidos';
const useProxy = false;
const cancelDiscout = 30;
const flowCouponId50PercentDiscount = 873;
const diasReembolsoCreditosLoyaltyWebshop = 14;
const flowUrlConfirmationSubscription = 'https://dev-api.magrolabs.com/api/v1/subscriptions/confirm-payment'

export const environment = {
    production,
    encrypt,
    precioCreatinaOnePurchase,
    precioCreatinaSubscription,
    creatinaFreeGramos,
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
    creatinaFreePrecio,
    apiMagroLabs,
    flowUrlReturnPagoPorAdmin,
    useProxy,
    cancelDiscout,
    flowCouponId50PercentDiscount,
    diasReembolsoCreditosLoyaltyWebshop,
    flowUrlConfirmationSubscription,
    flowPlanIdTest
};