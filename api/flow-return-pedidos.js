const handler = (req, res) => {
  // Handle POST requests from Flow payment gateway for admin payment return
  // Flow sends POST to returnUrl after payment completion
  
  // Build query string excluding internal params
  const queryParams = {};
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string') {
      queryParams[key] = value;
    }
  }
  const queryString = new URLSearchParams(queryParams).toString();
  const redirectUrl = `/cuenta/pedidos${queryString ? '?' + queryString : ''}`;
  
  // Redirect with 303 (See Other) to convert POST to GET
  res.redirect(303, redirectUrl);
};

module.exports = handler;
