import express from 'express';
import { ThreatMonitoringService } from '../services/ThreatMonitoringService';
import { ThreatGraphService } from '../services/ThreatGraphService';
import { AIService } from '../services/AIService';
import { logger } from '../config/logger';

const router = express.Router();

// Initialize services
let threatMonitoringService: ThreatMonitoringService;
let threatGraphService: ThreatGraphService;
let aiService: AIService;

// Initialize services (this would typically be done in the main app)
export const initializeDashboardServices = (
  monitoringService: ThreatMonitoringService,
  graphService: ThreatGraphService,
  aiServiceInstance: AIService
) => {
  threatMonitoringService = monitoringService;
  threatGraphService = graphService;
  aiService = aiServiceInstance;
};

// Get real-time dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    if (!threatMonitoringService) {
      return res.status(503).json({ error: 'Monitoring service not initialized' });
    }

    const stats = threatMonitoringService.getMonitoringStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get real-time alerts
router.get('/alerts', async (req, res) => {
  try {
    if (!threatMonitoringService) {
      return res.status(503).json({ error: 'Monitoring service not initialized' });
    }

    const { category, severity, status, limit } = req.query;
    
    const filters: any = {};
    if (category) filters.category = category as string;
    if (severity) filters.severity = parseFloat(severity as string);
    if (status) filters.status = status as string;
    if (limit) filters.limit = parseInt(limit as string);

    const alerts = await threatMonitoringService.getAlerts(filters);
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get specific alert by ID
router.get('/alerts/:alertId', async (req, res) => {
  try {
    if (!threatMonitoringService) {
      return res.status(503).json({ error: 'Monitoring service not initialized' });
    }

    const { alertId } = req.params;
    const alert = await threatMonitoringService.getAlertById(alertId);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json({
      success: true,
      data: alert,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching alert:', error);
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

// Update alert status
router.put('/alerts/:alertId/status', async (req, res) => {
  try {
    if (!threatMonitoringService) {
      return res.status(503).json({ error: 'Monitoring service not initialized' });
    }

    const { alertId } = req.params;
    const { status, notes, assignedTo } = req.body;
    
    // Validate status
    const validStatuses = ['new', 'acknowledged', 'investigating', 'resolved', 'false_positive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // This would typically update the alert in the database
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Alert status updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating alert status:', error);
    res.status(500).json({ error: 'Failed to update alert status' });
  }
});

// Get threat patterns
router.get('/patterns', async (req, res) => {
  try {
    if (!aiService) {
      return res.status(503).json({ error: 'AI service not initialized' });
    }

    // This would typically fetch recent threats and analyze patterns
    // For now, we'll return mock data
    const patterns = [
      {
        id: 'pattern_001',
        type: 'category_cluster',
        category: 'ransomware',
        count: 8,
        severity: 0.85,
        timeframe: 'within_day',
        confidence: 0.92,
        description: 'Cluster of 8 high severity ransomware threats detected within the last 24 hours',
        indicators: ['ransomware', 'encryption', 'extortion'],
        affectedSectors: ['Healthcare', 'Financial Services'],
        attackVectors: ['Email', 'Web'],
        detectedAt: new Date().toISOString()
      },
      {
        id: 'pattern_002',
        type: 'temporal_cluster',
        category: 'timing_pattern',
        count: 12,
        severity: 0.72,
        timeframe: 'hour_14',
        confidence: 0.78,
        description: 'Unusual threat activity detected at hour 14:00',
        indicators: ['hour_14', 'temporal_clustering'],
        affectedSectors: ['Government', 'Education'],
        attackVectors: ['Network', 'Social Engineering'],
        detectedAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: patterns,
      count: patterns.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching threat patterns:', error);
    res.status(500).json({ error: 'Failed to fetch threat patterns' });
  }
});

// Get threat network/graph
router.get('/network/:threatId', async (req, res) => {
  try {
    if (!threatGraphService) {
      return res.status(503).json({ error: 'Threat graph service not initialized' });
    }

    const { threatId } = req.params;
    const { limit = 20 } = req.query;
    
    const network = await threatGraphService.buildThreatNetwork([threatId]);
    
    res.json({
      success: true,
      data: network,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching threat network:', error);
    res.status(500).json({ error: 'Failed to fetch threat network' });
  }
});

// Get threat graph statistics
router.get('/graph/stats', async (req, res) => {
  try {
    if (!threatGraphService) {
      return res.status(503).json({ error: 'Threat graph service not initialized' });
    }

    const stats = await threatGraphService.getThreatGraphStats();
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching threat graph stats:', error);
    res.status(500).json({ error: 'Failed to fetch threat graph statistics' });
  }
});

// Get related threats
router.get('/threats/:threatId/related', async (req, res) => {
  try {
    if (!threatGraphService) {
      return res.status(503).json({ error: 'Threat graph service not initialized' });
    }

    const { threatId } = req.params;
    const { limit = 10 } = req.query;
    
    const relatedThreats = await threatGraphService.findRelatedThreats(threatId, parseInt(limit as string));
    
    res.json({
      success: true,
      data: relatedThreats,
      count: relatedThreats.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching related threats:', error);
    res.status(500).json({ error: 'Failed to fetch related threats' });
  }
});

// Get threat intelligence summary
router.get('/intelligence/summary', async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    
    // Mock intelligence summary
    const summary = {
      totalThreats: 156,
      criticalThreats: 23,
      highThreats: 45,
      mediumThreats: 67,
      lowThreats: 21,
      topCategories: [
        { category: 'ransomware', count: 34, percentage: 21.8 },
        { category: 'phishing', count: 28, percentage: 17.9 },
        { category: 'malware', count: 25, percentage: 16.0 },
        { category: 'vulnerability', count: 22, percentage: 14.1 },
        { category: 'apt', count: 18, percentage: 11.5 }
      ],
      topSources: [
        { source: 'Dark Web Monitor', count: 45, percentage: 28.8 },
        { source: 'CVE Database', count: 32, percentage: 20.5 },
        { source: 'US-CERT Alerts', count: 28, percentage: 17.9 },
        { source: 'Threatpost', count: 25, percentage: 16.0 },
        { source: 'NVD Database', count: 26, percentage: 16.7 }
      ],
      affectedSectors: [
        { sector: 'Healthcare', count: 34, percentage: 21.8 },
        { sector: 'Financial Services', count: 28, percentage: 17.9 },
        { sector: 'Government', count: 25, percentage: 16.0 },
        { sector: 'Education', count: 22, percentage: 14.1 },
        { sector: 'Retail', count: 18, percentage: 11.5 }
      ],
      attackVectors: [
        { vector: 'Email', count: 45, percentage: 28.8 },
        { vector: 'Web', count: 32, percentage: 20.5 },
        { vector: 'Network', count: 28, percentage: 17.9 },
        { vector: 'Social Engineering', count: 25, percentage: 16.0 },
        { vector: 'Physical', count: 26, percentage: 16.7 }
      ],
      timeframe,
      generatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching intelligence summary:', error);
    res.status(500).json({ error: 'Failed to fetch intelligence summary' });
  }
});

// Get threat trends
router.get('/trends', async (req, res) => {
  try {
    const { period = '7d', metric = 'severity' } = req.query;
    
    // Mock trend data
    const trends = {
      period,
      metric,
      data: [
        { date: '2024-01-01', value: 0.65, count: 12 },
        { date: '2024-01-02', value: 0.72, count: 15 },
        { date: '2024-01-03', value: 0.68, count: 13 },
        { date: '2024-01-04', value: 0.75, count: 18 },
        { date: '2024-01-05', value: 0.82, count: 22 },
        { date: '2024-01-06', value: 0.78, count: 19 },
        { date: '2024-01-07', value: 0.85, count: 25 }
      ],
      summary: {
        average: 0.75,
        trend: 'increasing',
        change: 0.20,
        changePercentage: 30.8
      }
    };
    
    res.json({
      success: true,
      data: trends,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching threat trends:', error);
    res.status(500).json({ error: 'Failed to fetch threat trends' });
  }
});

// Get customized alerts configuration
router.get('/alerts/config', async (req, res) => {
  try {
    const config = {
      alertRules: [
        {
          id: 'rule_001',
          name: 'Critical Ransomware Detection',
          description: 'Alert when ransomware threats exceed critical threshold',
          conditions: {
            category: 'ransomware',
            severity: { min: 0.8 },
            count: { min: 3, timeframe: '1h' }
          },
          enabled: true,
          notificationChannels: ['email', 'slack', 'dashboard']
        },
        {
          id: 'rule_002',
          name: 'High Volume Phishing Campaign',
          description: 'Alert when phishing threats spike significantly',
          conditions: {
            category: 'phishing',
            count: { min: 10, timeframe: '24h' }
          },
          enabled: true,
          notificationChannels: ['email', 'dashboard']
        },
        {
          id: 'rule_003',
          name: 'Dark Web Data Breach Activity',
          description: 'Alert on dark web data breach indicators',
          conditions: {
            source: 'dark_web',
            category: 'data_breach',
            severity: { min: 0.7 }
          },
          enabled: true,
          notificationChannels: ['email', 'slack', 'dashboard', 'sms']
        }
      ],
      notificationSettings: {
        email: {
          enabled: true,
          recipients: ['security-team@company.com', 'ciso@company.com'],
          frequency: 'immediate'
        },
        slack: {
          enabled: true,
          webhook: process.env.SLACK_WEBHOOK_URL,
          channel: '#security-alerts',
          frequency: 'immediate'
        },
        dashboard: {
          enabled: true,
          frequency: 'real-time'
        },
        sms: {
          enabled: false,
          recipients: [],
          frequency: 'critical-only'
        }
      }
    };
    
    res.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching alerts configuration:', error);
    res.status(500).json({ error: 'Failed to fetch alerts configuration' });
  }
});

// Update alerts configuration
router.put('/alerts/config', async (req, res) => {
  try {
    const { alertRules, notificationSettings } = req.body;
    
    // Validate configuration
    if (!alertRules || !notificationSettings) {
      return res.status(400).json({ error: 'Invalid configuration data' });
    }
    
    // This would typically save to database
    res.json({
      success: true,
      message: 'Alerts configuration updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating alerts configuration:', error);
    res.status(500).json({ error: 'Failed to update alerts configuration' });
  }
});

export default router;
