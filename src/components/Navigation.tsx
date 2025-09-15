import { Shield, Activity, AlertTriangle, Users, BarChart3, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  const navItems = [
    { id: "dashboard", label: "Threat Dashboard", icon: Activity },
    { id: "intelligence", label: "Intelligence", icon: Search },
    { id: "vulnerabilities", label: "Vulnerabilities", icon: AlertTriangle },
    { id: "actors", label: "Threat Actors", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg cyber-glow">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">CyberIntel AI</h1>
              <p className="text-xs text-muted-foreground">Threat Intelligence Platform</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 transition-all duration-200 ${
                    isActive ? "cyber-glow" : "hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:block">{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Search and User */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search threats..."
                className="pl-10 pr-4 py-2 bg-input border-border focus:ring-primary w-64"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-cyber rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-foreground">SA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};