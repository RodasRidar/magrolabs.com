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
const rucEmpresa = '20705878477';
const nroReviews = 6;
const urlPagosFlowProduction = 'https://www.flow.cl/api';
const urlPagosFlowSandbox = 'https://sandbox.flow.cl/api';


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
    urlPagosFlowProduction,
    urlPagosFlowSandbox
};