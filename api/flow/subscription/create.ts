import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { getFlowSignature } from '../../../utils/utils';

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
        const { planId, customerId, subscription_start, couponId, trial_period_days, periods_number } = req.body;

        if (!planId || !customerId) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        const apiKey = process.env?.["FLOW_API_KEY"] || '';
        const apiUrl = `${process.env?.["FLOW_API_URL"] || ''}/subscription/create`;


        const params = new URLSearchParams({
            apiKey: apiKey ?? '',
            planId,
            customerId,
            s: getFlowSignature({ apiKey, planId, customerId }),
        });

        if (subscription_start) params.append('subscription_start', subscription_start);
        if (couponId) params.append('couponId', couponId);
        if (trial_period_days) params.append('trial_period_days', trial_period_days.toString());
        if (periods_number) params.append('periods_number', periods_number.toString());

        const response = await axios.post(apiUrl, params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        return res.status(200).json(response.data);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}