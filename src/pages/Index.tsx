import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import HeroLanding from "@/components/HeroLanding";
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
import FixesTable from "@/components/FixesTable";
import HealingOutput from "@/components/HealingOutput";
import IterationTracker from "@/components/IterationTracker";
import { createSimulation, SimulationState, SAMPLE_DIFF, SIMULATION_FIXES, generateResultsJSON } from "@/lib/simulation";
import { createDynamicSimulation, AnalysisResult } from "@/lib/dynamicSimulation";
import { generatePDFReport } from "@/lib/generateReport";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, Play, ArrowLeft, FileJson, Loader2, Code2, GitBranch, FileCode, Bug } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const DEMO_REPO = "https://github.com/healops/demo-project";
const MAX_ITERATIONS = 3;

const initialState = (): SimulationState => ({
  agents: AGENTS.map(a => ({ ...a })),
  steps: DEFAULT_STEPS.map(s => ({ ...s })),
  logs: [],
  fixes: SIMULATION_FIXES.map(f => ({ ...f })),
  isRunning: false,
  isComplete: false,
  healthBefore: 61,
  healthAfter: 61,
  confidence: 0,
  currentIteration: 0,
  maxIterations: MAX_ITERATIONS,
  initialFailures: 6,
  finalStatus: "",
  branch: "HEALOPS_ADMIN_AI_Fix",
});

