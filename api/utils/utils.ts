export function getFlowSignature(params: Record<string, string | number>): string {
    const CryptoJS = require('crypto-js');
    const sortedKeys = Object.keys(params).sort();
    const concatenatedString = sortedKeys.map(key => `${key}${params[key]}`).join('');
    return CryptoJS.enc.Base64.stringify(
      CryptoJS.HmacSHA256(concatenatedString, process.env['FLOW_SECRET_KEY'] || '')
    );
  }
  