import { useState } from "react";
import ConfigurationDashboard from "@/components/ConfigurationDashboard";
import ProcessingState from "@/components/ProcessingState";
import IntelligenceHub from "@/components/IntelligenceHub";

type AppState = "config" | "processing" | "ready";

const Index = () => {
  const [state, setState] = useState<AppState>("config");
  const [repoUrl, setRepoUrl] = useState("");
  const [token, setToken] = useState("");

  const handleConfigSubmit = (url: string, accessToken: string) => {
    setRepoUrl(url);
    setToken(accessToken);
    setState("processing");
  };

  const handleProcessingComplete = () => {
    setState("ready");
  };

  const handleReset = () => {
    setRepoUrl("");
    setToken("");
    setState("config");
  };

  return (
    <div className="min-h-screen bg-background">
      {state === "config" && (
        <ConfigurationDashboard onSubmit={handleConfigSubmit} />
      )}
      {state === "processing" && (
        <ProcessingState repoUrl={repoUrl} token={token} onComplete={handleProcessingComplete} />
      )}
      {state === "ready" && (
        <IntelligenceHub repoUrl={repoUrl} onReset={handleReset} />
      )}
    </div>
  );
};

export default Index;
