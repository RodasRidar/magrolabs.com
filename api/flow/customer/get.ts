import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { getFlowSignature } from '../../../utils/utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', 'https://magrolabs.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({ error: 'Falta el customerId' });
    }

    const apiKey = process.env?.["FLOW_API_KEY"] || '';
    const apiUrl = `${process.env?.["FLOW_API_URL"] || ''}/customer/edit`;


    const params = new URLSearchParams({
      customerId: String(customerId),
      apiKey: apiKey,
      s: getFlowSignature({ apiKey, customerId: String(customerId) }),
    });

    const response = await axios.get(`${apiUrl}?${params.toString()}`);

    return res.status(200).json(response.data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
