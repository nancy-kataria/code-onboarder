import { useEffect, useState } from "react";
import { Terminal, CheckCircle2, Loader2, Circle } from "lucide-react";

interface ProcessingLog {
  message: string;
  status: "pending" | "active" | "complete";
  type: "info" | "success" | "warning";
}

interface ProcessingStateProps {
  repoUrl: string;
  onComplete: () => void;
}

const processingSteps = [
  { message: "Authenticating with GitHub API...", delay: 800 },
  { message: "Cloning repository...", delay: 1500 },
  { message: "Analyzing project structure...", delay: 1200 },
  { message: "Detecting tech stack...", delay: 1000 },
  { message: "Splitting files into chunks...", delay: 1800 },
  { message: "Generating embeddings...", delay: 2000 },
  { message: "Vectorizing code patterns...", delay: 1500 },
  { message: "Building knowledge graph...", delay: 1200 },
  { message: "Indexing for retrieval...", delay: 800 },
  { message: "Intelligence ready!", delay: 500 },
];

const ProcessingState = ({ repoUrl, onComplete }: ProcessingStateProps) => {
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep >= processingSteps.length) {
      setTimeout(onComplete, 800);
      return;
    }

    // Add new log entry
    setLogs((prev) => [
      ...prev.map((log) => ({ ...log, status: "complete" as const })),
      { message: processingSteps[currentStep].message, status: "active" as const, type: "info" as const },
    ]);

    // Update progress
    setProgress(((currentStep + 1) / processingSteps.length) * 100);

    // Move to next step
    const timer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, processingSteps[currentStep].delay);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  const repoName = repoUrl.split("/").slice(-2).join("/").replace(".git", "");

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6 animate-pulse-glow">
            <Terminal className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            Processing Repository
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            {repoName}
          </p>
        </div>

        {/* Terminal Window */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-terminal-red/80" />
              <div className="w-3 h-3 rounded-full bg-terminal-yellow/80" />
              <div className="w-3 h-3 rounded-full bg-terminal-green/80" />
            </div>
            <span className="text-xs text-muted-foreground font-mono ml-2">
              codebase-intelligence — processing
            </span>
          </div>

          {/* Terminal Body */}
          <div className="p-4 h-80 overflow-y-auto scrollbar-thin font-mono text-sm">
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 terminal-log animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {log.status === "complete" ? (
                    <CheckCircle2 className="w-4 h-4 text-terminal-green flex-shrink-0" />
                  ) : log.status === "active" ? (
                    <Loader2 className="w-4 h-4 text-primary flex-shrink-0 animate-spin" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span
                    className={
                      log.status === "complete"
                        ? "terminal-log-success"
                        : log.status === "active"
                        ? "terminal-log-info"
                        : "text-muted-foreground"
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
              {currentStep < processingSteps.length && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-primary animate-typing">▊</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-4 py-3 bg-secondary/30 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tip */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          This typically takes 30-60 seconds depending on repository size
        </p>
      </div>
    </div>
  );
};

export default ProcessingState;
