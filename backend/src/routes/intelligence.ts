import { Router, Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import { logger } from '../config/logger';

const router = Router();

// Get threat intelligence summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const summary = {
      timestamp: new Date().toISOString(),
      totalIntelligence: 1250,
      criticalIntelligence: 45,
      highIntelligence: 180,
      mediumIntelligence: 650,
      lowIntelligence: 375,
      byCategory: {
        vulnerability: 400,
        malware: 300,
        phishing: 250,
        attack: 200,
        breach: 100
      },
      bySource: {
        'CVE Database': 400,
        'NVD Database': 350,
        'US-CERT': 200,
        'Krebs on Security': 150,
        'Threatpost': 150
      },
      lastUpdated: new Date(Date.now() - 300000), // 5 minutes ago
      confidence: 0.92
    };

    res.json({ summary });
  } catch (error) {
    logger.error('Error fetching intelligence summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threat intelligence feeds
router.get('/feeds', async (req: Request, res: Response) => {
  try {
    const feeds = [
      {
        id: 'cve-mitre',
        name: 'CVE Database',
        type: 'vulnerability',
        status: 'active',
        lastFetch: new Date(Date.now() - 300000),
        threatsCount: 400,
        successRate: 0.98,
        description: 'Common Vulnerabilities and Exposures database'
      },
      {
        id: 'nvd-nist',
        name: 'NVD Database',
        type: 'vulnerability',
        status: 'active',
        lastFetch: new Date(Date.now() - 600000),
        threatsCount: 350,
        successRate: 0.95,
        description: 'National Vulnerability Database'
      },
      {
        id: 'us-cert',
        name: 'US-CERT Alerts',
        type: 'advisory',
        status: 'active',
        lastFetch: new Date(Date.now() - 900000),
        threatsCount: 200,
        successRate: 0.92,
        description: 'US-CERT security advisories'
      },
      {
        id: 'krebsonsecurity',
        name: 'Krebs on Security',
        type: 'news',
        status: 'active',
        lastFetch: new Date(Date.now() - 1200000),
        threatsCount: 150,
        successRate: 0.88,
        description: 'Cybersecurity news and analysis'
      },
      {
        id: 'threatpost',
        name: 'Threatpost',
        type: 'news',
        status: 'active',
        lastFetch: new Date(Date.now() - 1500000),
        threatsCount: 150,
        successRate: 0.90,
        description: 'Information security news'
      }
    ];

    res.json({ feeds });
  } catch (error) {
    logger.error('Error fetching intelligence feeds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threat intelligence by category
router.get('/category/:category', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category } = req.params;
    const { limit = 20 } = req.query;

    // Mock intelligence data by category
    const intelligenceData = [
      {
        id: 'intel_1',
        title: 'Critical Zero-Day Vulnerability in Apache HTTP Server',
        description: 'A critical zero-day vulnerability has been discovered in Apache HTTP Server that allows remote code execution.',
        category: 'vulnerability',
        severity: 0.9,
        confidence: 0.95,
        source: 'CVE Database',
        timestamp: new Date(),
        metadata: { cveId: 'CVE-2024-1234', cvss: 9.8 }
      },
      {
        id: 'intel_2',
        title: 'New Ransomware Campaign Targeting Healthcare',
        description: 'A new ransomware campaign has been identified targeting healthcare organizations with sophisticated encryption.',
        category: 'malware',
        severity: 0.8,
        confidence: 0.88,
        source: 'Threatpost',
        timestamp: new Date(Date.now() - 300000),
        metadata: { ioc: 'malware_hash_123', target: 'healthcare' }
      }
    ];

    const filteredData = intelligenceData.filter(item => item.category === category);
    const limitedData = filteredData.slice(0, parseInt(limit as string));

    res.json({ 
      category,
      intelligence: limitedData,
      total: filteredData.length
    });
  } catch (error) {
    logger.error('Error fetching intelligence by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threat intelligence by source
router.get('/source/:sourceId', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sourceId } = req.params;
    const { limit = 20 } = req.query;

    // Mock intelligence data by source
    const intelligenceData = [
      {
        id: 'intel_1',
        title: 'Critical Zero-Day Vulnerability in Apache HTTP Server',
        description: 'A critical zero-day vulnerability has been discovered in Apache HTTP Server that allows remote code execution.',
        category: 'vulnerability',
        severity: 0.9,
        confidence: 0.95,
        source: 'CVE Database',
        timestamp: new Date(),
        metadata: { cveId: 'CVE-2024-1234', cvss: 9.8 }
      }
    ];

    const filteredData = intelligenceData.filter(item => item.source === sourceId);
    const limitedData = filteredData.slice(0, parseInt(limit as string));

    res.json({ 
      sourceId,
      intelligence: limitedData,
      total: filteredData.length
    });
  } catch (error) {
    logger.error('Error fetching intelligence by source:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threat intelligence search
router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { q, limit = 20 } = req.query;
    const searchQuery = (q as string).toLowerCase();

    // Mock intelligence data for search
    const intelligenceData = [
      {
        id: 'intel_1',
        title: 'Critical Zero-Day Vulnerability in Apache HTTP Server',
        description: 'A critical zero-day vulnerability has been discovered in Apache HTTP Server that allows remote code execution.',
        category: 'vulnerability',
        severity: 0.9,
        confidence: 0.95,
        source: 'CVE Database',
        timestamp: new Date(),
        metadata: { cveId: 'CVE-2024-1234', cvss: 9.8 }
      },
      {
        id: 'intel_2',
        title: 'New Ransomware Campaign Targeting Healthcare',
        description: 'A new ransomware campaign has been identified targeting healthcare organizations with sophisticated encryption.',
        category: 'malware',
        severity: 0.8,
        confidence: 0.88,
        source: 'Threatpost',
        timestamp: new Date(Date.now() - 300000),
        metadata: { ioc: 'malware_hash_123', target: 'healthcare' }
      }
    ];

    const searchResults = intelligenceData.filter(item => 
      item.title.toLowerCase().includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery) ||
      item.category.toLowerCase().includes(searchQuery)
    );

    const limitedResults = searchResults.slice(0, parseInt(limit as string));

    res.json({ 
      query: searchQuery,
      results: limitedResults,
      total: searchResults.length
    });
  } catch (error) {
    logger.error('Error searching intelligence:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threat intelligence trends
router.get('/trends', [
  query('period').optional().isIn(['24h', '7d', '30d', '90d']).withMessage('Invalid period')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = '7d' } = req.query;

    const trends = {
      period,
      timestamp: new Date().toISOString(),
      data: [
        { date: '2024-01-01', count: 45, severity: 0.7 },
        { date: '2024-01-02', count: 52, severity: 0.8 },
        { date: '2024-01-03', count: 38, severity: 0.6 },
        { date: '2024-01-04', count: 61, severity: 0.9 },
        { date: '2024-01-05', count: 47, severity: 0.7 },
        { date: '2024-01-06', count: 55, severity: 0.8 },
        { date: '2024-01-07', count: 43, severity: 0.6 }
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
    logger.error('Error fetching intelligence trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threat intelligence quality metrics
router.get('/quality', async (req: Request, res: Response) => {
  try {
    const qualityMetrics = {
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
    logger.error('Error fetching intelligence quality metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
