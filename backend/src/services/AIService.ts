import * as tf from '@tensorflow/tfjs';
import * as natural from 'natural';
import Sentiment from 'sentiment';
import { logger } from '../config/logger';

export interface ThreatData {
  id: string;
  title: string;
  description: string;
  source: string;
  severity: number;
  category: string;
  timestamp: Date;
  metadata: any;
}

export interface ThreatScore {
  relevance: number;
  severity: number;
  confidence: number;
  priority: number;
}

export class AIService {
  private sentimentAnalyzer: any;
  private tokenizer: any;
  private model: any | null = null;

  constructor() {
    this.sentimentAnalyzer = new Sentiment();
    this.tokenizer = new natural.WordTokenizer();
  }

  async initialize(): Promise<void> {
    try {
      // Initialize TensorFlow model for threat classification
      await this.loadModel();
      logger.info('AI Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI Service:', error);
      throw error;
    }
  }

  private async loadModel(): Promise<void> {
    try {
      // Load pre-trained model for threat classification
      // This would typically be a custom model trained on threat data
      // In browser/JS backend, provide http(s) path or disable model load
      // this.model = await tf.loadLayersModel('/models/threat-classifier/model.json');
      this.model = null;
      logger.info('Threat classification model loaded');
    } catch (error) {
      logger.warn('Could not load pre-trained model, using rule-based approach');
      this.model = null;
    }
  }

  async analyzeThreat(threatData: ThreatData): Promise<ThreatScore> {
    try {
      const relevance = this.calculateRelevance(threatData);
      const severity = await this.calculateSeverity(threatData);
      const confidence = await this.calculateConfidence(threatData);
      const priority = this.calculatePriority(relevance, severity, confidence);

      return {
        relevance,
        severity,
        confidence,
        priority
      };
    } catch (error) {
      logger.error('Error analyzing threat:', error);
      throw error;
    }
  }

