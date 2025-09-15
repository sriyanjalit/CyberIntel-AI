import { Router, Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import { logger } from '../config/logger';

const router = Router();

// Get threat analytics overview
router.get('/overview', [
  query('period').optional().isIn(['24h', '7d', '30d', '90d']).withMessage('Invalid period')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = '7d' } = req.query;

    const analytics = {
      period,
      timestamp: new Date().toISOString(),
      summary: {
        totalThreats: 1250,
        criticalThreats: 45,
        resolvedThreats: 1200,
        falsePositives: 50,
        averageResponseTime: 2.5 // hours
      },
      trends: {
        threatVolume: {
          current: 1250,
          previous: 1100,
          change: 13.6, // percentage
          direction: 'increasing'
        },
        severityDistribution: {
          critical: 45,
          high: 180,
          medium: 650,
          low: 375
        },
        categoryBreakdown: {
          vulnerability: 400,
          malware: 300,
          phishing: 250,
          attack: 200,
          breach: 100
        }
      },
      performance: {
        aiAccuracy: 0.92,
        falsePositiveRate: 0.08,
        averageProcessingTime: 150, // milliseconds
        systemUptime: 0.999
      }
    };

    res.json({ analytics });
  } catch (error) {
    logger.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threat trends over time
router.get('/trends', [
  query('period').optional().isIn(['24h', '7d', '30d', '90d']).withMessage('Invalid period'),
  query('metric').optional().isIn(['volume', 'severity', 'category', 'source']).withMessage('Invalid metric')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = '7d', metric = 'volume' } = req.query;

    const trends = {
      period,
      metric,
      timestamp: new Date().toISOString(),
      data: [
        { date: '2024-01-01', value: 45, severity: 0.7 },
        { date: '2024-01-02', value: 52, severity: 0.8 },
        { date: '2024-01-03', value: 38, severity: 0.6 },
        { date: '2024-01-04', value: 61, severity: 0.9 },
        { date: '2024-01-05', value: 47, severity: 0.7 },
        { date: '2024-01-06', value: 55, severity: 0.8 },
        { date: '2024-01-07', value: 43, severity: 0.6 }
      ],
      statistics: {
        average: 48.6,
        peak: 61,
        low: 38,
        trend: 'stable'
      }
    };

    res.json({ trends });
  } catch (error) {
    logger.error('Error fetching threat trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threat intelligence sources analytics
router.get('/sources', [
  query('period').optional().isIn(['24h', '7d', '30d', '90d']).withMessage('Invalid period')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = '7d' } = req.query;

    const sourceAnalytics = {
      period,
      timestamp: new Date().toISOString(),
      sources: [
        {
          id: 'cve-mitre',
          name: 'CVE Database',
          threatsCount: 400,
          successRate: 0.98,
          averageSeverity: 0.7,
          lastUpdate: new Date(Date.now() - 300000),
          reliability: 0.95
        },
        {
          id: 'nvd-nist',
          name: 'NVD Database',
          threatsCount: 350,
          successRate: 0.95,
          averageSeverity: 0.8,
          lastUpdate: new Date(Date.now() - 600000),
          reliability: 0.92
        },
        {
          id: 'us-cert',
          name: 'US-CERT Alerts',
          threatsCount: 200,
          successRate: 0.92,
          averageSeverity: 0.6,
          lastUpdate: new Date(Date.now() - 900000),
          reliability: 0.88
        },
        {
          id: 'krebsonsecurity',
          name: 'Krebs on Security',
          threatsCount: 150,
          successRate: 0.88,
          averageSeverity: 0.5,
          lastUpdate: new Date(Date.now() - 1200000),
          reliability: 0.85
        },
        {
          id: 'threatpost',
          name: 'Threatpost',
          threatsCount: 150,
          successRate: 0.90,
          averageSeverity: 0.6,
          lastUpdate: new Date(Date.now() - 1500000),
          reliability: 0.87
        }
      ],
      summary: {
        totalSources: 5,
        activeSources: 5,
        totalThreats: 1250,
        averageSuccessRate: 0.93,
        averageReliability: 0.89
      }
    };

    res.json({ sourceAnalytics });
  } catch (error) {
    logger.error('Error fetching source analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get AI model performance analytics
router.get('/ai-performance', [
  query('period').optional().isIn(['24h', '7d', '30d', '90d']).withMessage('Invalid period')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = '7d' } = req.query;

    const aiPerformance = {
      period,
      timestamp: new Date().toISOString(),
      metrics: {
        accuracy: 0.92,
        precision: 0.89,
        recall: 0.94,
        f1Score: 0.91,
        falsePositiveRate: 0.08,
        falseNegativeRate: 0.06
      },
      processing: {
        totalThreatsAnalyzed: 1250,
        averageProcessingTime: 150, // milliseconds
        maxProcessingTime: 500,
        minProcessingTime: 50,
        throughput: 1250 // threats per hour
      },
      modelHealth: {
        lastTraining: new Date(Date.now() - 86400000), // 1 day ago
        trainingAccuracy: 0.94,
        validationAccuracy: 0.92,
        modelVersion: '1.2.3',
        status: 'healthy'
      },
      predictions: {
        total: 1250,
        correct: 1150,
        incorrect: 100,
        confidence: {
          high: 800,
          medium: 350,
          low: 100
        }
      }
    };

    res.json({ aiPerformance });
  } catch (error) {
    logger.error('Error fetching AI performance analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threat correlation analytics
router.get('/correlations', [
  query('period').optional().isIn(['24h', '7d', '30d', '90d']).withMessage('Invalid period')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = '7d' } = req.query;

    const correlations = {
      period,
      timestamp: new Date().toISOString(),
      patterns: [
        {
          id: 'pattern_1',
          name: 'Healthcare Ransomware Campaign',
          threats: ['threat_1', 'threat_2', 'threat_3'],
          confidence: 0.95,
          severity: 0.8,
          category: 'ransomware',
          timeframe: '24h',
          description: 'Multiple ransomware threats targeting healthcare organizations'
        },
        {
          id: 'pattern_2',
          name: 'Apache Vulnerability Cluster',
          threats: ['threat_4', 'threat_5'],
          confidence: 0.88,
          severity: 0.9,
          category: 'vulnerability',
          timeframe: '48h',
          description: 'Critical vulnerabilities in Apache HTTP Server'
        }
      ],
      statistics: {
        totalPatterns: 2,
        highConfidence: 1,
        mediumConfidence: 1,
        lowConfidence: 0,
        averageConfidence: 0.92
      }
    };

    res.json({ correlations });
  } catch (error) {
    logger.error('Error fetching threat correlations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get response time analytics
router.get('/response-times', [
  query('period').optional().isIn(['24h', '7d', '30d', '90d']).withMessage('Invalid period')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = '7d' } = req.query;

    const responseTimes = {
      period,
      timestamp: new Date().toISOString(),
      metrics: {
        average: 2.5, // hours
        median: 1.8,
        p95: 6.2,
        p99: 12.5,
        min: 0.1,
        max: 24.0
      },
      bySeverity: {
        critical: 0.5, // hours
        high: 1.2,
        medium: 2.8,
        low: 4.5
      },
      byCategory: {
        vulnerability: 1.5,
        malware: 2.1,
        phishing: 3.2,
        attack: 1.8,
        breach: 2.5
      },
      trends: [
        { date: '2024-01-01', average: 2.3 },
        { date: '2024-01-02', average: 2.1 },
        { date: '2024-01-03', average: 2.8 },
        { date: '2024-01-04', average: 2.2 },
        { date: '2024-01-05', average: 2.6 },
        { date: '2024-01-06', average: 2.4 },
        { date: '2024-01-07', average: 2.5 }
      ]
    };

    res.json({ responseTimes });
  } catch (error) {
    logger.error('Error fetching response time analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threat intelligence quality metrics
router.get('/quality', [
  query('period').optional().isIn(['24h', '7d', '30d', '90d']).withMessage('Invalid period')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = '7d' } = req.query;

    const qualityMetrics = {
      period,
      timestamp: new Date().toISOString(),
      overall: {
        qualityScore: 0.89,
        completeness: 0.92,
        accuracy: 0.88,
        timeliness: 0.85,
        relevance: 0.91
      },
      bySource: {
        'CVE Database': { qualityScore: 0.95, completeness: 0.98, accuracy: 0.92 },
        'NVD Database': { qualityScore: 0.92, completeness: 0.95, accuracy: 0.89 },
        'US-CERT': { qualityScore: 0.88, completeness: 0.90, accuracy: 0.86 },
        'Krebs on Security': { qualityScore: 0.85, completeness: 0.88, accuracy: 0.82 },
        'Threatpost': { qualityScore: 0.87, completeness: 0.89, accuracy: 0.85 }
      },
      improvements: [
        {
          source: 'Krebs on Security',
          metric: 'accuracy',
          current: 0.82,
          target: 0.90,
          action: 'Improve data validation'
        },
        {
          source: 'Threatpost',
          metric: 'completeness',
          current: 0.89,
          target: 0.95,
          action: 'Enhance metadata extraction'
        }
      ]
    };

    res.json({ qualityMetrics });
  } catch (error) {
    logger.error('Error fetching quality metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
