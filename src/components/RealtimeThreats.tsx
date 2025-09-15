import { useState } from "react";
import { Zap, Filter, Download, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const RealtimeThreats = () => {
  const [filter, setFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const threats = [
    {
      id: "T001",
      timestamp: "14:32:15",
      source: "Dark Web Monitor",
      type: "Data Breach",
      target: "Financial Services",
      severity: "Critical",
      confidence: 95,
      description: "Credit card data marketplace activity detected",
      ioc: "185.220.101.182",
      status: "investigating"
    },
    {
      id: "T002", 
      timestamp: "14:29:42",
      source: "Honeypot Network",
      type: "Malware C2",
      target: "Healthcare",
      severity: "High",
      confidence: 87,
      description: "New ransomware C2 infrastructure identified",
      ioc: "malware-c2.darknet[.]ru",
      status: "mitigating"
    },
    {
      id: "T003",
      timestamp: "14:25:18", 
      source: "OSINT Crawler",
      type: "Phishing Campaign",
      target: "Government",
      severity: "Medium",
      confidence: 78,
      description: "Spear phishing targeting government officials",
      ioc: "gov-secure-portal[.]net",
      status: "monitoring"
    },
    {
      id: "T004",
      timestamp: "14:21:55",
      source: "Network Sensors",
      type: "DDoS Attack",
      target: "E-commerce",
      severity: "High",
      confidence: 92,
      description: "Volumetric DDoS attack in progress",
      ioc: "Multiple botnets",
      status: "mitigated"
    }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const filteredThreats = filter === "all" ? threats : 
    threats.filter(threat => threat.severity.toLowerCase() === filter);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary" />
            <span>Real-time Threat Detection</span>
            <Badge variant="outline" className="border-primary text-primary animate-pulse">
              Live
            </Badge>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Threats</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {filteredThreats.map((threat, index) => {
            const severityColor = threat.severity === "Critical" ? "destructive" : 
                                threat.severity === "High" ? "warning" : "secondary";
            
            const statusColor = threat.status === "mitigated" ? "success" :
                              threat.status === "mitigating" ? "warning" :
                              threat.status === "investigating" ? "destructive" : "secondary";

            return (
              <div key={index} className="p-4 rounded-lg border border-border hover:border-primary/30 transition-all duration-200 cursor-pointer bg-muted/20">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                  {/* Timestamp & ID */}
                  <div className="lg:col-span-1">
                    <div className="text-xs text-muted-foreground">{threat.timestamp}</div>
                    <div className="text-sm font-mono text-foreground">{threat.id}</div>
                  </div>
                  
                  {/* Threat Details */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant={severityColor} className="text-xs">
                        {threat.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{threat.confidence}% confidence</span>
                    </div>
                    <h4 className="font-semibold text-foreground text-sm">{threat.type} - {threat.target}</h4>
                    <p className="text-xs text-muted-foreground">{threat.description}</p>
                  </div>
                  
                  {/* Source & IOC */}
                  <div className="lg:col-span-2">
                    <div className="text-xs text-muted-foreground">Source</div>
                    <div className="text-sm text-foreground">{threat.source}</div>
                    <div className="text-xs text-muted-foreground mt-1">IOC</div>
                    <div className="text-xs font-mono text-accent break-all">{threat.ioc}</div>
                  </div>
                  
                  {/* Status */}
                  <div className="lg:col-span-1">
                    <Badge variant={statusColor} className="text-xs capitalize">
                      {threat.status}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredThreats.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No threats matching the current filter criteria.
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {filteredThreats.length} of {threats.length} threats</span>
          <span>Auto-refresh: 30s</span>
        </div>
      </CardContent>
    </Card>
  );
};