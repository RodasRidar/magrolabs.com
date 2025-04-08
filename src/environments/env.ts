const production = false;
const APP_URL = 'develop.magrolabs.com';
const secretKey = '<<LLAVE PRIVADA>>';
const publicKey = '<<LLAVE PÚBLICA>>';
const rsaId = '<<LLAVE PÚBLICA RSA ID>>';
const rsaPublickKey = '<<LLAVE PÚBLICA RSA>>';
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
const nroServicios250g = 60;
const nroServicios3kg = 720;
const nroServicios100g = 24;
const isEncuestaActive = true;
const emailAtencionClientes = 'hola@magrolabs.com';
const telefonoAtencionClientes = '51974680428';
const rucEmpresa = '20614056577';
const nroReviews = 6;
const urlApiFlow = '/api';
const flowApiKey= '1F64DDDA-4266-4F9E-9E4E-8C8E5301L580';
const flowSecretKey = '60344fc39a48449030be09ecc53c2bd3f20b8b98';
const flowCreatina250Gr2025PlanId = '2025-creatina-250gr-mensual';
const flowApiUrl = 'https://function.magrolabs.com/api/flow/';
const flowUrlReturn = 'http://localhost:4200/registro/confirmacion';
const flowUrlConfirmation = 'http://localhost:4200/registro/confirmacion';
const creatina2025Descuento = '20%'
const plazoDeEntregaMensualesCreatina = { min: 17, max: 23};
const garantíaDeSatisfacción = 90;
const diaDeCobroSubscripcion = 27;
const fechaUltimaActualizacionCondicionesUso = '01/12/2024';
const fechaUltimaActualizacionTerminosCondiciones = '02/12/2024';
const fechaUltimaActualizacionPrivacidad = '03/12/2024';
const fechaUltimaActualizacionCookies = '04/12/2024';
const creatinaFreePrecio = 35;

export const environment = {
    APP_URL,
    production,
    secretKey,
    publicKey,
    rsaId,
    rsaPublickKey,
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
    diaDeCobroSubscripcion,
    fechaUltimaActualizacionCondicionesUso,
    fechaUltimaActualizacionTerminosCondiciones,
    fechaUltimaActualizacionPrivacidad,
    fechaUltimaActualizacionCookies,
    creatinaFreePrecio
};