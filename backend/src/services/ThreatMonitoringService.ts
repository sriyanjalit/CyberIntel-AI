import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../config/logger';
import { AIService, ThreatData, ThreatScore } from './AIService';
import { DataIngestionService } from './DataIngestionService';

export interface ThreatAlert {
  id: string;
  threatId: string;
  title: string;
  description: string;
  severity: number;
  category: string;
  source: string;
  timestamp: Date;
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  notes?: string;
  metadata: any;
}

export interface MonitoringStats {
  totalThreats: number;
  criticalThreats: number;
  highThreats: number;
  mediumThreats: number;
  lowThreats: number;
  threatsByCategory: Record<string, number>;
  threatsBySource: Record<string, number>;
  recentAlerts: ThreatAlert[];
}

export class ThreatMonitoringService {
  private io: SocketIOServer;
  private aiService: AIService;
  private dataIngestionService: DataIngestionService;
  private alerts: Map<string, ThreatAlert> = new Map();
  private isRunning = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.aiService = new AIService();
    this.dataIngestionService = new DataIngestionService();
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Threat Monitoring Service is already running');
      return;
    }

    try {
      logger.info('Starting Threat Monitoring Service...');
      
      // Initialize AI Service
      await this.aiService.initialize();
      
      // Start data ingestion
      await this.dataIngestionService.start();
      
      // Start monitoring loop
      this.startMonitoringLoop();
      
      // Setup Socket.IO event handlers
      this.setupSocketHandlers();
      
      this.isRunning = true;
      logger.info('Threat Monitoring Service started successfully');
    } catch (error) {
      logger.error('Failed to start Threat Monitoring Service:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      logger.info('Stopping Threat Monitoring Service...');
      
      // Stop monitoring loop
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
      }
      
      // Stop data ingestion
      await this.dataIngestionService.stop();
      
      this.isRunning = false;
      logger.info('Threat Monitoring Service stopped');
    } catch (error) {
      logger.error('Error stopping Threat Monitoring Service:', error);
      throw error;
    }
  }

  private startMonitoringLoop(): void {
    // Monitor for new threats every 5 minutes
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.processNewThreats();
      } catch (error) {
        logger.error('Error in monitoring loop:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Initial processing
    this.processNewThreats();
  }

  private async processNewThreats(): Promise<void> {
    try {
      logger.info('Processing new threats...');
      
      // Get all feeds and fetch their data
      const feeds = await this.dataIngestionService.getFeeds();
      let allThreats: ThreatData[] = [];
      
      for (const feed of feeds) {
        if (feed.enabled) {
          // This would typically fetch from the feed
          // For now, we'll simulate some threat data
          const threats = await this.simulateThreatData(feed);
          allThreats = allThreats.concat(threats);
        }
      }
      
      // Filter noise using AI
      const filteredThreats = await this.aiService.filterNoise(allThreats);
      
      // Analyze each threat
      for (const threat of filteredThreats) {
        await this.analyzeAndAlert(threat);
      }
      
      // Detect patterns
      const patterns = await this.aiService.detectPatterns(filteredThreats);
      if (patterns.length > 0) {
        this.broadcastPatterns(patterns);
      }
      
      logger.info(Processed  threats, generated  alerts);
    } catch (error) {
      logger.error('Error processing new threats:', error);
    }
  }

  private async analyzeAndAlert(threat: ThreatData): Promise<void> {
    try {
      // Check if we already have an alert for this threat
      if (this.alerts.has(threat.id)) {
        return;
      }
      
      // Analyze threat using AI
      const threatScore = await this.aiService.analyzeThreat(threat);
      
      // Create alert if threat is significant
      if (threatScore.priority > 0.6) {
        const alert: ThreatAlert = {
          id: this.generateAlertId(),
          threatId: threat.id,
          title: threat.title,
          description: threat.description,
          severity: threatScore.severity,
          category: threat.category,
          source: threat.source,
          timestamp: new Date(),
          status: 'new',
          metadata: {
            ...threat.metadata,
            threatScore,
            relevance: threatScore.relevance,
            confidence: threatScore.confidence
          }
        };
        
        this.alerts.set(alert.id, alert);
        
        // Broadcast alert to connected clients
        this.broadcastAlert(alert);
        
        // Log critical alerts
        if (threatScore.severity > 0.8) {
          logger.warn(Critical threat detected: , {
            threatId: threat.id,
            severity: threatScore.severity,
            source: threat.source
          });
        }
      }
    } catch (error) {
      logger.error('Error analyzing threat:', error);
    }
  }

  private async simulateThreatData(feed: any): Promise<ThreatData[]> {
    // Simulate threat data for demonstration
    const threats: ThreatData[] = [];
    
    if (Math.random() > 0.7) { // 30% chance of generating a threat
      const threatTypes = [
        { category: 'vulnerability', title: 'Critical RCE Vulnerability Found', severity: 0.9 },
        { category: 'malware', title: 'New Ransomware Campaign Detected', severity: 0.8 },
        { category: 'phishing', title: 'Sophisticated Phishing Attack', severity: 0.6 },
        { category: 'attack', title: 'DDoS Attack on Major Infrastructure', severity: 0.7 }
      ];
      
      const threatType = threatTypes[Math.floor(Math.random() * threatTypes.length)];
      
      threats.push({
        id: ${feed.id}__,
        title: threatType.title,
        description: A  has been detected in the wild. Immediate attention required.,
        source: feed.name,
        severity: threatType.severity,
        category: threatType.category,
        timestamp: new Date(),
        metadata: {
          feedId: feed.id,
          simulated: true
        }
      });
    }
    
    return threats;
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(Client connected to threat monitoring: );
      
      // Send current alerts to new client
      socket.emit('alerts', Array.from(this.alerts.values()));
      
      // Send current stats
      socket.emit('stats', this.getMonitoringStats());
      
      // Handle alert acknowledgment
      socket.on('acknowledge-alert', (alertId: string) => {
        this.acknowledgeAlert(alertId, socket.id);
      });
      
      // Handle alert status update
      socket.on('update-alert-status', (data: { alertId: string; status: string; notes?: string }) => {
        this.updateAlertStatus(data.alertId, data.status, data.notes, socket.id);
      });
      
      // Handle room joining for specific categories
      socket.on('join-category', (category: string) => {
        socket.join(category_);
        logger.info(Client  joined category: );
      });
      
      socket.on('disconnect', () => {
        logger.info(Client disconnected from threat monitoring: );
      });
    });
  }

  private broadcastAlert(alert: ThreatAlert): void {
    // Broadcast to all connected clients
    this.io.emit('new-alert', alert);
    
    // Broadcast to specific category room
    this.io.to(category_).emit('category-alert', alert);
    
    // Broadcast to high severity alerts room
    if (alert.severity > 0.7) {
      this.io.to('high-severity').emit('high-severity-alert', alert);
    }
  }

  private broadcastPatterns(patterns: any[]): void {
    this.io.emit('threat-patterns', patterns);
  }

  private acknowledgeAlert(alertId: string, userId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = 'acknowledged';
      alert.assignedTo = userId;
      this.alerts.set(alertId, alert);
      
      this.io.emit('alert-updated', alert);
      logger.info(Alert  acknowledged by );
    }
  }

  private updateAlertStatus(alertId: string, status: string, notes: string | undefined, userId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = status as any;
      alert.assignedTo = userId;
      if (notes) {
        alert.notes = notes;
      }
      this.alerts.set(alertId, alert);
      
      this.io.emit('alert-updated', alert);
      logger.info(Alert  status updated to  by );
    }
  }

  private generateAlertId(): string {
    return lert__;
  }

  getMonitoringStats(): MonitoringStats {
    const alerts = Array.from(this.alerts.values());
    
    const stats: MonitoringStats = {
      totalThreats: alerts.length,
      criticalThreats: alerts.filter(a => a.severity > 0.8).length,
      highThreats: alerts.filter(a => a.severity > 0.6 && a.severity <= 0.8).length,
      mediumThreats: alerts.filter(a => a.severity > 0.4 && a.severity <= 0.6).length,
      lowThreats: alerts.filter(a => a.severity <= 0.4).length,
      threatsByCategory: {},
      threatsBySource: {},
      recentAlerts: alerts
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10)
    };
    
    // Calculate category distribution
    alerts.forEach(alert => {
      stats.threatsByCategory[alert.category] = (stats.threatsByCategory[alert.category] || 0) + 1;
      stats.threatsBySource[alert.source] = (stats.threatsBySource[alert.source] || 0) + 1;
    });
    
    return stats;
  }

  async getAlerts(filters?: {
    category?: string;
    severity?: number;
    status?: string;
    limit?: number;
  }): Promise<ThreatAlert[]> {
    let alerts = Array.from(this.alerts.values());
    
    if (filters) {
      if (filters.category) {
        alerts = alerts.filter(a => a.category === filters.category);
      }
      if (filters.severity !== undefined) {
        alerts = alerts.filter(a => a.severity >= filters.severity!);
      }
      if (filters.status) {
        alerts = alerts.filter(a => a.status === filters.status);
      }
    }
    
    // Sort by timestamp (newest first)
    alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    if (filters?.limit) {
      alerts = alerts.slice(0, filters.limit);
    }
    
    return alerts;
  }

  async getAlertById(alertId: string): Promise<ThreatAlert | null> {
    return this.alerts.get(alertId) || null;
  }
}
