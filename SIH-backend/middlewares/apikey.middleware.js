export function apiAuth(req, res, next) {
  // Allow CORS preflight requests to pass through
  if (req.method === 'OPTIONS') {
    console.log('API Auth: Allowing OPTIONS request (CORS preflight)');
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey || apiKey !== process.env.API_KEY) {
    console.log('API Auth: Unauthorized - Missing or invalid API key');
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log('API Auth: Valid API key');
  next();
}

