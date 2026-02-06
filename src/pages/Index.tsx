import { useState } from "react";
import ConfigurationDashboard from "@/components/ConfigurationDashboard";
import ProcessingState from "@/components/ProcessingState";
import IntelligenceHub from "@/components/IntelligenceHub";

type AppState = "config" | "processing" | "ready";

const Index = () => {
  const [state, setState] = useState<AppState>("config");
  const [repoUrl, setRepoUrl] = useState("");

  const handleConfigSubmit = (url: string, _token: string) => {
    setRepoUrl(url);
    setState("processing");
  };

  const handleProcessingComplete = () => {
    setState("ready");
  };

  const handleReset = () => {
    setRepoUrl("");
    setState("config");
  };

  return (
    <div className="min-h-screen bg-background">
      {state === "config" && (
        <ConfigurationDashboard onSubmit={handleConfigSubmit} />
      )}
      {state === "processing" && (
        <ProcessingState repoUrl={repoUrl} onComplete={handleProcessingComplete} />
      )}
      {state === "ready" && (
        <IntelligenceHub repoUrl={repoUrl} onReset={handleReset} />
      )}
    </div>
  );
};

export default Index;
