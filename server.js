const express = require('express');
const cors = require('cors');
const { checkComplianceHandler } = require('./dist/api/checkCompliance.js');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.post('/api/checkCompliance', async (req, res) => {
  try {
    const result = await checkComplianceHandler(req.body);
    res.json(result);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Compliance API: http://localhost:${PORT}/api/checkCompliance`);
});
