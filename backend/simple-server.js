const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Mock API endpoints for testing
app.get('/api/v1/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalThreats: 156,
      criticalThreats: 23,
      highThreats: 45,
      mediumThreats: 67,
      lowThreats: 21,
      threatsByCategory: {
        'ransomware': 34,
        'phishing': 28,
        'malware': 25,
        'vulnerability': 22,
        'apt': 18
      },
      threatsBySource: {
        'Dark Web Monitor': 45,
        'CVE Database': 32,
        'US-CERT Alerts': 28,
        'Threatpost': 25,
        'NVD Database': 26
      },
      recentAlerts: []
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/dashboard/alerts', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'alert_001',
        threatId: 'threat_001',
        title: 'Critical Ransomware Detection',
        description: 'New ransomware campaign targeting healthcare sector',
        severity: 0.9,
        category: 'ransomware',
        source: 'Dark Web Monitor',
        timestamp: new Date().toISOString(),
        status: 'new',
        metadata: {
          affectedSectors: ['Healthcare'],
          confidence: 0.95,
          iocs: ['malware-sample.exe', '192.168.1.100']
        }
      },
      {
        id: 'alert_002',
        threatId: 'threat_002',
        title: 'Phishing Campaign Detected',
        description: 'Sophisticated phishing attack targeting financial institutions',
        severity: 0.7,
        category: 'phishing',
        source: 'US-CERT Alerts',
        timestamp: new Date().toISOString(),
        status: 'investigating',
        metadata: {
          affectedSectors: ['Financial Services'],
          confidence: 0.88,
          iocs: ['phishing-site.com', 'fake-login-page.net']
        }
      }
    ],
    count: 2,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Cyber Threat Intelligence Platform Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Dashboard API: http://localhost:${PORT}/api/v1/dashboard/stats`);
});
