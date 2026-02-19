import { AgentInfo, AGENTS } from "@/components/AgentNetwork";
import { TimelineStep, DEFAULT_STEPS } from "@/components/PipelineTimeline";
import { LogEntry } from "@/components/LogStream";
import { FixEntry } from "@/components/FixesTable";

// Exact hackathon fix entries
export const SIMULATION_FIXES: FixEntry[] = [
  {
    file: "src/components/Dashboard.tsx",
    bugType: "IMPORT",
    line: 2,
    commitMessage: "[AI-AGENT] Fix import: react-query → @tanstack/react-query",
    status: "pending",
  },
  {
    file: "src/hooks/useAuth.ts",
    bugType: "TYPE_ERROR",
    line: 23,
    commitMessage: "[AI-AGENT] Fix type: any → AuthUser interface",
    status: "pending",
  },
  {
    file: "src/utils/parser.ts",
    bugType: "SYNTAX",
    line: 45,
    commitMessage: "[AI-AGENT] Fix syntax: missing closing bracket",
    status: "pending",
  },
  {
    file: "src/components/Sidebar.tsx",
    bugType: "LOGIC",
    line: 67,
    commitMessage: "[AI-AGENT] Fix logic: incorrect conditional check",
    status: "pending",
  },
  {
    file: "src/config/routes.ts",
    bugType: "INDENTATION",
    line: 12,
    commitMessage: "[AI-AGENT] Fix indentation: align nested object",
    status: "pending",
  },
  {
    file: "src/styles/theme.ts",
    bugType: "LINTING",
    line: 8,
    commitMessage: "[AI-AGENT] Fix lint: unused variable removed",
    status: "pending",
  },
];

const LOG_SEQUENCE: LogEntry[] = [
  { timestamp: "00:00.0", level: "info", agent: "SYSTEM", message: "Initializing HealOps autonomous healing pipeline..." },
  { timestamp: "00:01.2", level: "info", agent: "REPO", message: "Cloning repository from GitHub..." },
  { timestamp: "00:03.5", level: "success", agent: "REPO", message: "Repository cloned successfully. 147 files detected." },
  { timestamp: "00:04.1", level: "info", agent: "REPO", message: "Detected: React 18 + TypeScript + Vite + Tailwind CSS" },
  { timestamp: "00:05.0", level: "info", agent: "REPO", message: "Entry points: src/main.tsx, src/App.tsx" },
  { timestamp: "00:06.2", level: "info", agent: "TEST", message: "Scanning for test frameworks..." },
  { timestamp: "00:07.0", level: "info", agent: "TEST", message: "Found: Vitest with 23 test suites" },
  { timestamp: "00:08.5", level: "info", agent: "TEST", message: "Executing tests in Docker sandbox..." },
  { timestamp: "00:12.3", level: "error", agent: "TEST", message: "Test run failed: 6 tests failing, 17 passing" },
  // Classification with exact hackathon categories
  { timestamp: "00:13.0", level: "warn", agent: "DIAG", message: "Classifying 6 failures into categories..." },
  { timestamp: "00:13.5", level: "error", agent: "DIAG", message: "IMPORT error in src/components/Dashboard.tsx:2" },
  { timestamp: "00:13.8", level: "error", agent: "DIAG", message: "TYPE_ERROR in src/hooks/useAuth.ts:23" },
  { timestamp: "00:14.1", level: "error", agent: "DIAG", message: "SYNTAX error in src/utils/parser.ts:45" },
  { timestamp: "00:14.4", level: "error", agent: "DIAG", message: "LOGIC error in src/components/Sidebar.tsx:67" },
  { timestamp: "00:14.7", level: "error", agent: "DIAG", message: "INDENTATION error in src/config/routes.ts:12" },
  { timestamp: "00:15.0", level: "error", agent: "DIAG", message: "LINTING error in src/styles/theme.ts:8" },
  // Iteration 1
  { timestamp: "00:16.0", level: "info", agent: "RCA", message: "── Iteration 1 / 3 ──" },
  { timestamp: "00:16.5", level: "info", agent: "RCA", message: "Analyzing root causes with LLM reasoning..." },
  { timestamp: "00:18.5", level: "info", agent: "RCA", message: "Root cause: Module renamed in v5 migration, import paths stale" },
  { timestamp: "00:19.0", level: "info", agent: "PATCH", message: "Generating targeted fixes for 6 issues..." },
  { timestamp: "00:20.0", level: "success", agent: "PATCH", message: "Fix 1/6: IMPORT — Dashboard.tsx:2 → updated import path" },
  { timestamp: "00:20.5", level: "success", agent: "PATCH", message: "Fix 2/6: TYPE_ERROR — useAuth.ts:23 → typed interface" },
  { timestamp: "00:21.0", level: "success", agent: "PATCH", message: "Fix 3/6: SYNTAX — parser.ts:45 → added missing bracket" },
  { timestamp: "00:21.5", level: "success", agent: "PATCH", message: "Fix 4/6: LOGIC — Sidebar.tsx:67 → corrected conditional" },
  { timestamp: "00:22.0", level: "success", agent: "PATCH", message: "Fix 5/6: INDENTATION — routes.ts:12 → aligned nesting" },
  { timestamp: "00:22.5", level: "success", agent: "PATCH", message: "Fix 6/6: LINTING — theme.ts:8 → removed unused var" },
  { timestamp: "00:23.5", level: "info", agent: "CONF", message: "Scoring patches... Confidence: 96%, Risk: LOW" },
  { timestamp: "00:24.0", level: "info", agent: "VALID", message: "Re-running tests with patches applied..." },
  { timestamp: "00:28.3", level: "success", agent: "VALID", message: "All 23 tests passing! Build successful." },
  // Git automation
  { timestamp: "00:29.0", level: "info", agent: "GITOPS", message: "Creating branch: HEALOPS_ADMIN_AI_Fix" },
  { timestamp: "00:30.0", level: "info", agent: "GITOPS", message: "Committing 6 changes with prefix [AI-AGENT]..." },
  { timestamp: "00:31.0", level: "success", agent: "GITOPS", message: "Pushed to remote. Pull request #42 created." },
  { timestamp: "00:31.5", level: "info", agent: "LEARN", message: "Storing 6 new error patterns in memory bank" },
  { timestamp: "00:32.0", level: "info", agent: "PIPE", message: "Pipeline health improved: 61 → 96" },
  { timestamp: "00:32.5", level: "success", agent: "SYSTEM", message: "✓ Healing cycle complete. Final Status: PASSED" },
];

