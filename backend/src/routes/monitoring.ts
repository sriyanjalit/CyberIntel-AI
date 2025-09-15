import { Router, Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import { logger } from '../config/logger';

const router = Router();

// Get real-time threat monitoring dashboard data
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const dashboardData = {
      timestamp: new Date().toISOString(),
      activeThreats: {
        total: 1250,
        critical: 45,
        high: 180,
        medium: 650,
        low: 375
      },
      recentAlerts: [
        {
          id: 'alert_1',
          title: 'Critical Zero-Day Vulnerability Detected',
          severity: 'critical',
          timestamp: new Date(Date.now() - 300000), // 5 minutes ago
          source: 'CVE Database',
          status: 'new'
        },
        {
          id: 'alert_2',
          title: 'Ransomware Campaign Targeting Healthcare',
          severity: 'high',
          timestamp: new Date(Date.now() - 900000), // 15 minutes ago
          source: 'Threatpost',
          status: 'investigating'
        },
        {
          id: 'alert_3',
          title: 'Phishing Campaign Using COVID-19 Theme',
          severity: 'medium',
          timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
          source: 'US-CERT',
          status: 'confirmed'
        }
      ],
      threatTrends: {
        last24Hours: 25,
        lastWeek: 150,
        trend: 'increasing' // increasing, decreasing, stable
      },
      systemHealth: {
        dataIngestion: 'healthy',
        aiAnalysis: 'healthy',
        database: 'healthy',
        redis: 'healthy'
      }
    };

    res.json({ dashboard: dashboardData });
  } catch (error) {
    logger.error('Error fetching monitoring dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get real-time threat feed
router.get('/feed', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { limit = 20 } = req.query;

    const threatFeed = [
      {
        id: 'threat_1',
        title: 'Critical Zero-Day Vulnerability in Apache HTTP Server',
        description: 'A critical zero-day vulnerability has been discovered in Apache HTTP Server that allows remote code execution.',
        severity: 0.9,
        category: 'vulnerability',
        timestamp: new Date(),
        source: 'CVE Database',
        metadata: { cveId: 'CVE-2024-1234', cvss: 9.8 }
      },
      {
        id: 'threat_2',
        title: 'New Ransomware Campaign Targeting Healthcare',
        description: 'A new ransomware campaign has been identified targeting healthcare organizations with sophisticated encryption.',
        severity: 0.8,
        category: 'ransomware',
        timestamp: new Date(Date.now() - 300000),
        source: 'Threatpost',
        metadata: { ioc: 'malware_hash_123', target: 'healthcare' }
      },
      {
        id: 'threat_3',
        title: 'Phishing Campaign Using COVID-19 Theme',
        description: 'A new phishing campaign has been detected using COVID-19 related themes to trick users into revealing credentials.',
        severity: 0.6,
        category: 'phishing',
        timestamp: new Date(Date.now() - 600000),
        source: 'US-CERT',
        metadata: { target: 'healthcare', method: 'email' }
      }
    ];

    const limitedFeed = threatFeed.slice(0, parseInt(limit as string));

    res.json({ 
      feed: limitedFeed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching threat feed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threat map data
router.get('/threat-map', async (req: Request, res: Response) => {
  try {
    const threatMapData = {
      timestamp: new Date().toISOString(),
      threats: [
        {
          id: 'threat_1',
          latitude: 40.7128,
          longitude: -74.0060,
          severity: 0.9,
          category: 'vulnerability',
          title: 'Critical Zero-Day Vulnerability',
          timestamp: new Date(),
          country: 'US',
          region: 'North America'
        },
        {
          id: 'threat_2',
          latitude: 51.5074,
          longitude: -0.1278,
          severity: 0.8,
          category: 'ransomware',
          title: 'Ransomware Campaign',
          timestamp: new Date(Date.now() - 300000),
          country: 'UK',
          region: 'Europe'
        },
        {
          id: 'threat_3',
          latitude: 35.6762,
          longitude: 139.6503,
          severity: 0.7,
          category: 'malware',
          title: 'Malware Distribution',
          timestamp: new Date(Date.now() - 600000),
          country: 'JP',
          region: 'Asia'
        }
      ],
      statistics: {
        totalThreats: 1250,
        byRegion: {
          'North America': 450,
          'Europe': 300,
          'Asia': 250,
          'South America': 150,
          'Africa': 100
        },
        byCategory: {
          'vulnerability': 400,
          'malware': 300,
          'phishing': 250,
          'attack': 200,
          'breach': 100
        }
      }
    };

    res.json({ threatMap: threatMapData });
  } catch (error) {
    logger.error('Error fetching threat map data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get system metrics
router.get('/metrics', [
  query('period').optional().isIn(['1h', '24h', '7d', '30d']).withMessage('Invalid period')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = '24h' } = req.query;

    const metrics = {
      period,
      timestamp: new Date().toISOString(),
      dataIngestion: {
        feedsActive: 12,
        feedsTotal: 15,
        lastFetch: new Date(Date.now() - 300000),
        successRate: 0.95,
        throughput: 1250 // threats per hour
      },
      aiAnalysis: {
        threatsAnalyzed: 1250,
        averageProcessingTime: 150, // milliseconds
        accuracy: 0.92,
        falsePositiveRate: 0.08
      },
      system: {
        cpuUsage: 0.45,
        memoryUsage: 0.62,
        diskUsage: 0.38,
        networkLatency: 25 // milliseconds
      },
      alerts: {
        total: 1250,
        critical: 45,
        high: 180,
        medium: 650,
        low: 375,
        resolved: 1200
      }
    };

    res.json({ metrics });
  } catch (error) {
    logger.error('Error fetching system metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get alert configuration
router.get('/alerts/config', async (req: Request, res: Response) => {
  try {
    const alertConfig = {
      thresholds: {
        critical: 0.9,
        high: 0.7,
        medium: 0.5,
        low: 0.3
      },
      notifications: {
        email: {
          enabled: true,
          recipients: ['admin@company.com', 'security@company.com']
        },
        sms: {
          enabled: true,
          recipients: ['+1234567890']
        },
        webhook: {
          enabled: true,
          url: 'https://hooks.slack.com/services/...'
        }
      },
      rules: [
        {
          id: 'rule_1',
          name: 'Critical Vulnerability Alert',
          condition: 'severity >= 0.9 AND category == vulnerability',
          action: 'immediate_notification',
          enabled: true
        },
        {
          id: 'rule_2',
          name: 'Ransomware Campaign Alert',
          condition: 'category == ransomware AND count > 5',
          action: 'escalate_to_team',
          enabled: true
        }
      ]
    };

    res.json({ config: alertConfig });
  } catch (error) {
    logger.error('Error fetching alert configuration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update alert configuration
router.put('/alerts/config', async (req: Request, res: Response) => {
  try {
    const { thresholds, notifications, rules } = req.body;

    // This would typically update in database
    logger.info('Alert configuration updated:', { thresholds, notifications, rules });

    res.json({ 
      message: 'Alert configuration updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating alert configuration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threat intelligence sources status
router.get('/sources/status', async (req: Request, res: Response) => {
  try {
    const sourcesStatus = {
      timestamp: new Date().toISOString(),
      sources: [
        {
          id: 'cve-mitre',
          name: 'CVE Database',
          status: 'active',
          lastFetch: new Date(Date.now() - 300000),
          successRate: 0.98,
          threatsCount: 400
        },
        {
          id: 'nvd-nist',
          name: 'NVD Database',
          status: 'active',
          lastFetch: new Date(Date.now() - 600000),
          successRate: 0.95,
          threatsCount: 350
        },
        {
          id: 'us-cert',
          name: 'US-CERT Alerts',
          status: 'active',
          lastFetch: new Date(Date.now() - 900000),
          successRate: 0.92,
          threatsCount: 200
        },
        {
          id: 'krebsonsecurity',
          name: 'Krebs on Security',
          status: 'active',
          lastFetch: new Date(Date.now() - 1200000),
          successRate: 0.88,
          threatsCount: 150
        },
        {
          id: 'threatpost',
          name: 'Threatpost',
          status: 'active',
          lastFetch: new Date(Date.now() - 1500000),
          successRate: 0.90,
          threatsCount: 150
        }
      ],
      summary: {
        totalSources: 5,
        activeSources: 5,
        inactiveSources: 0,
        totalThreats: 1250,
        averageSuccessRate: 0.93
      }
    };

    res.json({ sources: sourcesStatus });
  } catch (error) {
    logger.error('Error fetching sources status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
