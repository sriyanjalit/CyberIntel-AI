import { AlertTriangle, Shield, TrendingUp, Users, Eye, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ThreatMetrics } from "./ThreatMetrics";
import { RealtimeThreats } from "./RealtimeThreats";
import { ThreatMap } from "./ThreatMap";
import { useEffect, useState } from "react";
import { apiService, DashboardStats, ThreatAlert } from "@/services/api";
import { socketService } from "@/services/socket";

export const ThreatDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<ThreatAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [statsResponse, alertsResponse] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getAlerts({ limit: 3 })
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        if (alertsResponse.success) {
          setRecentAlerts(alertsResponse.data);
        }

        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Set up real-time updates
    socketService.setEventHandlers({
      onStats: (newStats) => {
        setStats(newStats);
        setLastUpdated(new Date());
      },
      onNewAlert: (alert) => {
        setRecentAlerts(prev => [alert, ...prev.slice(0, 2)]);
        setLastUpdated(new Date());
      },
      onAlertUpdated: (updatedAlert) => {
        setRecentAlerts(prev => 
          prev.map(alert => alert.id === updatedAlert.id ? updatedAlert : alert)
        );
        setLastUpdated(new Date());
      }
    });

    // Cleanup on unmount
    return () => {
      socketService.removeEventHandlers();
    };
  }, []);

  const criticalStats = stats ? [
    {
      title: "Critical Threats",
      value: stats.criticalThreats.toString(),
      change: "+5",
      trend: "up",
      icon: AlertTriangle,
      color: "destructive",
      glow: "threat-glow"
    },
    {
      title: "Active Monitoring",
      value: stats.totalThreats.toString(),
      change: "+12K",
      trend: "up",
      icon: Eye,
      color: "primary",
      glow: "cyber-glow"
    },
    {
      title: "High Threats",
      value: stats.highThreats.toString(),
      change: "+23",
      trend: "up",
      icon: Users,
      color: "warning",
      glow: "accent-glow"
    },
    {
      title: "Medium Threats",
      value: stats.mediumThreats.toString(),
      change: "+31",
      trend: "up",
      icon: Shield,
      color: "success",
      glow: "accent-glow"
    }
  ] : [];

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const getSeverityLabel = (severity: number) => {
    if (severity >= 0.8) return "Critical";
    if (severity >= 0.6) return "High";
    if (severity >= 0.4) return "Medium";
    return "Low";
  };

  const recentThreats = recentAlerts.map(alert => ({
    id: alert.threatId,
    title: alert.title,
    severity: getSeverityLabel(alert.severity),
    score: Math.round(alert.severity * 10),
    category: alert.category,
    time: formatTimeAgo(alert.timestamp),
    affected: alert.metadata?.affectedSectors?.join(', ') || "Multiple sectors"
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Threat Intelligence Dashboard</h1>
        <p className="text-muted-foreground">Real-time cyber threat monitoring and analysis</p>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">Live monitoring active</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Critical Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {criticalStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={`bg-card border-border hover:border-primary/50 transition-all duration-300 ${stat.glow}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      <Badge variant={stat.color === "destructive" ? "destructive" : "secondary"} className="text-xs">
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-${stat.color}/10`}>
                    <Icon className={`w-6 h-6 text-${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Threats Feed */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span>Real-time Threat Feed</span>
                </CardTitle>
                <Badge variant="outline" className="border-primary text-primary">
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentThreats.map((threat, index) => {
                const severityColor = threat.severity === "Critical" ? "destructive" : 
                                    threat.severity === "High" ? "warning" : "secondary";
                return (
                  <div key={index} className="p-4 rounded-lg border border-border hover:border-primary/30 transition-all duration-200 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant={severityColor} className="text-xs">
                            {threat.severity} {threat.score}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{threat.category}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{threat.time}</span>
                        </div>
                        <h4 className="font-semibold text-foreground mb-1">{threat.title}</h4>
                        <p className="text-sm text-muted-foreground">Affected: {threat.affected}</p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Risk Assessment</span>
                            <span>{threat.score}/10</span>
                          </div>
                          <Progress value={threat.score * 10} className="h-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Threat Metrics */}
        <div className="space-y-6">
          <ThreatMetrics />
          <ThreatMap />
        </div>
      </div>

      {/* Bottom Row */}
      <RealtimeThreats />
    </div>
  );
};