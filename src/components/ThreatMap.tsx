import { MapPin, Globe, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const ThreatMap = () => {
  const globalThreats = [
    { country: "Russia", threats: 847, severity: "High", lat: 55.7558, lng: 37.6173 },
    { country: "China", threats: 623, severity: "High", lat: 39.9042, lng: 116.4074 },
    { country: "North Korea", threats: 234, severity: "Medium", lat: 39.0392, lng: 125.7625 },
    { country: "Iran", threats: 189, severity: "Medium", lat: 35.6892, lng: 51.3890 },
    { country: "USA", threats: 156, severity: "Low", lat: 38.9072, lng: -77.0369 }
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-primary" />
          <span>Global Threat Origins</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Simplified threat visualization */}
        <div className="relative h-32 bg-gradient-cyber rounded-lg border border-border overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/10"></div>
          
          {/* Threat indicators */}
          {globalThreats.slice(0, 3).map((threat, index) => (
            <div 
              key={index}
              className="absolute w-3 h-3 rounded-full animate-pulse"
              style={{
                left: `${20 + index * 25}%`,
                top: `${30 + index * 15}%`,
                backgroundColor: threat.severity === "High" ? "rgb(239 68 68)" : 
                              threat.severity === "Medium" ? "rgb(245 158 11)" : "rgb(34 197 94)"
              }}
            ></div>
          ))}
          
          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
            Live threat activity mapping
          </div>
        </div>

        {/* Threat list */}
        <div className="space-y-2">
          {globalThreats.map((threat, index) => {
            const severityColor = threat.severity === "High" ? "destructive" : 
                                threat.severity === "Medium" ? "warning" : "success";
            
            return (
              <div key={index} className="flex items-center justify-between p-2 rounded border border-border/50 hover:border-primary/30 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{threat.country}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{threat.threats}</span>
                  <Badge variant={severityColor} className="text-xs">
                    {threat.severity}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 p-2 rounded bg-muted/30 border border-border">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            <span className="text-xs font-medium text-foreground">Alert</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Unusual activity spike detected from Eastern Europe region.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};