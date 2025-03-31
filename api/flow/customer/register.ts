import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { getFlowSignature } from '../../../utils/utils';

dotenv.config();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', 'https://magrolabs.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { customerId, url_return } = req.body;

    if (!customerId || !url_return) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const apiKey = process.env?.["FLOW_API_KEY"] || '';
    const url = `${process.env?.["FLOW_API_URL"] || ''}/customer/create`;

    const toSign = { apiKey, customerId, url_return };
    const signature = getFlowSignature(toSign);

    const params = new URLSearchParams();
    params.append('apiKey', apiKey || '');
    params.append('customerId', customerId);
    params.append('url_return', url_return);
    params.append('s', signature);

    const response = await axios.post(url, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error en la petición:', error);
    return res.status(500).json({ error: 'Error en el servidor', details: error.message });
  }
}