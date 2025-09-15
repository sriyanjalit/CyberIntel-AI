import { Search, Filter, Eye, Download, AlertTriangle, Globe, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ThreatIntelligence = () => {
  const intelligenceFeeds = [
    {
      source: "FBI IC3",
      type: "APT Campaign",
      title: "Lazarus Group targeting cryptocurrency exchanges",
      severity: "Critical",
      confidence: 95,
      timestamp: "2024-01-15 14:23",
      tags: ["North Korea", "Cryptocurrency", "APT38"],
      affected: "Global financial sector"
    },
    {
      source: "CISA Alert",
      type: "Vulnerability",
      title: "Critical RCE in popular web framework",
      severity: "Critical", 
      confidence: 98,
      timestamp: "2024-01-15 13:45",
      tags: ["RCE", "Web Application", "Framework"],
      affected: "Web applications worldwide"
    },
    {
      source: "Dark Web Intel",
      type: "Data Breach",
      title: "Healthcare data for sale on underground markets",
      severity: "High",
      confidence: 89,
      timestamp: "2024-01-15 12:17",
      tags: ["Healthcare", "PII", "Dark Web"],
      affected: "US Healthcare providers"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Threat Intelligence</h1>
          <p className="text-muted-foreground">Curated intelligence from 1M+ sources with AI-powered analysis</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search intelligence feeds, IOCs, threat actors..."
              className="pl-10 bg-input border-border"
            />
          </div>
          
          <div className="flex gap-2">
            <Select defaultValue="all-sources">
              <SelectTrigger className="w-48">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-sources">All Sources</SelectItem>
                <SelectItem value="government">Government Feeds</SelectItem>
                <SelectItem value="commercial">Commercial Intel</SelectItem>
                <SelectItem value="osint">OSINT Sources</SelectItem>
                <SelectItem value="dark-web">Dark Web</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-severity">
              <SelectTrigger className="w-36">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-severity">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Intelligence Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border cyber-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Intelligence Sources</p>
                <p className="text-3xl font-bold text-foreground">1,247,893</p>
                <div className="flex items-center space-x-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">+12,847 today</span>
                </div>
              </div>
              <Globe className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Confidence Alerts</p>
                <p className="text-3xl font-bold text-foreground">23</p>
                <div className="flex items-center space-x-1 mt-2">
                  <Clock className="w-4 h-4 text-warning" />
                  <span className="text-sm text-muted-foreground">Last hour</span>
                </div>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Analyst Reviews</p>
                <p className="text-3xl font-bold text-foreground">156</p>
                <div className="flex items-center space-x-1 mt-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Pending analysis</span>
                </div>
              </div>
              <Eye className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intelligence Feed */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-primary" />
              <span>Latest Intelligence Feed</span>
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Feed
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {intelligenceFeeds.map((feed, index) => {
            const severityColor = feed.severity === "Critical" ? "destructive" : 
                                feed.severity === "High" ? "default" : "secondary";
            
            return (
              <div key={index} className="p-4 rounded-lg border border-border hover:border-primary/30 transition-all duration-200 cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Badge variant={severityColor} className="text-xs">
                      {feed.severity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {feed.confidence}% confidence
                    </Badge>
                    <span className="text-xs text-muted-foreground">{feed.source}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{feed.timestamp}</span>
                  </div>
                </div>
                
                <h4 className="font-semibold text-foreground mb-2">{feed.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Type: {feed.type} | Affected: {feed.affected}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {feed.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};