const AGENT_SCHEDULE: { time: number; agentId: string; status: "active" | "done" | "error" }[] = [
  { time: 0, agentId: "repo", status: "active" },
  { time: 2000, agentId: "repo", status: "done" },
  { time: 2000, agentId: "test", status: "active" },
  { time: 4000, agentId: "test", status: "done" },
  { time: 4000, agentId: "diagnosis", status: "active" },
  { time: 6000, agentId: "diagnosis", status: "done" },
  { time: 6000, agentId: "rca", status: "active" },
  { time: 8000, agentId: "rca", status: "done" },
  { time: 8000, agentId: "patch", status: "active" },
  { time: 10000, agentId: "patch", status: "done" },
  { time: 10000, agentId: "confidence", status: "active" },
  { time: 11000, agentId: "confidence", status: "done" },
  { time: 11000, agentId: "validation", status: "active" },
  { time: 13000, agentId: "validation", status: "done" },
  { time: 13000, agentId: "gitops", status: "active" },
  { time: 15000, agentId: "gitops", status: "done" },
  { time: 15000, agentId: "learning", status: "active" },
  { time: 16000, agentId: "learning", status: "done" },
  { time: 16000, agentId: "pipeline", status: "active" },
  { time: 17000, agentId: "pipeline", status: "done" },
];

const TIMELINE_SCHEDULE: { time: number; stepId: string; status: "active" | "done" | "error" }[] = [
  { time: 500, stepId: "clone", status: "active" },
  { time: 2000, stepId: "clone", status: "done" },
  { time: 2500, stepId: "test", status: "active" },
  { time: 4000, stepId: "test", status: "done" },
  { time: 4500, stepId: "fail", status: "active" },
  { time: 6000, stepId: "fail", status: "error" },
  { time: 8500, stepId: "fix", status: "active" },
  { time: 11000, stepId: "fix", status: "done" },
  { time: 13500, stepId: "commit", status: "active" },
  { time: 15000, stepId: "commit", status: "done" },
  { time: 15500, stepId: "pass", status: "active" },
  { time: 17000, stepId: "pass", status: "done" },
];

// Fix schedule — reveal fixes one by one
const FIX_SCHEDULE: { time: number; index: number; status: "fixed" | "failed" }[] = [
  { time: 8500, index: 0, status: "fixed" },
  { time: 9000, index: 1, status: "fixed" },
  { time: 9500, index: 2, status: "fixed" },
  { time: 10000, index: 3, status: "fixed" },
  { time: 10500, index: 4, status: "fixed" },
  { time: 11000, index: 5, status: "fixed" },
];

export type SimulationState = {
  agents: AgentInfo[];
  steps: TimelineStep[];
  logs: LogEntry[];
  fixes: FixEntry[];
  isRunning: boolean;
  isComplete: boolean;
  healthBefore: number;
  healthAfter: number;
  confidence: number;
  currentIteration: number;
  maxIterations: number;
  initialFailures: number;
  finalStatus: "PASSED" | "FAILED" | "";
  branch: string;
};

