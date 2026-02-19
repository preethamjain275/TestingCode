import { motion } from "framer-motion";
import { Bot, Brain, Search, Shield, Code, GitCommit, Database, Gauge, TestTube, FileSearch } from "lucide-react";

export type AgentStatus = "idle" | "active" | "done" | "error";

export interface AgentInfo {
  id: string;
  name: string;
  icon: React.ElementType;
  status: AgentStatus;
  description: string;
}

export const AGENTS: AgentInfo[] = [
  { id: "repo", name: "Repo Intelligence", icon: FileSearch, status: "idle", description: "Mapping project structure" },
  { id: "test", name: "Test Discovery", icon: TestTube, status: "idle", description: "Detecting test frameworks" },
  { id: "diagnosis", name: "Failure Diagnosis", icon: Search, status: "idle", description: "Classifying failures" },
  { id: "rca", name: "Root Cause Analysis", icon: Brain, status: "idle", description: "Determining why errors occur" },
  { id: "patch", name: "Patch Generation", icon: Code, status: "idle", description: "Generating minimal fixes" },
  { id: "confidence", name: "Confidence & Risk", icon: Shield, status: "idle", description: "Scoring fix reliability" },
  { id: "validation", name: "Validation", icon: Gauge, status: "idle", description: "Re-running tests" },
  { id: "gitops", name: "GitOps Automation", icon: GitCommit, status: "idle", description: "Committing & pushing" },
  { id: "learning", name: "Learning Memory", icon: Database, status: "idle", description: "Storing error patterns" },
  { id: "pipeline", name: "Pipeline Optimizer", icon: Bot, status: "idle", description: "Optimizing delivery" },
];

const statusColors: Record<AgentStatus, string> = {
  idle: "bg-muted-foreground/30",
  active: "bg-primary animate-pulse",
  done: "bg-accent",
  error: "bg-destructive",
};

const AgentNetwork = ({ agents }: { agents: AgentInfo[] }) => {
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Multi-Agent Network
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {agents.map((agent, i) => {
          const Icon = agent.icon;
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                agent.status === "active" ? "bg-primary/10 border border-primary/20" : "bg-secondary/50"
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${agent.status === "active" ? "text-primary" : agent.status === "done" ? "text-accent" : "text-muted-foreground"}`} />
                <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-medium truncate ${agent.status === "active" ? "text-primary" : "text-foreground"}`}>
                  {agent.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{agent.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentNetwork;
