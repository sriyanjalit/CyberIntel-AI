import axios from 'axios';
import * as cheerio from 'cheerio';
import * as cron from 'node-cron';
import { parseString } from 'xml2js';
import { logger } from '../config/logger';
import { ThreatData } from './AIService';

export interface ThreatFeed {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'api' | 'csv' | 'json' | 'web';
  category: 'open_web' | 'dark_web' | 'threat_feeds';
  enabled: boolean;
  lastFetch?: Date;
  fetchInterval: string;
}

export class DataIngestionService {
  private feeds: ThreatFeed[] = [];
  private isRunning = false;
  private fetchJobs: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.initializeFeeds();
  }

  private initializeFeeds(): void {
    this.feeds.push({
      id: 'cve-mitre',
      name: 'CVE Database',
      url: 'https://cve.mitre.org/data/downloads/allitems.xml',
      type: 'xml',
      category: 'open_web',
      enabled: true,
      fetchInterval: '0 */6 * * *'
    });

    this.feeds.push({
      id: 'nvd-nist',
      name: 'NVD Database',
      url: 'https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss.xml',
      type: 'rss',
      category: 'open_web',
      enabled: true,
      fetchInterval: '0 */4 * * *'
    });

    this.feeds.push({
      id: 'us-cert',
      name: 'US-CERT Alerts',
      url: 'https://www.us-cert.gov/ncas/alerts.xml',
      type: 'rss',
      category: 'open_web',
      enabled: true,
      fetchInterval: '0 */2 * * *'
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Data Ingestion Service is already running');
      return;
    }

    try {
      logger.info('Starting Data Ingestion Service...');
      
      for (const feed of this.feeds) {
        if (feed.enabled) {
          await this.scheduleFeed(feed);
        }
      }

      this.isRunning = true;
      logger.info('Data Ingestion Service started successfully');
    } catch (error) {
      logger.error('Failed to start Data Ingestion Service:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    try {
      logger.info('Stopping Data Ingestion Service...');
      
      for (const [feedId, job] of this.fetchJobs) {
        job.stop();
        logger.info(Stopped feed: );
      }
      
      this.fetchJobs.clear();
      this.isRunning = false;
      logger.info('Data Ingestion Service stopped');
    } catch (error) {
      logger.error('Error stopping Data Ingestion Service:', error);
      throw error;
    }
  }

  private async scheduleFeed(feed: ThreatFeed): Promise<void> {
    try {
      const job = cron.schedule(feed.fetchInterval, async () => {
        await this.fetchFeedData(feed);
      }, { scheduled: false });

      this.fetchJobs.set(feed.id, job);
      job.start();
      
      await this.fetchFeedData(feed);
      logger.info(Scheduled feed:  ());
    } catch (error) {
      logger.error(Failed to schedule feed :, error);
    }
  }

  private async fetchFeedData(feed: ThreatFeed): Promise<ThreatData[]> {
    try {
      logger.info(Fetching data from ...);
      
      let threats: ThreatData[] = [];
      
      switch (feed.type) {
        case 'rss':
          threats = await this.fetchRSSFeed(feed);
          break;
        case 'xml':
          threats = await this.fetchXMLFeed(feed);
          break;
        case 'json':
          threats = await this.fetchJSONFeed(feed);
          break;
        default:
          logger.warn(Unsupported feed type: );
      }

      feed.lastFetch = new Date();
      logger.info(Fetched  threats from );
      return threats;
    } catch (error) {
      logger.error(Error fetching data from :, error);
      return [];
    }
  }

  private async fetchRSSFeed(feed: ThreatFeed): Promise<ThreatData[]> {
    try {
      const response = await axios.get(feed.url, {
        timeout: 30000,
        headers: { 'User-Agent': 'Cyber-Threat-Intelligence-Platform/1.0' }
      });

      const threats: ThreatData[] = [];
      
      parseString(response.data, (err, result) => {
        if (err) {
          logger.error(Error parsing RSS feed :, err);
          return;
        }

        const items = result.rss?.channel?.[0]?.item || [];
        
        for (const item of items) {
          const threat: ThreatData = {
            id: this.generateThreatId(feed.id, item.guid?.[0] || item.link?.[0]),
            title: item.title?.[0] || 'Untitled',
            description: item.description?.[0] || '',
            source: feed.name,
            severity: this.extractSeverityFromText(item.description?.[0] || ''),
            category: this.categorizeThreat(item.title?.[0] || '', item.description?.[0] || ''),
            timestamp: new Date(item.pubDate?.[0] || Date.now()),
            metadata: {
              link: item.link?.[0],
              author: item.author?.[0],
              category: item.category?.[0],
              feedId: feed.id
            }
          };
          
          threats.push(threat);
        }
      });

      return threats;
    } catch (error) {
      logger.error(Error fetching RSS feed :, error);
      return [];
    }
  }

  private async fetchXMLFeed(feed: ThreatFeed): Promise<ThreatData[]> {
    try {
      const response = await axios.get(feed.url, {
        timeout: 30000,
        headers: { 'User-Agent': 'Cyber-Threat-Intelligence-Platform/1.0' }
      });

      const threats: ThreatData[] = [];
      
      parseString(response.data, (err, result) => {
        if (err) {
          logger.error(Error parsing XML feed :, err);
          return;
        }

        const items = result.vulnerabilities?.vulnerability || [];
        
        for (const item of items) {
          const threat: ThreatData = {
            id: this.generateThreatId(feed.id, item.$.id),
            title: CVE-,
            description: item.summary?.[0] || '',
            source: feed.name,
            severity: this.extractCVESeverity(item),
            category: 'vulnerability',
            timestamp: new Date(item.published?.[0] || Date.now()),
            metadata: {
              cveId: item.$.id,
              references: item.references?.[0]?.reference || [],
              feedId: feed.id
            }
          };
          
          threats.push(threat);
        }
      });

      return threats;
    } catch (error) {
      logger.error(Error fetching XML feed :, error);
      return [];
    }
  }

  private async fetchJSONFeed(feed: ThreatFeed): Promise<ThreatData[]> {
    try {
      const response = await axios.get(feed.url, {
        timeout: 30000,
        headers: { 'User-Agent': 'Cyber-Threat-Intelligence-Platform/1.0' }
      });

      const data = response.data;
      const threats: ThreatData[] = [];
      
      const items = Array.isArray(data) ? data : data.items || data.results || [];
      
      for (const item of items) {
        const threat: ThreatData = {
          id: this.generateThreatId(feed.id, item.id || item.url || Math.random().toString()),
          title: item.title || item.name || 'Threat Alert',
          description: item.description || item.summary || '',
          source: feed.name,
          severity: this.extractSeverityFromText(item.description || ''),
          category: this.categorizeThreat(item.title || '', item.description || ''),
          timestamp: new Date(item.timestamp || item.date || Date.now()),
          metadata: { ...item, feedId: feed.id }
        };
        
        threats.push(threat);
      }

      return threats;
    } catch (error) {
      logger.error(Error fetching JSON feed :, error);
      return [];
    }
  }

  private generateThreatId(feedId: string, identifier: string): string {
    return ${feedId}_;
  }

  private extractSeverityFromText(text: string): number {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('critical') || lowerText.includes('severe')) {
      return 0.9;
    } else if (lowerText.includes('high') || lowerText.includes('serious')) {
      return 0.7;
    } else if (lowerText.includes('medium') || lowerText.includes('moderate')) {
      return 0.5;
    } else if (lowerText.includes('low') || lowerText.includes('minor')) {
      return 0.3;
    }
    
    return 0.5;
  }

  private extractCVESeverity(cveItem: any): number {
    const cvss = cveItem.cvss?.[0];
    if (cvss) {
      const score = parseFloat(cvss.$.score);
      if (score >= 9.0) return 0.9;
      if (score >= 7.0) return 0.7;
      if (score >= 4.0) return 0.5;
      return 0.3;
    }
    return 0.5;
  }

  private categorizeThreat(title: string, description: string): string {
    const text = ${title} .toLowerCase();
    
    if (text.includes('cve') || text.includes('vulnerability')) {
      return 'vulnerability';
    } else if (text.includes('malware') || text.includes('virus') || text.includes('trojan')) {
      return 'malware';
    } else if (text.includes('phishing') || text.includes('scam')) {
      return 'phishing';
    } else if (text.includes('ddos') || text.includes('attack')) {
      return 'attack';
    } else if (text.includes('breach') || text.includes('leak')) {
      return 'breach';
    } else if (text.includes('ransomware')) {
      return 'ransomware';
    }
    
    return 'general';
  }

  async getFeeds(): Promise<ThreatFeed[]> {
    return this.feeds;
  }
}
