import { Users, MapPin, Target, Activity, Search, Filter, ExternalLink, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ThreatActors = () => {
  const threatActors = [
    {
      name: "Lazarus Group",
      aliases: ["APT38", "Hidden Cobra", "Zinc"],
      attribution: "North Korea",
      sophistication: "Advanced",
      primaryTargets: ["Financial Services", "Cryptocurrency", "Defense"],
      activeCampaigns: 5,
      lastActivity: "2024-01-14",
      techniques: ["Spear Phishing", "Supply Chain", "Living off the Land"],
      threat_level: "Critical",
      confidence: 95
    },
    {
      name: "APT29",
      aliases: ["Cozy Bear", "The Dukes", "Nobelium"],
      attribution: "Russia (SVR)",
      sophistication: "Advanced",
      primaryTargets: ["Government", "Technology", "Healthcare"],
      activeCampaigns: 8,
      lastActivity: "2024-01-15",
      techniques: ["Cloud Exploitation", "SolarWinds-style Attacks", "OAuth Abuse"],
      threat_level: "Critical",
      confidence: 98
    },
    {
      name: "APT40",
      aliases: ["Leviathan", "Kryptonite Panda", "Gadolinium"],
      attribution: "China (MSS)",
      sophistication: "Advanced",
      primaryTargets: ["Maritime", "Government", "Research"],
      activeCampaigns: 3,
      lastActivity: "2024-01-12",
      techniques: ["Web Shell Deployment", "Credential Harvesting", "Lateral Movement"],
      threat_level: "High",
      confidence: 89
    }
  ];

  const actorStats = [
    {
      title: "Tracked Actors",
      value: "847",
      change: "+12",
      icon: Users,
      color: "primary"
    },
    {
      title: "Active Campaigns",
      value: "156",
      change: "+23", 
      icon: Target,
      color: "destructive"
    },
    {
      title: "Recent Activity",
      value: "34",
      change: "+8",
      icon: Activity,
      color: "default"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Threat Actor Intelligence</h1>
          <p className="text-muted-foreground">Advanced persistent threat groups and cybercriminal organizations</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search threat actors, campaigns, TTPs..."
              className="pl-10 bg-input border-border"
            />
          </div>
          
          <div className="flex gap-2">
            <Select defaultValue="all-attribution">
              <SelectTrigger className="w-48">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-attribution">All Countries</SelectItem>
                <SelectItem value="china">China</SelectItem>
                <SelectItem value="russia">Russia</SelectItem>
                <SelectItem value="north-korea">North Korea</SelectItem>
                <SelectItem value="iran">Iran</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-threat">
              <SelectTrigger className="w-36">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-threat">All Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actorStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={`bg-card border-border ${stat.color === "destructive" ? "threat-glow" : ""}`}>
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
                  <div className={`p-3 rounded-lg ${stat.color === "destructive" ? "bg-destructive/10" : "bg-primary/10"}`}>
                    <Icon className={`w-6 h-6 ${stat.color === "destructive" ? "text-destructive" : "text-primary"}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Threat Actors List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <span>Active Threat Actors</span>
            </CardTitle>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              MITRE ATT&CK
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {threatActors.map((actor, index) => {
            const threatColor = actor.threat_level === "Critical" ? "destructive" : "default";
            
            return (
              <div key={index} className={`p-6 rounded-lg border border-border hover:border-primary/30 transition-all duration-200 cursor-pointer ${actor.threat_level === "Critical" ? "bg-destructive/5 threat-glow" : ""}`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{actor.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {actor.aliases.map((alias, aliasIndex) => (
                          <Badge key={aliasIndex} variant="outline" className="text-xs">
                            {alias}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant={threatColor} className="mb-2">
                      {actor.threat_level}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {actor.confidence}% confidence
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Attribution & Activity
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Country:</span>
                          <span className="text-foreground font-medium">{actor.attribution}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sophistication:</span>
                          <span className="text-foreground">{actor.sophistication}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active Campaigns:</span>
                          <span className="text-foreground font-bold">{actor.activeCampaigns}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Activity:</span>
                          <span className="text-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {actor.lastActivity}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Primary Targets
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {actor.primaryTargets.map((target, targetIndex) => (
                          <Badge key={targetIndex} variant="secondary" className="text-xs">
                            {target}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Techniques & Tactics
                    </h4>
                    <div className="space-y-2">
                      {actor.techniques.map((technique, techIndex) => (
                        <div key={techIndex} className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/50">
                          <span className="text-sm text-foreground">{technique}</span>
                          <Badge variant="outline" className="text-xs">
                            T{1000 + techIndex + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};