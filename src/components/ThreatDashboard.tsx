import { AlertTriangle, Shield, TrendingUp, Users, Eye, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ThreatMetrics } from "./ThreatMetrics";
import { RealtimeThreats } from "./RealtimeThreats";
import { ThreatMap } from "./ThreatMap";

export const ThreatDashboard = () => {
  const criticalStats = [
    {
      title: "Critical Threats",
      value: "23",
      change: "+5",
      trend: "up",
      icon: AlertTriangle,
      color: "destructive",
      glow: "threat-glow"
    },
    {
      title: "Active Monitoring",
      value: "1.2M",
      change: "+12K",
      trend: "up",
      icon: Eye,
      color: "primary",
      glow: "cyber-glow"
    },
    {
      title: "Threat Actors",
      value: "847",
      change: "+23",
      trend: "up",
      icon: Users,
      color: "warning",
      glow: "accent-glow"
    },
    {
      title: "Mitigated",
      value: "156",
      change: "+31",
      trend: "up",
      icon: Shield,
      color: "success",
      glow: "accent-glow"
    }
  ];

  const recentThreats = [
    {
      id: "CVE-2024-3400",
      title: "Palo Alto Networks Command Injection",
      severity: "Critical",
      score: 9.8,
      category: "Vulnerability",
      time: "2 minutes ago",
      affected: "12,847 systems"
    },
    {
      id: "APT-29-2024",
      title: "Cozy Bear Campaign targeting Financial Sector",
      severity: "High", 
      score: 8.2,
      category: "APT Campaign",
      time: "15 minutes ago",
      affected: "Financial institutions"
    },
    {
      id: "MALW-2024-001",
      title: "BlackCat Ransomware Variant Detected",
      severity: "High",
      score: 7.9,
      category: "Malware",
      time: "1 hour ago", 
      affected: "Healthcare sector"
    }
  ];

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
            <span className="text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</span>
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