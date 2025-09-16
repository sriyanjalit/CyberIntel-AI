const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ThreatAlert {
  id: string;
  threatId: string;
  title: string;
  description: string;
  severity: number;
  category: string;
  source: string;
  timestamp: string;
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  notes?: string;
  metadata: any;
}

export interface DashboardStats {
  totalThreats: number;
  criticalThreats: number;
  highThreats: number;
  mediumThreats: number;
  lowThreats: number;
  threatsByCategory: Record<string, number>;
  threatsBySource: Record<string, number>;
  recentAlerts: ThreatAlert[];
}

export interface ThreatPattern {
  id: string;
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
  detectedAt: string;
}

export interface ThreatNetwork {
  nodes: Array<{
    id: string;
    title: string;
    category: string;
    severity: number;
    timestamp: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
    relationshipType: string;
    confidence: number;
  }>;
}

export interface IntelligenceSummary {
  totalThreats: number;
  criticalThreats: number;
  highThreats: number;
  mediumThreats: number;
  lowThreats: number;
  topCategories: Array<{ category: string; count: number; percentage: number }>;
  topSources: Array<{ source: string; count: number; percentage: number }>;
  affectedSectors: Array<{ sector: string; count: number; percentage: number }>;
  attackVectors: Array<{ vector: string; count: number; percentage: number }>;
  timeframe: string;
  generatedAt: string;
}

export interface ThreatTrend {
  period: string;
  metric: string;
  data: Array<{ date: string; value: number; count: number }>;
  summary: {
    average: number;
    trend: string;
    change: number;
    changePercentage: number;
  };
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Dashboard API
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  async getAlerts(filters?: {
    category?: string;
    severity?: number;
    status?: string;
    limit?: number;
  }): Promise<ApiResponse<ThreatAlert[]>> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.severity !== undefined) params.append('severity', filters.severity.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/dashboard/alerts?${queryString}` : '/dashboard/alerts';
    
    return this.request<ThreatAlert[]>(endpoint);
  }

  async getAlertById(alertId: string): Promise<ApiResponse<ThreatAlert>> {
    return this.request<ThreatAlert>(`/dashboard/alerts/${alertId}`);
  }

  async updateAlertStatus(
    alertId: string,
    status: string,
    notes?: string,
    assignedTo?: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/dashboard/alerts/${alertId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes, assignedTo }),
    });
  }

  async getThreatPatterns(): Promise<ApiResponse<ThreatPattern[]>> {
    return this.request<ThreatPattern[]>('/dashboard/patterns');
  }

  async getThreatNetwork(threatId: string): Promise<ApiResponse<ThreatNetwork>> {
    return this.request<ThreatNetwork>(`/dashboard/network/${threatId}`);
  }

  async getThreatGraphStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/dashboard/graph/stats');
  }

  async getRelatedThreats(threatId: string, limit: number = 10): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/dashboard/threats/${threatId}/related?limit=${limit}`);
  }

  async getIntelligenceSummary(timeframe: string = '24h'): Promise<ApiResponse<IntelligenceSummary>> {
    return this.request<IntelligenceSummary>(`/dashboard/intelligence/summary?timeframe=${timeframe}`);
  }

  async getThreatTrends(period: string = '7d', metric: string = 'severity'): Promise<ApiResponse<ThreatTrend>> {
    return this.request<ThreatTrend>(`/dashboard/trends?period=${period}&metric=${metric}`);
  }

  async getAlertsConfig(): Promise<ApiResponse<any>> {
    return this.request<any>('/dashboard/alerts/config');
  }

  async updateAlertsConfig(config: any): Promise<ApiResponse<void>> {
    return this.request<void>('/dashboard/alerts/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // Health check
  async getHealthStatus(): Promise<ApiResponse<any>> {
    return this.request<any>('/health');
  }
}

export const apiService = new ApiService();
export default apiService;
