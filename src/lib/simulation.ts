import { AgentInfo, AGENTS } from "@/components/AgentNetwork";
import { TimelineStep, DEFAULT_STEPS } from "@/components/PipelineTimeline";
import { LogEntry } from "@/components/LogStream";

const LOG_SEQUENCE: LogEntry[] = [
  { timestamp: "00:00.0", level: "info", agent: "SYSTEM", message: "Initializing HealOps autonomous healing pipeline..." },
  { timestamp: "00:01.2", level: "info", agent: "REPO", message: "Cloning repository from GitHub..." },
  { timestamp: "00:03.5", level: "success", agent: "REPO", message: "Repository cloned successfully. 147 files detected." },
  { timestamp: "00:04.1", level: "info", agent: "REPO", message: "Detected: React 18 + TypeScript + Vite + Tailwind CSS" },
  { timestamp: "00:05.0", level: "info", agent: "REPO", message: "Entry points: src/main.tsx, src/App.tsx" },
  { timestamp: "00:06.2", level: "info", agent: "TEST", message: "Scanning for test frameworks..." },
  { timestamp: "00:07.0", level: "info", agent: "TEST", message: "Found: Vitest with 23 test suites" },
  { timestamp: "00:08.5", level: "info", agent: "TEST", message: "Executing tests in Docker sandbox..." },
  { timestamp: "00:12.3", level: "error", agent: "TEST", message: "Test run failed: 5 tests failing, 18 passing" },
  { timestamp: "00:13.0", level: "warn", agent: "DIAG", message: "Classifying 5 failures..." },
  { timestamp: "00:14.2", level: "error", agent: "DIAG", message: "IMPORT error in src/components/Dashboard.tsx:7" },
  { timestamp: "00:14.8", level: "error", agent: "DIAG", message: "TYPE error in src/hooks/useAuth.ts:23" },
  { timestamp: "00:15.1", level: "warn", agent: "DIAG", message: "DEPENDENCY mismatch: react-query@3 vs @tanstack/react-query@5" },
  { timestamp: "00:16.0", level: "info", agent: "RCA", message: "Analyzing root causes with LLM reasoning..." },
  { timestamp: "00:18.5", level: "info", agent: "RCA", message: "Root cause: Module renamed in v5 migration, import paths stale" },
  { timestamp: "00:19.0", level: "info", agent: "PATCH", message: "Generating minimal code patches..." },
  { timestamp: "00:21.2", level: "success", agent: "PATCH", message: "Patch 1/3: Updated import path in Dashboard.tsx" },
  { timestamp: "00:22.0", level: "success", agent: "PATCH", message: "Patch 2/3: Fixed type annotation in useAuth.ts" },
  { timestamp: "00:22.8", level: "success", agent: "PATCH", message: "Patch 3/3: Updated dependency version in package.json" },
  { timestamp: "00:23.5", level: "info", agent: "CONF", message: "Scoring patches... Confidence: 94%, Risk: LOW" },
  { timestamp: "00:24.0", level: "info", agent: "VALID", message: "Re-running tests with patches applied..." },
  { timestamp: "00:28.3", level: "success", agent: "VALID", message: "All 23 tests passing! Build successful." },
  { timestamp: "00:29.0", level: "info", agent: "GITOPS", message: "Creating branch: HEALOPS_ADMIN_AI_Fix" },
  { timestamp: "00:30.2", level: "info", agent: "GITOPS", message: "Committing changes with prefix [AI-AGENT]..." },
  { timestamp: "00:31.5", level: "success", agent: "GITOPS", message: "Pushed to remote. Pull request #42 created." },
  { timestamp: "00:32.0", level: "info", agent: "LEARN", message: "Storing 3 new error patterns in memory bank" },
  { timestamp: "00:32.5", level: "info", agent: "PIPE", message: "Pipeline health improved: 61 → 94" },
  { timestamp: "00:33.0", level: "success", agent: "SYSTEM", message: "✓ Healing cycle complete. All systems nominal." },
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

export type SimulationState = {
  agents: AgentInfo[];
  steps: TimelineStep[];
  logs: LogEntry[];
  isRunning: boolean;
  isComplete: boolean;
  healthBefore: number;
  healthAfter: number;
  confidence: number;
};

export function createSimulation(
  onUpdate: (state: Partial<SimulationState>) => void
) {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const agents = AGENTS.map(a => ({ ...a }));
  const steps = DEFAULT_STEPS.map(s => ({ ...s }));
  const logs: LogEntry[] = [];

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

  // Health score animation
  const healthT = setTimeout(() => {
    onUpdate({ healthAfter: 94, confidence: 94 });
  }, 13000);
  timeouts.push(healthT);

  // Complete
  const completeT = setTimeout(() => {
    onUpdate({ isRunning: false, isComplete: true });
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
