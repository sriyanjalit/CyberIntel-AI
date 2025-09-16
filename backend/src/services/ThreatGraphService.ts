import { logger } from '../config/logger';
import { ThreatGraph } from '../models/ThreatGraph';
import { Threat } from '../models/Threat';
import { ThreatData } from './AIService';

export interface ThreatRelationship {
  threatId: string;
  relatedThreatId: string;
  relationshipType: 'similar' | 'related' | 'derived' | 'conflict' | 'timeline';
  confidence: number;
  metadata: {
    similarityScore?: number;
    temporalProximity?: number;
    sourceOverlap?: number;
    categoryMatch?: boolean;
    severityCorrelation?: number;
  };
}

export interface ThreatNetwork {
  nodes: Array<{
    id: string;
    title: string;
    category: string;
    severity: number;
    timestamp: Date;
  }>;
  edges: Array<{
    source: string;
    target: string;
    relationshipType: string;
    confidence: number;
  }>;
}

export class ThreatGraphService {
  constructor() {}

  async createThreatRelationship(relationship: ThreatRelationship): Promise<ThreatGraph> {
    try {
      const threatGraph = await ThreatGraph.create(relationship);
      logger.info(`Created threat relationship: ${relationship.threatId} -> ${relationship.relatedThreatId}`);
      return threatGraph;
    } catch (error) {
      logger.error('Error creating threat relationship:', error);
      throw error;
    }
  }

  async findRelatedThreats(threatId: string, limit: number = 10): Promise<ThreatGraph[]> {
    try {
      const relationships = await ThreatGraph.findAll({
        where: {
          [Op.or]: [
            { threatId },
            { relatedThreatId: threatId }
          ]
        },
        include: [
          {
            model: Threat,
            as: 'threat',
            attributes: ['id', 'title', 'category', 'severity', 'timestamp']
          },
          {
            model: Threat,
            as: 'relatedThreat',
            attributes: ['id', 'title', 'category', 'severity', 'timestamp']
          }
        ],
        order: [['confidence', 'DESC']],
        limit
      });

      return relationships;
    } catch (error) {
      logger.error('Error finding related threats:', error);
      throw error;
    }
  }

  async buildThreatNetwork(threatIds: string[]): Promise<ThreatNetwork> {
    try {
      const relationships = await ThreatGraph.findAll({
        where: {
          [Op.or]: [
            { threatId: { [Op.in]: threatIds } },
            { relatedThreatId: { [Op.in]: threatIds } }
          ]
        },
        include: [
          {
            model: Threat,
            as: 'threat',
            attributes: ['id', 'title', 'category', 'severity', 'timestamp']
          },
          {
            model: Threat,
            as: 'relatedThreat',
            attributes: ['id', 'title', 'category', 'severity', 'timestamp']
          }
        ]
      });

      const nodes = new Map();
      const edges: any[] = [];

      relationships.forEach(rel => {
        // Add nodes
        if (rel.threat) {
          nodes.set(rel.threat.id, {
            id: rel.threat.id,
            title: rel.threat.title,
            category: rel.threat.category,
            severity: rel.threat.severity,
            timestamp: rel.threat.timestamp
          });
        }
        if (rel.relatedThreat) {
          nodes.set(rel.relatedThreat.id, {
            id: rel.relatedThreat.id,
            title: rel.relatedThreat.title,
            category: rel.relatedThreat.category,
            severity: rel.relatedThreat.severity,
            timestamp: rel.relatedThreat.timestamp
          });
        }

        // Add edge
        edges.push({
          source: rel.threatId,
          target: rel.relatedThreatId,
          relationshipType: rel.relationshipType,
          confidence: rel.confidence
        });
      });

      return {
        nodes: Array.from(nodes.values()),
        edges
      };
    } catch (error) {
      logger.error('Error building threat network:', error);
      throw error;
    }
  }

  async analyzeThreatSimilarity(threat1: ThreatData, threat2: ThreatData): Promise<number> {
    try {
      let similarityScore = 0;

      // Text similarity (title and description)
      const text1 = `${threat1.title} ${threat1.description}`.toLowerCase();
      const text2 = `${threat2.title} ${threat2.description}`.toLowerCase();
      
      const commonWords = this.getCommonWords(text1, text2);
      const totalWords = this.getTotalUniqueWords(text1, text2);
      
      if (totalWords > 0) {
        similarityScore += (commonWords / totalWords) * 0.4;
      }

      // Category similarity
      if (threat1.category === threat2.category) {
        similarityScore += 0.3;
      }

      // Severity similarity
      const severityDiff = Math.abs(threat1.severity - threat2.severity);
      similarityScore += (1 - severityDiff) * 0.2;

      // Source similarity
      if (threat1.source === threat2.source) {
        similarityScore += 0.1;
      }

      return Math.min(similarityScore, 1.0);
    } catch (error) {
      logger.error('Error analyzing threat similarity:', error);
      return 0;
    }
  }

