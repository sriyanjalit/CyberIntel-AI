import { BarChart3, TrendingUp, PieChart, Activity, Calendar, Download, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Analytics = () => {
  const threatTrends = [
    { category: "Ransomware", current: 847, previous: 823, change: 2.9 },
    { category: "APT Campaigns", current: 156, previous: 134, change: 16.4 },
    { category: "Data Breaches", current: 234, previous: 267, change: -12.4 },
    { category: "Phishing", current: 1247, previous: 1189, change: 4.9 },
    { category: "Malware C2", current: 567, previous: 589, change: -3.7 }
  ];

  const sectorAnalysis = [
    { sector: "Financial Services", threats: 2847, percentage: 28 },
    { sector: "Healthcare", threats: 1956, percentage: 19 },
    { sector: "Government", threats: 1734, percentage: 17 },
    { sector: "Technology", threats: 1423, percentage: 14 },
    { sector: "Manufacturing", threats: 1156, percentage: 11 },
    { sector: "Others", threats: 1134, percentage: 11 }
  ];

  const geographicData = [
    { region: "North America", threats: 3456, severity: "High" },
    { region: "Europe", threats: 2847, severity: "High" },
    { region: "Asia Pacific", threats: 4123, severity: "Critical" },
    { region: "Middle East", threats: 1234, severity: "Medium" },
    { region: "Africa", threats: 567, severity: "Low" }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Threat Analytics</h1>
          <p className="text-muted-foreground">Comprehensive analysis and trends across global threat landscape</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select defaultValue="30-days">
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7-days">Last 7 days</SelectItem>
              <SelectItem value="30-days">Last 30 days</SelectItem>
              <SelectItem value="90-days">Last 90 days</SelectItem>
              <SelectItem value="1-year">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-border cyber-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Threats</p>
                <p className="text-3xl font-bold text-foreground">12,847</p>
                <div className="flex items-center space-x-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">+8.2%</span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Events</p>
                <p className="text-3xl font-bold text-foreground">234</p>
                <div className="flex items-center space-x-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">+12.3%</span>
                </div>
              </div>
              <BarChart3 className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Detection Rate</p>
                <p className="text-3xl font-bold text-foreground">94.7%</p>
                <div className="flex items-center space-x-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">+2.1%</span>
                </div>
              </div>
              <PieChart className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Response Time</p>
                <p className="text-3xl font-bold text-foreground">2.3m</p>
                <div className="flex items-center space-x-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">-18.2%</span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Trends */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Threat Category Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {threatTrends.map((trend, index) => {
              const isPositive = trend.change > 0;
              const changeColor = isPositive ? "text-destructive" : "text-success";
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{trend.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{trend.current.toLocaleString()}</span>
                      <Badge variant={isPositive ? "destructive" : "secondary"} className="text-xs">
                        {isPositive ? "+" : ""}{trend.change}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={(trend.current / Math.max(...threatTrends.map(t => t.current))) * 100} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Sector Analysis */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-primary" />
              <span>Threats by Industry Sector</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sectorAnalysis.map((sector, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{sector.sector}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{sector.threats.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">{sector.percentage}%</span>
                  </div>
                </div>
                <Progress value={sector.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Geographic Analysis */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>Geographic Threat Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {geographicData.map((region, index) => {
              const severityColor = region.severity === "Critical" ? "destructive" : 
                                  region.severity === "High" ? "default" : 
                                  region.severity === "Medium" ? "secondary" : "outline";
              
              return (
                <div key={index} className="p-4 rounded-lg border border-border hover:border-primary/30 transition-all duration-200">
                  <div className="text-center space-y-2">
                    <h4 className="font-semibold text-foreground text-sm">{region.region}</h4>
                    <p className="text-2xl font-bold text-foreground">{region.threats.toLocaleString()}</p>
                    <Badge variant={severityColor} className="text-xs">
                      {region.severity} Risk
                    </Badge>
                    <Progress 
                      value={(region.threats / Math.max(...geographicData.map(r => r.threats))) * 100} 
                      className="h-1" 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights Summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <span>AI-Generated Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Key Findings</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• APT campaigns show 16.4% increase, primarily targeting financial sector</li>
                <li>• Asia Pacific region experiences highest threat volume with critical risk level</li>
                <li>• Ransomware attacks maintain steady growth trend at 2.9% increase</li>
                <li>• Detection systems show improved performance with 94.7% success rate</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Recommendations</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Increase monitoring of financial services infrastructure</li>
                <li>• Deploy additional sensors in Asia Pacific region</li>
                <li>• Update ransomware detection signatures and IOCs</li>
                <li>• Enhance threat intelligence sharing with industry partners</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};