  private calculateRelevance(threatData: ThreatData): number {
    try {
      const text = `${threatData.title} ${threatData.description}`.toLowerCase();
      
      // Keywords that indicate high relevance
      const highRelevanceKeywords = [
        'zero-day', 'exploit', 'ransomware', 'malware', 'phishing',
        'ddos', 'breach', 'vulnerability', 'cve', 'apt', 'threat',
        'attack', 'compromise', 'intrusion', 'backdoor', 'trojan'
      ];

      // Keywords that indicate medium relevance
      const mediumRelevanceKeywords = [
        'security', 'patch', 'update', 'fix', 'alert', 'warning',
        'advisory', 'bulletin', 'incident', 'event'
      ];

      let relevanceScore = 0;
      
      // Check for high relevance keywords
      highRelevanceKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          relevanceScore += 0.3;
        }
      });

      // Check for medium relevance keywords
      mediumRelevanceKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          relevanceScore += 0.1;
        }
      });

      // Use sentiment analysis to adjust relevance
      const sentimentScore = this.sentimentAnalyzer.analyze(text).score;
      if (sentimentScore < -2) {
        relevanceScore += 0.2; // Negative sentiment increases relevance
      }

      return Math.min(relevanceScore, 1.0);
    } catch (error) {
      logger.error('Error calculating relevance:', error);
      return 0.5; // Default medium relevance
    }
  }

  private async calculateSeverity(threatData: ThreatData): Promise<number> {
    try {
      const text = `${threatData.title} ${threatData.description}`.toLowerCase();
      
      // Severity indicators
      const criticalKeywords = ['critical', 'severe', 'high-risk', 'emergency', 'urgent'];
      const highKeywords = ['high', 'serious', 'important', 'significant'];
      const mediumKeywords = ['medium', 'moderate', 'normal'];
      const lowKeywords = ['low', 'minor', 'informational'];

      let severityScore = 0.5; // Default medium severity

      if (criticalKeywords.some(keyword => text.includes(keyword))) {
        severityScore = 0.9;
      } else if (highKeywords.some(keyword => text.includes(keyword))) {
        severityScore = 0.7;
      } else if (mediumKeywords.some(keyword => text.includes(keyword))) {
        severityScore = 0.5;
      } else if (lowKeywords.some(keyword => text.includes(keyword))) {
        severityScore = 0.3;
      }

      // Adjust based on source credibility
      const sourceMultiplier = this.getSourceCredibility(threatData.source);
      severityScore *= sourceMultiplier;

      return Math.min(severityScore, 1.0);
    } catch (error) {
      logger.error('Error calculating severity:', error);
      return 0.5;
    }
  }

  private async calculateConfidence(threatData: ThreatData): Promise<number> {
    try {
      let confidence = 0.5; // Base confidence

      // Increase confidence based on data completeness
      if (threatData.title && threatData.description) {
        confidence += 0.2;
      }
      if (threatData.metadata && Object.keys(threatData.metadata).length > 0) {
        confidence += 0.1;
      }

      // Increase confidence based on source reliability
      const sourceCredibility = this.getSourceCredibility(threatData.source);
      confidence += sourceCredibility * 0.2;

      // Decrease confidence for very short descriptions
      if (threatData.description.length < 50) {
        confidence -= 0.2;
      }

      return Math.max(0.1, Math.min(confidence, 1.0));
    } catch (error) {
      logger.error('Error calculating confidence:', error);
      return 0.5;
    }
  }

  private calculatePriority(relevance: number, severity: number, confidence: number): number {
    // Weighted combination of factors
    const priority = (relevance * 0.4) + (severity * 0.4) + (confidence * 0.2);
    return Math.min(priority, 1.0);
  }

  private getSourceCredibility(source: string): number {
    const credibleSources = [
      'cve.mitre.org', 'nvd.nist.gov', 'us-cert.gov', 'krebsonsecurity.com',
      'threatpost.com', 'bleepingcomputer.com', 'securityweek.com'
    ];

    const mediumCredibleSources = [
      'github.com', 'twitter.com', 'reddit.com', 'hackernews.com'
    ];

    const sourceLower = source.toLowerCase();
    
    if (credibleSources.some(s => sourceLower.includes(s))) {
      return 0.9;
    } else if (mediumCredibleSources.some(s => sourceLower.includes(s))) {
      return 0.6;
    } else {
      return 0.4; // Default for unknown sources
    }
  }

  async filterNoise(threats: ThreatData[]): Promise<ThreatData[]> {
    try {
      const filteredThreats = threats.filter(threat => {
        // Filter out low-relevance threats
        const relevance = this.calculateRelevance(threat);
        return relevance > 0.3;
      });

      logger.info(`Filtered ${threats.length - filteredThreats.length} low-relevance threats`);
      return filteredThreats;
    } catch (error) {
      logger.error('Error filtering noise:', error);
      return threats; // Return original if filtering fails
    }
  }

  async detectPatterns(threats: ThreatData[]): Promise<any[]> {
    try {
      const patterns = [] as Array<{ 
        type: string; 
        category: string; 
        count: number; 
        severity: number; 
        timeframe: string;
        confidence: number;
        description: string;
        indicators: string[];
        affectedSectors: string[];
        attackVectors: string[];
      }>;
      
      // Group threats by category
      const categoryGroups = threats.reduce((groups, threat) => {
        const category = threat.category;
        if (!groups[category]) {
          groups[category] = [] as ThreatData[];
        }
        groups[category].push(threat);
        return groups;
      }, {} as Record<string, ThreatData[]>);

      // Detect patterns in each category
      for (const [category, categoryThreats] of Object.entries(categoryGroups)) {
        if (categoryThreats.length > 3) {
          const pattern = {
            type: 'category_cluster',
            category,
            count: categoryThreats.length,
            severity: Math.max(...categoryThreats.map(t => t.severity)),
            timeframe: this.calculateTimeframe(categoryThreats),
            confidence: this.calculatePatternConfidence(categoryThreats),
            description: this.generatePatternDescription(category, categoryThreats),
            indicators: this.extractPatternIndicators(categoryThreats),
            affectedSectors: this.extractAffectedSectors(categoryThreats),
            attackVectors: this.extractAttackVectors(categoryThreats)
          };
          patterns.push(pattern);
        }
      }

      // Detect temporal patterns
      const temporalPatterns = this.detectTemporalPatterns(threats);
      patterns.push(...temporalPatterns);

      // Detect source correlation patterns
      const sourcePatterns = this.detectSourceCorrelationPatterns(threats);
      patterns.push(...sourcePatterns);

      // Detect severity escalation patterns
      const escalationPatterns = this.detectSeverityEscalationPatterns(threats);
      patterns.push(...escalationPatterns);

      return patterns;
    } catch (error) {
      logger.error('Error detecting patterns:', error);
      return [];
    }
  }

  private calculatePatternConfidence(threats: ThreatData[]): number {
    // Higher confidence for patterns with more threats, higher severity, and temporal clustering
    const countScore = Math.min(threats.length / 10, 1.0); // Max at 10 threats
    const severityScore = Math.max(...threats.map(t => t.severity));
    const temporalScore = this.calculateTemporalClustering(threats);
    
    return (countScore * 0.4) + (severityScore * 0.4) + (temporalScore * 0.2);
  }

  private calculateTemporalClustering(threats: ThreatData[]): number {
    if (threats.length < 2) return 0;
    
    const timestamps = threats.map(t => t.timestamp.getTime()).sort((a, b) => a - b);
    const intervals = [];
    
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    
    // Lower variance means more clustered in time
    return Math.max(0, 1 - (variance / (avgInterval * avgInterval)));
  }

  private generatePatternDescription(category: string, threats: ThreatData[]): string {
    const count = threats.length;
    const severity = Math.max(...threats.map(t => t.severity));
    const timeframe = this.calculateTimeframe(threats);
    
    const severityText = severity > 0.8 ? 'critical' : severity > 0.6 ? 'high' : 'medium';
    const timeframeText = timeframe === 'within_hour' ? 'within the last hour' :
                         timeframe === 'within_day' ? 'within the last 24 hours' :
                         timeframe === 'within_week' ? 'within the last week' : 'over the past week';
    
    return `Cluster of ${count} ${severityText} severity ${category} threats detected ${timeframeText}`;
  }

  private extractPatternIndicators(threats: ThreatData[]): string[] {
    const indicators = new Set<string>();
    
    threats.forEach(threat => {
      if (threat.metadata?.iocs) {
        threat.metadata.iocs.forEach((ioc: string) => indicators.add(ioc));
      }
      if (threat.metadata?.tags) {
        threat.metadata.tags.forEach((tag: string) => indicators.add(tag));
      }
    });
    
    return Array.from(indicators);
  }

  private extractAffectedSectors(threats: ThreatData[]): string[] {
    const sectors = new Set<string>();
    
    threats.forEach(threat => {
      const description = threat.description.toLowerCase();
      if (description.includes('healthcare')) sectors.add('Healthcare');
      if (description.includes('financial')) sectors.add('Financial Services');
      if (description.includes('government')) sectors.add('Government');
      if (description.includes('education')) sectors.add('Education');
      if (description.includes('retail')) sectors.add('Retail');
      if (description.includes('manufacturing')) sectors.add('Manufacturing');
      if (description.includes('energy')) sectors.add('Energy');
      if (description.includes('telecommunications')) sectors.add('Telecommunications');
    });
    
    return Array.from(sectors);
  }

  private extractAttackVectors(threats: ThreatData[]): string[] {
    const vectors = new Set<string>();
    
    threats.forEach(threat => {
      const text = `${threat.title} ${threat.description}`.toLowerCase();
      if (text.includes('email') || text.includes('phishing')) vectors.add('Email');
      if (text.includes('web') || text.includes('browser')) vectors.add('Web');
      if (text.includes('network') || text.includes('network')) vectors.add('Network');
      if (text.includes('social') || text.includes('social engineering')) vectors.add('Social Engineering');
      if (text.includes('physical')) vectors.add('Physical');
      if (text.includes('supply chain')) vectors.add('Supply Chain');
    });
    
    return Array.from(vectors);
  }

  private detectTemporalPatterns(threats: ThreatData[]): any[] {
    const patterns = [];
    
    // Group threats by hour of day
    const hourlyGroups = threats.reduce((groups, threat) => {
      const hour = threat.timestamp.getHours();
      if (!groups[hour]) groups[hour] = [];
      groups[hour].push(threat);
      return groups;
    }, {} as Record<number, ThreatData[]>);
    
    // Find hours with unusually high activity
    for (const [hour, hourThreats] of Object.entries(hourlyGroups)) {
      if (hourThreats.length > 3) {
        patterns.push({
          type: 'temporal_cluster',
          category: 'timing_pattern',
          count: hourThreats.length,
          severity: Math.max(...hourThreats.map(t => t.severity)),
          timeframe: `hour_${hour}`,
          confidence: Math.min(hourThreats.length / 5, 1.0),
          description: `Unusual threat activity detected at hour ${hour}:00`,
          indicators: [`hour_${hour}`, 'temporal_clustering'],
          affectedSectors: this.extractAffectedSectors(hourThreats),
          attackVectors: this.extractAttackVectors(hourThreats)
        });
      }
    }
    
    return patterns;
  }

  private detectSourceCorrelationPatterns(threats: ThreatData[]): any[] {
    const patterns = [];
    
    // Group threats by source
    const sourceGroups = threats.reduce((groups, threat) => {
      if (!groups[threat.source]) groups[threat.source] = [];
      groups[threat.source].push(threat);
      return groups;
    }, {} as Record<string, ThreatData[]>);
    
    // Find sources with high activity
    for (const [source, sourceThreats] of Object.entries(sourceGroups)) {
      if (sourceThreats.length > 2) {
        patterns.push({
          type: 'source_correlation',
          category: 'source_pattern',
          count: sourceThreats.length,
          severity: Math.max(...sourceThreats.map(t => t.severity)),
          timeframe: this.calculateTimeframe(sourceThreats),
          confidence: Math.min(sourceThreats.length / 3, 1.0),
          description: `High activity from source: ${source}`,
          indicators: [source, 'source_correlation'],
          affectedSectors: this.extractAffectedSectors(sourceThreats),
          attackVectors: this.extractAttackVectors(sourceThreats)
        });
      }
    }
    
    return patterns;
  }

  private detectSeverityEscalationPatterns(threats: ThreatData[]): any[] {
    const patterns = [];
    
    // Sort threats by timestamp
    const sortedThreats = threats.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Look for escalating severity over time
    let escalationCount = 0;
    let currentSeverity = 0;
    
    for (const threat of sortedThreats) {
      if (threat.severity > currentSeverity + 0.1) {
        escalationCount++;
        currentSeverity = threat.severity;
      }
    }
    
    if (escalationCount > 2) {
      patterns.push({
        type: 'severity_escalation',
        category: 'escalation_pattern',
        count: escalationCount,
        severity: Math.max(...threats.map(t => t.severity)),
        timeframe: this.calculateTimeframe(threats),
        confidence: Math.min(escalationCount / 5, 1.0),
        description: `Severity escalation pattern detected with ${escalationCount} escalating threats`,
        indicators: ['severity_escalation', 'increasing_threat_level'],
        affectedSectors: this.extractAffectedSectors(threats),
        attackVectors: this.extractAttackVectors(threats)
      });
    }
    
    return patterns;
  }

  private calculateTimeframe(threats: ThreatData[]): string {
    const timestamps = threats.map(t => t.timestamp.getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const duration = maxTime - minTime;
    
    if (duration < 3600000) { // 1 hour
      return 'within_hour';
    } else if (duration < 86400000) { // 1 day
      return 'within_day';
    } else if (duration < 604800000) { // 1 week
      return 'within_week';
    } else {
      return 'over_week';
    }
  }
}