export function createSimulation(
  onUpdate: (state: Partial<SimulationState>) => void
) {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const agents = AGENTS.map(a => ({ ...a }));
  const steps = DEFAULT_STEPS.map(s => ({ ...s }));
  const logs: LogEntry[] = [];
  const fixes = SIMULATION_FIXES.map(f => ({ ...f }));

  // Schedule logs
  LOG_SEQUENCE.forEach((log, i) => {
    const t = setTimeout(() => {
      logs.push(log);
      onUpdate({ logs: [...logs] });
    }, i * 600);
    timeouts.push(t);
  });

  // Schedule agents
  AGENT_SCHEDULE.forEach(({ time, agentId, status }) => {
    const t = setTimeout(() => {
      const agent = agents.find(a => a.id === agentId);
      if (agent) agent.status = status;
      onUpdate({ agents: agents.map(a => ({ ...a })) });
    }, time);
    timeouts.push(t);
  });

  // Schedule timeline
  TIMELINE_SCHEDULE.forEach(({ time, stepId, status }) => {
    const t = setTimeout(() => {
      const step = steps.find(s => s.id === stepId);
      if (step) step.status = status;
      onUpdate({ steps: steps.map(s => ({ ...s })) });
    }, time);
    timeouts.push(t);
  });

  // Schedule fix statuses
  FIX_SCHEDULE.forEach(({ time, index, status }) => {
    const t = setTimeout(() => {
      fixes[index].status = status;
      onUpdate({ fixes: fixes.map(f => ({ ...f })) });
    }, time);
    timeouts.push(t);
  });

  // Iteration tracking
  const iterT = setTimeout(() => {
    onUpdate({ currentIteration: 1 });
  }, 6500);
  timeouts.push(iterT);

  // Health score animation
  const healthT = setTimeout(() => {
    onUpdate({ healthAfter: 96, confidence: 96 });
  }, 13000);
  timeouts.push(healthT);

  // Complete
  const completeT = setTimeout(() => {
    onUpdate({ isRunning: false, isComplete: true, finalStatus: "PASSED" });
  }, 18000);
  timeouts.push(completeT);

  return () => timeouts.forEach(clearTimeout);
}

export const SAMPLE_DIFF = [
  { type: "context" as const, content: "import React from 'react';", lineNum: 1 },
  { type: "remove" as const, content: "import { useQuery } from 'react-query';", lineNum: 2 },
  { type: "add" as const, content: "import { useQuery } from '@tanstack/react-query';", lineNum: 2 },
  { type: "context" as const, content: "", lineNum: 3 },
  { type: "context" as const, content: "interface DashboardProps {", lineNum: 4 },
  { type: "remove" as const, content: "  data: any;", lineNum: 5 },
  { type: "add" as const, content: "  data: DashboardData;", lineNum: 5 },
  { type: "context" as const, content: "}", lineNum: 6 },
  { type: "context" as const, content: "", lineNum: 7 },
  { type: "context" as const, content: "export const Dashboard = ({ data }: DashboardProps) => {", lineNum: 8 },
  { type: "remove" as const, content: "  const { isLoading } = useQuery('dashboard', fetchData);", lineNum: 9 },
  { type: "add" as const, content: "  const { isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: fetchData });", lineNum: 9 },
  { type: "context" as const, content: "  if (isLoading) return <Spinner />;", lineNum: 10 },
  { type: "context" as const, content: "  return <div>{/* ... */}</div>;", lineNum: 11 },
  { type: "context" as const, content: "};", lineNum: 12 },
];

// Generate results.json matching exact hackathon format
export function generateResultsJSON(state: SimulationState, repoUrl: string): string {
  const results = {
    repository: repoUrl,
    branch: state.branch,
    initial_failures: state.initialFailures,
    fixes_applied: state.fixes.filter(f => f.status === "fixed").length,
    final_status: state.finalStatus,
    iterations: state.currentIteration,
    timestamp: new Date().toISOString(),
    fixes: state.fixes.map(f => ({
      file: f.file,
      bug_type: f.bugType,
      line: f.line,
      commit_message: f.commitMessage,
      status: f.status,
    })),
    failure_classification: {
      LINTING: state.fixes.filter(f => f.bugType === "LINTING").length,
      SYNTAX: state.fixes.filter(f => f.bugType === "SYNTAX").length,
      TYPE_ERROR: state.fixes.filter(f => f.bugType === "TYPE_ERROR").length,
      LOGIC: state.fixes.filter(f => f.bugType === "LOGIC").length,
      IMPORT: state.fixes.filter(f => f.bugType === "IMPORT").length,
      INDENTATION: state.fixes.filter(f => f.bugType === "INDENTATION").length,
    },
    health_score: {
      before: state.healthBefore,
      after: state.healthAfter,
    },
    confidence: state.confidence,
  };
  return JSON.stringify(results, null, 2);
}
