import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import RepoInput from "@/components/RepoInput";
import AgentNetwork, { AGENTS } from "@/components/AgentNetwork";
import PipelineTimeline, { DEFAULT_STEPS } from "@/components/PipelineTimeline";
import LogStream from "@/components/LogStream";
import HealthScore from "@/components/HealthScore";
import ConfidenceMeter from "@/components/ConfidenceMeter";
import CodeDiff from "@/components/CodeDiff";
import FailureChart from "@/components/FailureChart";
import ExplainablePanel from "@/components/ExplainablePanel";
import ResultsSummary from "@/components/ResultsSummary";
import PredictivePanel from "@/components/PredictivePanel";
import { createSimulation, SimulationState, SAMPLE_DIFF } from "@/lib/simulation";
import { Download, FileText } from "lucide-react";

const Index = () => {
  const [state, setState] = useState<SimulationState>({
    agents: AGENTS.map(a => ({ ...a })),
    steps: DEFAULT_STEPS.map(s => ({ ...s })),
    logs: [],
    isRunning: false,
    isComplete: false,
    healthBefore: 61,
    healthAfter: 61,
    confidence: 0,
  });

  const cleanupRef = useRef<(() => void) | null>(null);

  const handleSubmit = useCallback((url: string) => {
    if (cleanupRef.current) cleanupRef.current();

    setState({
      agents: AGENTS.map(a => ({ ...a })),
      steps: DEFAULT_STEPS.map(s => ({ ...s })),
      logs: [],
      isRunning: true,
      isComplete: false,
      healthBefore: 61,
      healthAfter: 61,
      confidence: 0,
    });

    cleanupRef.current = createSimulation((partial) => {
      setState(prev => ({ ...prev, ...partial }));
    });
  }, []);

  const showDashboard = state.isRunning || state.isComplete;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        <RepoInput onSubmit={handleSubmit} isLoading={state.isRunning} />

        <AnimatePresence>
          {showDashboard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Pipeline Timeline */}
              <PipelineTimeline steps={state.steps} />

              {/* Main grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="space-y-6">
                  <AgentNetwork agents={state.agents} />
                  <FailureChart />
                </div>

                {/* Center column */}
                <div className="space-y-6">
                  <LogStream logs={state.logs} />
                  <CodeDiff fileName="src/components/Dashboard.tsx" lines={SAMPLE_DIFF} />
                </div>

                {/* Right column */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <HealthScore label="Pre-Fix" score={state.healthBefore} color="red" />
                    <HealthScore label="Post-Fix" score={state.healthAfter} color={state.healthAfter > 80 ? "green" : "amber"} />
                  </div>
                  <ConfidenceMeter
                    confidence={state.confidence}
                    risk={state.confidence > 80 ? "low" : "medium"}
                    impact={state.confidence > 80 ? 8 : 5}
                  />
                  <ExplainablePanel
                    rootCause="Import path 'react-query' is outdated. Package was renamed to '@tanstack/react-query' in v4+. The useQuery API also changed from positional arguments to an object config."
                    fixReason="Minimal path update preserves all existing logic. Object syntax for useQuery matches the installed v5 API. Type annotation replaces 'any' with project-defined interface."
                    alternatives={[
                      "Downgrade to react-query@3 (rejected: breaks other deps)",
                      "Wrap in compatibility shim (rejected: adds unnecessary code)",
                      "Full refactor to SWR (rejected: scope too large for auto-fix)",
                    ]}
                  />
                </div>
              </div>

              {/* Bottom panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PredictivePanel />
                <AnimatePresence>
                  {state.isComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <ResultsSummary
                        repoName="owner/repository"
                        branch="HEALOPS_ADMIN_AI_Fix"
                        iterations={1}
                        fixesApplied={3}
                        totalTime="33.0s"
                        status="success"
                      />
                      <button className="w-full py-3 px-4 glass rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                        <Download className="w-4 h-4 text-primary" />
                        <span>Export AI Healing Report</span>
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero section when idle */}
        {!showDashboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 glow-cyan">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </motion.div>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
              Autonomous CI/CD Healing
            </h2>
            <p className="text-muted-foreground max-w-lg text-sm leading-relaxed">
              Paste a GitHub repository URL above to start the multi-agent healing pipeline.
              HealOps will analyze, diagnose, patch, and push fixes autonomously.
            </p>
            <div className="flex gap-3 mt-8">
              {["Multi-Agent AI", "Explainable Fixes", "Auto PR Creation", "Self-Learning"].map((tag) => (
                <span key={tag} className="text-[10px] font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Index;
