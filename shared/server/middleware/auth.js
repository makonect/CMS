// Simple authentication middleware for dashboard
// Since we're using fixed credentials, we'll implement basic session check

export const authenticate = (req, res, next) => {
  // For now, we'll allow all requests to the API
  // In a production environment, you should implement proper authentication
  next();
};

// Optional: Add API key authentication for AI endpoints
export const authenticateAI = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  // Check if API key matches (you can set this in environment variables)
  if (apiKey === process.env.API_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};