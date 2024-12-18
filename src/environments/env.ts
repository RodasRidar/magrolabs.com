const production = true;
const APP_URL = 'develop.magrolabs.com';
const secretKey = '<<LLAVE PRIVADA>>';
const publicKey = '<<LLAVE PÚBLICA>>';
const rsaId = '<<LLAVE PÚBLICA RSA ID>>';
const rsaPublickKey = '<<LLAVE PÚBLICA RSA>>';
const encrypt = false;
const precioCreatinaOnePurchase = 59;
const precioCreatinaSubscription = 47;
const precioCreatina3kgOnePurchase = 590;
const precioCreatina3kgSubscription = 470;
const creatinaFreeGramos = 100;
const creatinaSubscription250 = 250;
const creatinaOnePurchase250 = 250;
const creatina3kg = 3;
const creditoRegaloPorCompraMes = 10;
const creditoRegaloPorCompraAño = 120;
const creditoRegaloPorAmigoReferido = creditoRegaloPorCompraMes;
const plazoDeEntregaDiasHabiles = { min: 1, max: 4};
const plazoDeEntregaDiasHabilesCreatinaFree = { min: 6, max: 9};
const diasNormalesDePruebaOperiodoDeReflexion = 7;
const envioGratisA = {LIMA_METRO: 'Lima Metropolitana'};
const nroServicios250g = 60;
const nroServicios3kg = 720;
const nroServicios100g = 24;
const isEncuestaActive = true;


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
    isEncuestaActive
};