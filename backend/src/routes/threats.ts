import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { logger } from '../config/logger';
import { ThreatData, AIService } from '../services/AIService';
import { DataIngestionService } from '../services/DataIngestionService';

const router = Router();
const aiService = new AIService();
const dataIngestionService = new DataIngestionService();

// Initialize AI service
aiService.initialize().catch(err => {
  logger.error('Failed to initialize AI service:', err);
});

// Get all threats with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('severity').optional().isFloat({ min: 0, max: 1 }).withMessage('Severity must be between 0 and 1'),
  query('source').optional().isString().withMessage('Source must be a string'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('sortBy').optional().isIn(['timestamp', 'severity', 'relevance', 'priority']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      category,
      severity,
      source,
      search,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    // This would typically fetch from database
    // For now, we'll simulate with mock data
    const mockThreats: ThreatData[] = [
      {
        id: 'threat_1',
        title: 'Critical Zero-Day Vulnerability in Apache HTTP Server',
        description: 'A critical zero-day vulnerability has been discovered in Apache HTTP Server that allows remote code execution.',
        source: 'CVE Database',
        severity: 0.9,
        category: 'vulnerability',
        timestamp: new Date(),
        metadata: { cveId: 'CVE-2024-1234', cvss: 9.8 }
      },
      {
        id: 'threat_2',
        title: 'New Ransomware Campaign Targeting Healthcare',
        description: 'A new ransomware campaign has been identified targeting healthcare organizations with sophisticated encryption.',
        source: 'Threatpost',
        severity: 0.8,
        category: 'ransomware',
        timestamp: new Date(Date.now() - 3600000),
        metadata: { ioc: 'malware_hash_123', target: 'healthcare' }
      }
    ];

    // Apply filters
    let filteredThreats = mockThreats;

    if (category) {
      filteredThreats = filteredThreats.filter(t => t.category === category);
    }

    if (severity) {
      filteredThreats = filteredThreats.filter(t => t.severity >= parseFloat(severity as string));
    }

    if (source) {
      filteredThreats = filteredThreats.filter(t => t.source.toLowerCase().includes((source as string).toLowerCase()));
    }

    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredThreats = filteredThreats.filter(t => 
        t.title.toLowerCase().includes(searchTerm) || 
        t.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    filteredThreats.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'severity':
          aValue = a.severity;
          bValue = b.severity;
          break;
        case 'timestamp':
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
          break;
        default:
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedThreats = filteredThreats.slice(startIndex, endIndex);

    return res.json({
      threats: paginatedThreats,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: filteredThreats.length,
        pages: Math.ceil(filteredThreats.length / parseInt(limit as string))
      }
    });

  } catch (error) {
    logger.error('Error fetching threats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threat by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // This would typically fetch from database
    const mockThreat: ThreatData = {
      id,
      title: 'Critical Zero-Day Vulnerability in Apache HTTP Server',
      description: 'A critical zero-day vulnerability has been discovered in Apache HTTP Server that allows remote code execution.',
      source: 'CVE Database',
      severity: 0.9,
      category: 'vulnerability',
      timestamp: new Date(),
      metadata: { cveId: 'CVE-2024-1234', cvss: 9.8 }
    };

    res.json({ threat: mockThreat });
    return;
  } catch (error) {
    logger.error('Error fetching threat:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// Analyze threat with AI
router.post('/:id/analyze', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // This would typically fetch from database
    const mockThreat: ThreatData = {
      id,
      title: 'Critical Zero-Day Vulnerability in Apache HTTP Server',
      description: 'A critical zero-day vulnerability has been discovered in Apache HTTP Server that allows remote code execution.',
      source: 'CVE Database',
      severity: 0.9,
      category: 'vulnerability',
      timestamp: new Date(),
      metadata: { cveId: 'CVE-2024-1234', cvss: 9.8 }
    };

    const analysis = await aiService.analyzeThreat(mockThreat);

    res.json({ 
      threatId: id,
      analysis 
    });
    return;
  } catch (error) {
    logger.error('Error analyzing threat:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// Get threat statistics
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    // This would typically fetch from database
    const stats = {
      total: 1250,
      critical: 45,
      high: 180,
      medium: 650,
      low: 375,
      byCategory: {
        vulnerability: 400,
        malware: 300,
        phishing: 250,
        attack: 200,
        breach: 100
      },
      bySource: {
        'CVE Database': 400,
        'Threatpost': 200,
        'US-CERT': 150,
        'Krebs on Security': 100,
        'Other': 400
      },
      last24Hours: 25,
      lastWeek: 150
    };

    res.json({ stats });
  } catch (error) {
    logger.error('Error fetching threat statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threat trends
router.get('/stats/trends', [
  query('period').optional().isIn(['24h', '7d', '30d', '90d']).withMessage('Invalid period')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = '7d' } = req.query;

    // This would typically fetch from database
    const trends = {
      period,
      data: [
        { date: '2024-01-01', count: 45, severity: 0.7 },
        { date: '2024-01-02', count: 52, severity: 0.8 },
        { date: '2024-01-03', count: 38, severity: 0.6 },
        { date: '2024-01-04', count: 61, severity: 0.9 },
        { date: '2024-01-05', count: 47, severity: 0.7 },
        { date: '2024-01-06', count: 55, severity: 0.8 },
        { date: '2024-01-07', count: 43, severity: 0.6 }
      ]
    };

    res.json({ trends });
  } catch (error) {
    logger.error('Error fetching threat trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create custom threat alert
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').isIn(['vulnerability', 'malware', 'phishing', 'attack', 'breach', 'ransomware', 'general']).withMessage('Invalid category'),
  body('severity').optional().isFloat({ min: 0, max: 1 }).withMessage('Severity must be between 0 and 1')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, severity = 0.5, metadata = {} } = req.body;

    const newThreat: ThreatData = {
      id: `custom_${Date.now()}`,
      title,
      description,
      source: 'Custom Alert',
      severity,
      category,
      timestamp: new Date(),
      metadata
    };

    // Analyze the threat with AI
    const analysis = await aiService.analyzeThreat(newThreat);

    // This would typically save to database
    logger.info('Custom threat alert created:', newThreat);

    return res.status(201).json({ 
      threat: newThreat,
      analysis 
    });
  } catch (error) {
    logger.error('Error creating threat alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update threat status
router.patch('/:id/status', [
  body('status').isIn(['new', 'investigating', 'confirmed', 'false_positive', 'resolved']).withMessage('Invalid status')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    // This would typically update in database
    logger.info(`Threat ${id} status updated to ${status}`);

    return res.json({ 
      threatId: id,
      status,
      notes,
      updatedAt: new Date()
    });
  } catch (error) {
    logger.error('Error updating threat status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
