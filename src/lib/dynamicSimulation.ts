import { AGENTS } from "@/components/AgentNetwork";
import { DEFAULT_STEPS } from "@/components/PipelineTimeline";
import { LogEntry } from "@/components/LogStream";
import { FixEntry } from "@/components/FixesTable";
import { SimulationState } from "@/lib/simulation";

export interface AnalysisResult {
  detectedFramework: string;
  fixes: {
    file: string;
    bugType: string;
    line: number;
    description: string;
    fixSuggestion: string;
    commitMessage: string;
  }[];
  rootCause: string;
  fixReason: string;
  alternatives: string[];
  confidence: number;
  branch: string;
  fileCount: number;
}

export function createDynamicSimulation(
  analysis: AnalysisResult,
  onUpdate: (state: Partial<SimulationState>) => void
) {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const agents = AGENTS.map((a) => ({ ...a }));
  const steps = DEFAULT_STEPS.map((s) => ({ ...s }));
  const logs: LogEntry[] = [];
  const fixCount = analysis.fixes.length;

  const validBugTypes = ["LINTING", "SYNTAX", "TYPE_ERROR", "LOGIC", "IMPORT", "INDENTATION"] as const;
  type BugType = typeof validBugTypes[number];

  const fixes: FixEntry[] = analysis.fixes.map((f) => ({
    file: f.file,
    bugType: (validBugTypes.includes(f.bugType as BugType) ? f.bugType : "LOGIC") as BugType,
    line: f.line,
    commitMessage: f.commitMessage,
    status: "pending" as const,
  }));

  // Build dynamic log sequence
  const logSequence: LogEntry[] = [
    { timestamp: "00:00.0", level: "info", agent: "SYSTEM", message: "Initializing HealOps autonomous healing pipeline..." },
    { timestamp: "00:01.2", level: "info", agent: "REPO", message: "Cloning repository from GitHub..." },
    { timestamp: "00:03.5", level: "success", agent: "REPO", message: `Repository cloned successfully. ${analysis.fileCount} files detected.` },
    { timestamp: "00:04.1", level: "info", agent: "REPO", message: `Detected: ${analysis.detectedFramework}` },
    { timestamp: "00:06.2", level: "info", agent: "TEST", message: "Scanning for test frameworks..." },
    { timestamp: "00:07.0", level: "info", agent: "TEST", message: `Found: ${analysis.detectedFramework}` },
    { timestamp: "00:08.5", level: "info", agent: "TEST", message: "Executing tests in Docker sandbox..." },
    { timestamp: "00:12.3", level: "error", agent: "TEST", message: `Test run failed: ${fixCount} issues detected` },
    { timestamp: "00:13.0", level: "warn", agent: "DIAG", message: `Classifying ${fixCount} failures into categories...` },
  ];

  // Add per-issue classification logs
  analysis.fixes.forEach((fix, i) => {
    const ts = `00:${(13.5 + i * 0.3).toFixed(1)}`;
    logSequence.push({
      timestamp: ts,
      level: "error",
      agent: "DIAG",
      message: `${fix.bugType} error in ${fix.file}:${fix.line}`,
    });
  });

  // RCA + Fix logs
  logSequence.push(
    { timestamp: "00:16.0", level: "info", agent: "RCA", message: "── Iteration 1 / 3 ──" },
    { timestamp: "00:16.5", level: "info", agent: "RCA", message: "Analyzing root causes with LLM reasoning..." },
    { timestamp: "00:18.5", level: "info", agent: "RCA", message: `Root cause: ${analysis.rootCause.slice(0, 100)}...` },
    { timestamp: "00:19.0", level: "info", agent: "PATCH", message: `Generating targeted fixes for ${fixCount} issues...` }
  );

  analysis.fixes.forEach((fix, i) => {
    const ts = `00:${(20 + i * 0.5).toFixed(1)}`;
    logSequence.push({
      timestamp: ts,
      level: "success",
      agent: "PATCH",
      message: `Fix ${i + 1}/${fixCount}: ${fix.bugType} — ${fix.file.split("/").pop()}:${fix.line} → ${fix.fixSuggestion.slice(0, 60)}`,
    });
  });

  const confScore = analysis.confidence;
  logSequence.push(
    { timestamp: "00:23.5", level: "info", agent: "CONF", message: `Scoring patches... Confidence: ${confScore}%, Risk: ${confScore > 80 ? "LOW" : "MEDIUM"}` },
    { timestamp: "00:24.0", level: "info", agent: "VALID", message: "Re-running tests with patches applied..." },
    { timestamp: "00:28.3", level: "success", agent: "VALID", message: "All tests passing! Build successful." },
    { timestamp: "00:29.0", level: "info", agent: "GITOPS", message: `Creating branch: ${analysis.branch}` },
    { timestamp: "00:30.0", level: "info", agent: "GITOPS", message: `Committing ${fixCount} changes with prefix [AI-AGENT]...` },
    { timestamp: "00:31.0", level: "success", agent: "GITOPS", message: "Pushed to remote. Pull request created." },
    { timestamp: "00:31.5", level: "info", agent: "LEARN", message: `Storing ${fixCount} new error patterns in memory bank` },
    { timestamp: "00:32.0", level: "info", agent: "PIPE", message: `Pipeline health improved: 61 → ${confScore}` },
    { timestamp: "00:32.5", level: "success", agent: "SYSTEM", message: "✓ Healing cycle complete. Final Status: PASSED" }
  );

  // Schedule logs
  logSequence.forEach((log, i) => {
    const t = setTimeout(() => {
      logs.push(log);
      onUpdate({ logs: [...logs] });
    }, i * 600);
    timeouts.push(t);
  });

  // Same agent/timeline/fix schedules as default but adapted
  const agentSchedule = [
    { time: 0, agentId: "repo", status: "active" as const },
    { time: 2000, agentId: "repo", status: "done" as const },
    { time: 2000, agentId: "test", status: "active" as const },
    { time: 4000, agentId: "test", status: "done" as const },
    { time: 4000, agentId: "diagnosis", status: "active" as const },
    { time: 6000, agentId: "diagnosis", status: "done" as const },
    { time: 6000, agentId: "rca", status: "active" as const },
    { time: 8000, agentId: "rca", status: "done" as const },
    { time: 8000, agentId: "patch", status: "active" as const },
    { time: 10000, agentId: "patch", status: "done" as const },
    { time: 10000, agentId: "confidence", status: "active" as const },
    { time: 11000, agentId: "confidence", status: "done" as const },
    { time: 11000, agentId: "validation", status: "active" as const },
    { time: 13000, agentId: "validation", status: "done" as const },
    { time: 13000, agentId: "gitops", status: "active" as const },
    { time: 15000, agentId: "gitops", status: "done" as const },
    { time: 15000, agentId: "learning", status: "active" as const },
    { time: 16000, agentId: "learning", status: "done" as const },
    { time: 16000, agentId: "pipeline", status: "active" as const },
    { time: 17000, agentId: "pipeline", status: "done" as const },
  ];

  agentSchedule.forEach(({ time, agentId, status }) => {
    const t = setTimeout(() => {
      const agent = agents.find((a) => a.id === agentId);
      if (agent) agent.status = status;
      onUpdate({ agents: agents.map((a) => ({ ...a })) });
    }, time);
    timeouts.push(t);
  });

  const timelineSchedule = [
    { time: 500, stepId: "clone", status: "active" as const },
    { time: 2000, stepId: "clone", status: "done" as const },
    { time: 2500, stepId: "test", status: "active" as const },
    { time: 4000, stepId: "test", status: "done" as const },
    { time: 4500, stepId: "fail", status: "active" as const },
    { time: 6000, stepId: "fail", status: "error" as const },
    { time: 8500, stepId: "fix", status: "active" as const },
    { time: 11000, stepId: "fix", status: "done" as const },
    { time: 13500, stepId: "commit", status: "active" as const },
    { time: 15000, stepId: "commit", status: "done" as const },
    { time: 15500, stepId: "pass", status: "active" as const },
    { time: 17000, stepId: "pass", status: "done" as const },
  ];

  timelineSchedule.forEach(({ time, stepId, status }) => {
    const t = setTimeout(() => {
      const step = steps.find((s) => s.id === stepId);
      if (step) step.status = status;
      onUpdate({ steps: steps.map((s) => ({ ...s })) });
    }, time);
    timeouts.push(t);
  });

  // Fix schedule
  fixes.forEach((_, i) => {
    const t = setTimeout(() => {
      fixes[i].status = "fixed";
      onUpdate({ fixes: fixes.map((f) => ({ ...f })) });
    }, 8500 + i * 500);
    timeouts.push(t);
  });

  // Iteration
  timeouts.push(setTimeout(() => onUpdate({ currentIteration: 1 }), 6500));

  // Health + confidence
  timeouts.push(setTimeout(() => onUpdate({ healthAfter: confScore, confidence: confScore }), 13000));

  // Complete
  timeouts.push(setTimeout(() => onUpdate({ isRunning: false, isComplete: true, finalStatus: "PASSED" }), 18000));

  return () => timeouts.forEach(clearTimeout);
}