const Index = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [repoUrl, setRepoUrl] = useState("");
  const [state, setState] = useState<SimulationState>(initialState);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Demo mode — hardcoded simulation
  const startDemo = useCallback(() => {
    if (cleanupRef.current) cleanupRef.current();
    setRepoUrl(DEMO_REPO);
    setShowLanding(false);
    setAnalysisData(null);

    const fresh = initialState();
    fresh.isRunning = true;
    setState(fresh);

    cleanupRef.current = createSimulation((partial) => {
      setState(prev => ({ ...prev, ...partial }));
    });
  }, []);

  // Real repo analysis
  const startLiveAnalysis = useCallback(async (url: string, teamName: string, leaderName: string) => {
    if (cleanupRef.current) cleanupRef.current();
    setRepoUrl(url);
    setShowLanding(false);
    setIsAnalyzing(true);

    const branch = `${teamName}_${leaderName}_AI_Fix`;

    try {
      let data: any;
      try {
        const response = await supabase.functions.invoke("analyze-repo", {
          body: { repoUrl: url, teamName, leaderName },
        });
        if (response.error) {
          // Try to get the actual error message from the response
          const errBody = response.error;
          let msg = "Analysis failed";
          if (errBody instanceof Response || (errBody as any)?.context?.body) {
            try {
              const body = errBody instanceof Response ? await errBody.json() : await (errBody as any).context.json();
              msg = body?.error || body?.message || JSON.stringify(body);
            } catch { /* ignore parse errors */ }
          } else if (typeof errBody === "object" && errBody !== null) {
            msg = (errBody as any).message || JSON.stringify(errBody);
          } else {
            msg = String(errBody);
          }
          throw new Error(msg);
        }
        data = response.data;
      } catch (invokeErr: any) {
        // supabase-js v2 throws FunctionsHttpError for non-2xx
        if (invokeErr?.context) {
          try {
            const body = await invokeErr.context.json();
            throw new Error(body?.error || body?.message || "Analysis failed");
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== "Analysis failed") throw parseErr;
          }
        }
        throw invokeErr;
      }
      if (data?.error) throw new Error(data.error);

      const analysis: AnalysisResult = data;
      setAnalysisData(analysis);

      // Start dynamic simulation with real data
      const fresh = initialState();
      fresh.isRunning = true;
      fresh.branch = branch;
      fresh.initialFailures = analysis.fixes.length;
      fresh.fixes = analysis.fixes.map(f => ({
        file: f.file,
        bugType: (["LINTING","SYNTAX","TYPE_ERROR","LOGIC","IMPORT","INDENTATION"].includes(f.bugType) ? f.bugType : "LOGIC") as any,
        line: f.line,
        commitMessage: f.commitMessage,
        status: "pending" as const,
      }));
      setState(fresh);

      cleanupRef.current = createDynamicSimulation(analysis, (partial) => {
        setState(prev => ({ ...prev, ...partial }));
      });

      toast.success("Repository analyzed! Running healing simulation...");
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze repository");
      // Fall back to showing the input
      const fresh = initialState();
      setState(fresh);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleSubmit = useCallback((url: string, teamName: string, leaderName: string) => {
    startLiveAnalysis(url, teamName, leaderName);
  }, [startLiveAnalysis]);

  const handleDemo = useCallback(() => startDemo(), [startDemo]);

  const handleExportPDF = () => generatePDFReport(state, repoUrl, analysisData?.rootCause);

  const handleExportJSON = () => {
    const json = generateResultsJSON(state, repoUrl);
    const blob = new Blob([json], { type: "application/json" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "results.json";
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  const handleBackToLanding = () => {
    if (cleanupRef.current) cleanupRef.current();
    setState(initialState);
    setShowLanding(true);
    setAnalysisData(null);
  };

  const showDashboard = state.isRunning || state.isComplete;

  // Failure chart data from actual fixes
  const failureData = (() => {
    const cats: Record<string, number> = {};
    const colors: Record<string, string> = {
      IMPORT: "hsl(173, 80%, 50%)",
      TYPE_ERROR: "hsl(38, 92%, 50%)",
      SYNTAX: "hsl(0, 72%, 55%)",
      LOGIC: "hsl(262, 80%, 60%)",
      INDENTATION: "hsl(200, 70%, 50%)",
      LINTING: "hsl(142, 71%, 45%)",
    };
    state.fixes.forEach(f => { cats[f.bugType] = (cats[f.bugType] || 0) + 1; });
    return Object.entries(cats).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || "hsl(0, 0%, 50%)",
    }));
  })();

  const explainableProps = analysisData
    ? {
        rootCause: analysisData.rootCause,
        fixReason: analysisData.fixReason,
        alternatives: analysisData.alternatives,
      }
    : {
        rootCause: "Import path 'react-query' is outdated. Package was renamed to '@tanstack/react-query' in v4+. The useQuery API also changed from positional arguments to an object config.",
        fixReason: "Minimal path update preserves all existing logic. Object syntax for useQuery matches the installed v5 API. Type annotation replaces 'any' with project-defined interface.",
        alternatives: [
          "Downgrade to react-query@3 (rejected: breaks other deps)",
          "Wrap in compatibility shim (rejected: adds unnecessary code)",
          "Full refactor to SWR (rejected: scope too large for auto-fix)",
        ],
      };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AnimatePresence mode="wait">
        {showLanding && !showDashboard ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <HeroLanding onGetStarted={() => setShowLanding(false)} onDemo={handleDemo} />
          </motion.div>
        ) : (
          <motion.main
            key="dashboard"
            initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[1600px] mx-auto px-6 py-6 space-y-6"
          >
            {/* Back + Demo buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToLanding}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Home
              </button>
              {!state.isRunning && !isAnalyzing && (
                <button
                  onClick={handleDemo}
                  className="px-4 py-2 bg-accent text-accent-foreground text-xs font-semibold rounded-lg hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  Run Demo
                </button>
              )}
            </div>

            <RepoInput onSubmit={handleSubmit} isLoading={state.isRunning || isAnalyzing} />

            {/* Analyzing state */}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Analyzing Repository...</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Fetching repo contents and running AI-powered analysis to detect issues, classify failures, and generate fixes.
                </p>
              </motion.div>
            )}

            {/* Repo Info Panel */}
            {analysisData && showDashboard && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-4 flex flex-wrap items-center gap-4"
              >
                <div className="flex items-center gap-2 text-sm text-foreground font-mono">
                  <GitBranch className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Repo:</span>
                  <span className="font-semibold">{repoUrl.replace("https://github.com/", "")}</span>
                </div>
                {analysisData.detectedFramework && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5">
                    <Code2 className="w-3 h-3" />
                    {analysisData.detectedFramework}
                  </Badge>
                )}
                {analysisData.fileCount && (
                  <Badge variant="secondary" className="gap-1.5">
                    <FileCode className="w-3 h-3" />
                    {analysisData.fileCount} files scanned
                  </Badge>
                )}
                <Badge variant="secondary" className="gap-1.5">
                  <Bug className="w-3 h-3" />
                  {analysisData.fixes.length} issues found
                </Badge>
                <div className="text-xs font-mono text-muted-foreground ml-auto">
                  Branch: <span className="text-accent">{state.branch}</span>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {showDashboard && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Pipeline Timeline */}
                  <PipelineTimeline steps={state.steps} />

                  {/* Iteration Tracker */}
                  <IterationTracker
                    currentIteration={state.currentIteration}
                    maxIterations={state.maxIterations}
                    failuresPerIteration={[state.initialFailures]}
                    isRunning={state.isRunning}
                  />

                  {/* Main grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column */}
                    <div className="space-y-6">
                      <AgentNetwork agents={state.agents} />
                      <FailureChart data={failureData} />
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
                      <ExplainablePanel {...explainableProps} />
                    </div>
                  </div>

                  {/* Fixes Table — full width */}
                  <FixesTable fixes={state.fixes} />

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
                          <HealingOutput
                            repoUrl={repoUrl}
                            branch={state.branch}
                            initialFailures={state.initialFailures}
                            fixesApplied={state.fixes.filter(f => f.status === "fixed").length}
                            finalStatus={state.finalStatus as "PASSED" | "FAILED"}
                            iterations={state.currentIteration}
                          />
                          <ResultsSummary
                            repoName={repoUrl.replace("https://github.com/", "")}
                            branch={state.branch}
                            iterations={state.currentIteration}
                            fixesApplied={state.fixes.filter(f => f.status === "fixed").length}
                            totalTime="32.5s"
                            status="success"
                          />
                          <div className="grid grid-cols-3 gap-3">
                            <button
                              onClick={handleExportPDF}
                              className="py-3 px-4 glass rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                            >
                              <Download className="w-4 h-4 text-primary" />
                              <span>PDF Report</span>
                            </button>
                            <button
                              onClick={handleExportJSON}
                              className="py-3 px-4 glass rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                            >
                              <FileJson className="w-4 h-4 text-accent" />
                              <span>results.json</span>
                            </button>
                            <button
                              onClick={handleDemo}
                              className="py-3 px-4 bg-accent/10 border border-accent/20 rounded-lg text-sm font-medium text-accent hover:bg-accent/20 transition-colors flex items-center justify-center gap-2"
                            >
                              <Play className="w-4 h-4" />
                              <span>Run Again</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Idle state */}
            {!showDashboard && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 glow-cyan animate-float">
                  <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
                  Ready to Heal
                </h2>
                <p className="text-muted-foreground max-w-lg text-sm leading-relaxed mb-6">
                  Enter a GitHub repository URL above with your team details, or run the live demo to see the autonomous healing pipeline in action.
                </p>
                <button
                  onClick={handleDemo}
                  className="px-6 py-3 bg-accent text-accent-foreground font-bold rounded-xl hover:brightness-110 transition-all glow-green flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Run Live Demo
                </button>
                <div className="flex flex-wrap gap-3 mt-8 justify-center">
                  {["Multi-Agent AI", "6 Bug Categories", "Auto Branch & PR", "Self-Learning", "results.json", "LLM Analysis"].map((tag) => (
                    <span key={tag} className="text-[10px] font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
