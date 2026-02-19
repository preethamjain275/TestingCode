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
import FailureChart from "@/components/FailureChart";
import ExplainablePanel from "@/components/ExplainablePanel";
import ResultsSummary from "@/components/ResultsSummary";
import PredictivePanel from "@/components/PredictivePanel";
import FixDetailPanel, { DetailedFix } from "@/components/FixDetailPanel";
import ScoreBreakdownPanel from "@/components/ScoreBreakdownPanel";
import HealingOutput from "@/components/HealingOutput";
import IterationTracker from "@/components/IterationTracker";
import { createSimulation, SimulationState, SAMPLE_DIFF, SIMULATION_FIXES, generateResultsJSON } from "@/lib/simulation";
import { createDynamicSimulation, AnalysisResult } from "@/lib/dynamicSimulation";
import { generatePDFReport } from "@/lib/generateReport";
import { createBranch, commitFile } from "@/lib/github-client";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, Play, ArrowLeft, FileJson, Loader2, Code2, GitBranch, FileCode, Bug } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Footer from "@/components/Footer";

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
  const [detailedFixes, setDetailedFixes] = useState<DetailedFix[]>([]);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);

  // Demo mode — hardcoded simulation
  const startDemo = useCallback(() => {
    if (cleanupRef.current) cleanupRef.current();
    setStartTime(Date.now());
    setEndTime(0);
    setRepoUrl(DEMO_REPO);
    setShowLanding(false);
    setAnalysisData(null);

    const fresh = initialState();
    fresh.isRunning = true;
    setState(fresh);

    cleanupRef.current = createSimulation((partial) => {
      setState(prev => {
        const newState = { ...prev, ...partial };
        if (newState.isComplete && !prev.isComplete) {
          setEndTime(Date.now());
        }
        return newState;
      });
    });
  }, []);

  // Real repo analysis
  const startLiveAnalysis = useCallback(async (url: string, teamName: string, leaderName: string, token?: string) => {
    if (cleanupRef.current) cleanupRef.current();
    setStartTime(Date.now());
    setEndTime(0);
    setRepoUrl(url);
    setShowLanding(false);
    setIsAnalyzing(true);

    const branch = `${teamName.toUpperCase().replace(/\s+/g, '_')}_${leaderName.toUpperCase().replace(/\s+/g, '_')}_AI_Fix`;

    // Initialize GitHub integration
    let gitConfig;
    if (token) {
      try {
        const parts = url.replace("https://github.com/", "").split("/");
        const owner = parts[0];
        const repo = parts[1];
        gitConfig = { owner, repo, token, branch };

        toast.info("Connecting to GitHub...");
        // Attempt to create branch
        try {
          await createBranch(gitConfig);
          toast.success(`Created branch: ${branch}`);
        } catch (e: any) {
          if (e.status === 422) {
            toast.info(`Branch ${branch} already exists, using it.`);
          } else if (e.status === 403 || e.status === 404) {
            toast.error("Access Denied: You cannot create branches on this repo. Please fork it first!");
          } else {
            console.error(e);
            toast.error(`GitHub Error: ${e.message}`);
          }
        }
      } catch (e) {
        console.error("Invalid Repo URL for Git operations");
      }
    }

    try {
      let analysis: AnalysisResult;

      try {
        const { data, error } = await supabase.functions.invoke("analyze-repo", {
          body: { repoUrl: url, teamName, leaderName },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        analysis = data;
      } catch (e) {
        console.warn("Backend unavailable, using client-side simulation", e);
        const { generateMockAnalysis } = await import("@/lib/dynamicSimulation");
        analysis = generateMockAnalysis(url);
        if (!url.includes("demo-project")) {
          toast.info("Backend unavailable: Running simulation mode");
        }
      }
      setAnalysisData(analysis);

      // Commit Analysis Report if token present
      if (gitConfig) {
        try {
          let reportContent = `# HealOps AI Analysis Report\n\n`;
          reportContent += `**Team:** ${teamName}\n**Leader:** ${leaderName}\n**Date:** ${new Date().toISOString()}\n\n`;
          reportContent += `## Summary\n- **Issues Found:** ${analysis.fixes.length}\n\n`;

          analysis.fixes.forEach(f => {
            reportContent += `### ${f.file} (Line ${f.line})\n- **Issue:** ${f.description}\n- **Fix:** \`${f.fixSuggestion}\`\n\n`;
          });

          await commitFile(
            gitConfig,
            "HEALOPS_ANALYSIS_REPORT.md",
            reportContent,
            "[AI AGENT] Added Analysis Report"
          );
          toast.success("Pushed Analysis Report to GitHub!");
        } catch (e) {
          console.error(e);
          toast.error("Failed to push report to GitHub.");
        }
      }

      // Build detailed fixes for the interactive panel
      const validBugTypes = ["LINTING", "SYNTAX", "TYPE_ERROR", "LOGIC", "IMPORT", "INDENTATION"];
      setDetailedFixes(analysis.fixes.map(f => ({
        file: f.file,
        bugType: (validBugTypes.includes(f.bugType) ? f.bugType : "LOGIC") as DetailedFix["bugType"],
        line: f.line,
        description: f.description,
        fixSuggestion: f.fixSuggestion,
        commitMessage: f.commitMessage,
        status: "pending" as const,
        selected: true,
      })));

      // Start dynamic simulation with real data
      const fresh = initialState();
      fresh.isRunning = true;
      fresh.branch = branch;
      fresh.initialFailures = analysis.fixes.length;
      fresh.fixes = analysis.fixes.map(f => ({
        file: f.file,
        bugType: (validBugTypes.includes(f.bugType) ? f.bugType : "LOGIC") as any,
        line: f.line,
        commitMessage: f.commitMessage,
        status: "pending" as const,
      }));
      setState(fresh);

      cleanupRef.current = createDynamicSimulation(analysis, (partial) => {
        setState(prev => {
          const newState = { ...prev, ...partial };
          if (newState.isComplete && !prev.isComplete) {
            setEndTime(Date.now());
          }
          // Sync fix statuses to detailed panel
          if (partial.fixes) {
            setDetailedFixes(prevFixes => prevFixes.map((df, i) => ({
              ...df,
              status: partial.fixes![i]?.status || df.status,
            })));
          }
          return newState;
        });
      });

      toast.success("Repository analyzed! Running healing simulation...");
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze repository");
      const fresh = initialState();
      setState(fresh);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleSubmit = useCallback((url: string, teamName: string, leaderName: string, token?: string) => {
    startLiveAnalysis(url, teamName, leaderName, token);
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

  const handleToggleFixSelect = (index: number) => {
    setDetailedFixes(prev => prev.map((f, i) => i === index ? { ...f, selected: !f.selected } : f));
  };
  const handleSelectAllFixes = () => setDetailedFixes(prev => prev.map(f => ({ ...f, selected: true })));
  const handleDeselectAllFixes = () => setDetailedFixes(prev => prev.map(f => ({ ...f, selected: false })));
  const handleExportSelectedFixes = () => {
    const selected = detailedFixes.filter(f => f.selected);
    if (selected.length === 0) { toast.error("No fixes selected"); return; }

    const content = selected.map((fix, i) => (
      `${"=".repeat(60)}\nFix ${i + 1}: ${fix.file} (Line ${fix.line})\nType: ${fix.bugType}\n${"=".repeat(60)}\n\n` +
      `ISSUE:\n${fix.description}\n\nSUGGESTED FIX:\n${fix.fixSuggestion}\n\nCOMMIT MESSAGE:\n${fix.commitMessage}\n`
    )).join("\n\n");

    const header = `HealOps Fix Report\nRepository: ${repoUrl}\nBranch: ${state.branch}\nSelected: ${selected.length}/${detailedFixes.length} fixes\nGenerated: ${new Date().toISOString()}\n\n`;

    const blob = new Blob([header + content], { type: "text/plain" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `healops-fixes-${state.branch}.txt`;
    a.click();
    URL.revokeObjectURL(blobUrl);
    toast.success(`Exported ${selected.length} fixes`);
  };

  const handleBackToLanding = () => {
    if (cleanupRef.current) cleanupRef.current();
    setState(initialState);
    setShowLanding(true);
    setAnalysisData(null);
    setDetailedFixes([]);
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
                      {/* Code diff removed — fixes shown in detail panel below */}
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

                  {/* Interactive Fix Detail Panel */}
                  {detailedFixes.length > 0 ? (
                    <FixDetailPanel
                      fixes={detailedFixes}
                      onToggleSelect={handleToggleFixSelect}
                      onSelectAll={handleSelectAllFixes}
                      onDeselectAll={handleDeselectAllFixes}
                      onExportSelected={handleExportSelectedFixes}
                    />
                  ) : (
                    <FixDetailPanel
                      fixes={state.fixes.map(f => ({
                        ...f,
                        description: f.commitMessage,
                        fixSuggestion: "Run demo with a real repository to see actual fix suggestions",
                        selected: true,
                      }))}
                      onToggleSelect={handleToggleFixSelect}
                      onSelectAll={handleSelectAllFixes}
                      onDeselectAll={handleDeselectAllFixes}
                      onExportSelected={handleExportSelectedFixes}
                    />
                  )}

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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ResultsSummary
                              repoName={repoUrl.replace("https://github.com/", "")}
                              branch={state.branch}
                              iterations={state.currentIteration}
                              fixesApplied={state.fixes.filter(f => f.status === "fixed").length}
                              totalTime={`${(((endTime || Date.now()) - startTime) / 1000).toFixed(1)}s`}
                              status={state.finalStatus === "PASSED" ? "success" : "failed"}
                            />
                            <ScoreBreakdownPanel
                              baseScore={100}
                              speedBonus={((endTime || Date.now()) - startTime) / 1000 < 300 ? 10 : 0}
                              efficiencyPenalty={Math.max(0, (state.fixes.filter(f => f.status === "fixed").length - 20) * 2)}
                              finalScore={100 + (((endTime || Date.now()) - startTime) / 1000 < 300 ? 10 : 0) - Math.max(0, (state.fixes.filter(f => f.status === "fixed").length - 20) * 2)}
                            />
                          </div>
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
            <Footer />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
