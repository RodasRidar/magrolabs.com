import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Handle POST requests from Flow payment gateway
  // Flow sends POST to returnUrl after payment completion
  
  // Build query string preserving all params
  const queryParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string') {
      queryParams[key] = value;
    }
  }
  const queryString = new URLSearchParams(queryParams).toString();
  const redirectUrl = `/registro/confirmacion${queryString ? '?' + queryString : ''}`;
  
  // Redirect with 303 (See Other) to convert POST to GET
  res.redirect(303, redirectUrl);
}
