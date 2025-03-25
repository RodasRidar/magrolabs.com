import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Configura las credenciales de Flow
const API_URL = 'https://sandbox.flow.cl/api';
const API_KEY = '1F64DDDA-4266-4F9E-9E4E-8C8E5301L580';
const SECRET = '60344fc39a48449030be09ecc53c2bd3f20b8b98';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { amount, concept, email } = req.body;

    const data = {
        apiKey: API_KEY,
        amount,
        concept,
        email,
        urlReturn: 'https://tuapp.vercel.app/success', // URL de retorno
        urlConfirmation: 'https://magrolabs.com/registro/confirmacion?status=1', // URL de confirmación
    };

    try {
        const response = await axios.post(`${API_URL}/payment/create`, data, {
            headers: { 'Content-Type': 'application/json' },
        });

        res.status(200).json({ url: response.data.url });
    } catch (error) {
        console.error('Error al crear el pago:', error);
        res.status(500).json({ error: 'No se pudo generar el pago' });
    }
}
