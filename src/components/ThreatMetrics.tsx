import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const ThreatMetrics = () => {
  const metrics = [
    {
      label: "Threat Level",
      value: 78,
      status: "High",
      trend: "up",
      color: "destructive"
    },
    {
      label: "Detection Rate", 
      value: 94,
      status: "Excellent",
      trend: "up",
      color: "success"
    },
    {
      label: "Response Time",
      value: 65,
      status: "Good", 
      trend: "down",
      color: "warning"
    }
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary" />
          <span>Threat Metrics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, index) => {
          const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;
          const trendColor = metric.trend === "up" ? 
            (metric.color === "destructive" ? "text-destructive" : "text-success") : 
            "text-success";
            
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{metric.label}</span>
                <div className="flex items-center space-x-1">
                  <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                  <span className="text-sm text-muted-foreground">{metric.status}</span>
                </div>
              </div>
              <Progress 
                value={metric.value} 
                className={`h-2 ${metric.color === "destructive" ? "[&>div]:bg-destructive" : 
                  metric.color === "success" ? "[&>div]:bg-success" : "[&>div]:bg-warning"}`} 
              />
              <div className="text-xs text-muted-foreground text-right">{metric.value}%</div>
            </div>
          );
        })}
        
        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Priority Focus</span>
          </div>
          <p className="text-xs text-muted-foreground">
            APT campaigns targeting financial institutions show 23% increase in activity.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};