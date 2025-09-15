import { useState } from "react";
import { ThreatDashboard } from "@/components/ThreatDashboard";
import { Navigation } from "@/components/Navigation";
import { ThreatIntelligence } from "@/components/ThreatIntelligence";
import { VulnerabilityManager } from "@/components/VulnerabilityManager";
import { ThreatActors } from "@/components/ThreatActors";
import { Analytics } from "@/components/Analytics";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <ThreatDashboard />;
      case "intelligence":
        return <ThreatIntelligence />;
      case "vulnerabilities":
        return <VulnerabilityManager />;
      case "actors":
        return <ThreatActors />;
      case "analytics":
        return <Analytics />;
      default:
        return <ThreatDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="pt-16">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;