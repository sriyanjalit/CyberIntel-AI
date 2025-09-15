import * as tf from '@tensorflow/tfjs-node';
import * as natural from 'natural';
import * as sentiment from 'sentiment';
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
  private sentimentAnalyzer: sentiment.SentimentAnalyzer;
  private tokenizer: natural.WordTokenizer;
  private model: tf.LayersModel | null = null;

  constructor() {
    this.sentimentAnalyzer = new sentiment.SentimentAnalyzer();
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
      this.model = await tf.loadLayersModel('file://./models/threat-classifier/model.json');
      logger.info('Threat classification model loaded');
    } catch (error) {
      logger.warn('Could not load pre-trained model, using rule-based approach');
      this.model = null;
    }
  }

  async analyzeThreat(threatData: ThreatData): Promise<ThreatScore> {
    try {
      const relevance = await this.calculateRelevance(threatData);
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

  private async calculateRelevance(threatData: ThreatData): Promise<number> {
    try {
      const text = ${threatData.title} .toLowerCase();
      
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
      const sentimentScore = this.sentimentAnalyzer.getSentiment(text);
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
      const text = ${threatData.title} .toLowerCase();
      
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

      logger.info(Filtered  low-relevance threats);
      return filteredThreats;
    } catch (error) {
      logger.error('Error filtering noise:', error);
      return threats; // Return original if filtering fails
    }
  }

  async detectPatterns(threats: ThreatData[]): Promise<any[]> {
    try {
      const patterns = [];
      
      // Group threats by category
      const categoryGroups = threats.reduce((groups, threat) => {
        const category = threat.category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(threat);
        return groups;
      }, {} as Record<string, ThreatData[]>);

      // Detect patterns in each category
      for (const [category, categoryThreats] of Object.entries(categoryGroups)) {
        if (categoryThreats.length > 5) {
          patterns.push({
            type: 'category_cluster',
            category,
            count: categoryThreats.length,
            severity: Math.max(...categoryThreats.map(t => t.severity)),
            timeframe: this.calculateTimeframe(categoryThreats)
          });
        }
      }

      return patterns;
    } catch (error) {
      logger.error('Error detecting patterns:', error);
      return [];
    }
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