  async detectThreatPatterns(threats: ThreatData[]): Promise<ThreatRelationship[]> {
    try {
      const relationships: ThreatRelationship[] = [];

      for (let i = 0; i < threats.length; i++) {
        for (let j = i + 1; j < threats.length; j++) {
          const threat1 = threats[i];
          const threat2 = threats[j];

          const similarity = await this.analyzeThreatSimilarity(threat1, threat2);

          if (similarity > 0.6) {
            relationships.push({
              threatId: threat1.id,
              relatedThreatId: threat2.id,
              relationshipType: 'similar',
              confidence: similarity,
              metadata: {
                similarityScore: similarity,
                temporalProximity: this.calculateTemporalProximity(threat1.timestamp, threat2.timestamp),
                sourceOverlap: threat1.source === threat2.source ? 1 : 0,
                categoryMatch: threat1.category === threat2.category,
                severityCorrelation: 1 - Math.abs(threat1.severity - threat2.severity)
              }
            });
          }
        }
      }

      return relationships;
    } catch (error) {
      logger.error('Error detecting threat patterns:', error);
      return [];
    }
  }

  async storeThreatRelationships(relationships: ThreatRelationship[]): Promise<void> {
    try {
      for (const relationship of relationships) {
        // Check if relationship already exists
        const existing = await ThreatGraph.findOne({
          where: {
            threatId: relationship.threatId,
            relatedThreatId: relationship.relatedThreatId,
            relationshipType: relationship.relationshipType
          }
        });

        if (!existing) {
          await this.createThreatRelationship(relationship);
        }
      }
    } catch (error) {
      logger.error('Error storing threat relationships:', error);
      throw error;
    }
  }

  private getCommonWords(text1: string, text2: string): number {
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    let common = 0;
    for (const word of words1) {
      if (words2.has(word) && word.length > 3) { // Ignore short words
        common++;
      }
    }
    
    return common;
  }

  private getTotalUniqueWords(text1: string, text2: string): number {
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const union = new Set([...words1, ...words2]);
    return union.size;
  }

  private calculateTemporalProximity(timestamp1: Date, timestamp2: Date): number {
    const diff = Math.abs(timestamp1.getTime() - timestamp2.getTime());
    const hours = diff / (1000 * 60 * 60);
    
    // Closer timestamps have higher proximity
    if (hours < 1) return 1.0;
    if (hours < 24) return 0.8;
    if (hours < 168) return 0.6; // 1 week
    if (hours < 720) return 0.4; // 1 month
    return 0.2;
  }

  async getThreatGraphStats(): Promise<{
    totalRelationships: number;
    relationshipsByType: Record<string, number>;
    averageConfidence: number;
    topThreats: Array<{ threatId: string; relationshipCount: number }>;
  }> {
    try {
      const totalRelationships = await ThreatGraph.count();
      
      const relationshipsByType = await ThreatGraph.findAll({
        attributes: [
          'relationshipType',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['relationshipType'],
        raw: true
      });

      const averageConfidence = await ThreatGraph.findOne({
        attributes: [
          [sequelize.fn('AVG', sequelize.col('confidence')), 'avg']
        ],
        raw: true
      });

      const topThreats = await ThreatGraph.findAll({
        attributes: [
          'threatId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['threatId'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        limit: 10,
        raw: true
      });

      return {
        totalRelationships,
        relationshipsByType: relationshipsByType.reduce((acc, item) => {
          acc[item.relationshipType] = parseInt(item.count);
          return acc;
        }, {} as Record<string, number>),
        averageConfidence: parseFloat(averageConfidence?.avg || '0'),
        topThreats: topThreats.map(item => ({
          threatId: item.threatId,
          relationshipCount: parseInt(item.count)
        }))
      };
    } catch (error) {
      logger.error('Error getting threat graph stats:', error);
      throw error;
    }
  }
}

// Import Op from sequelize
import { Op } from 'sequelize';
