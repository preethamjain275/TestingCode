import { motion } from "framer-motion";
import { GitBranch, TestTube, AlertTriangle, Wrench, GitCommit, CheckCircle2 } from "lucide-react";

export interface TimelineStep {
  id: string;
  label: string;
  icon: React.ElementType;
  status: "pending" | "active" | "done" | "error";
  time?: string;
}

export const DEFAULT_STEPS: TimelineStep[] = [
  { id: "clone", label: "Repo Cloned", icon: GitBranch, status: "pending" },
  { id: "test", label: "Tests Run", icon: TestTube, status: "pending" },
  { id: "fail", label: "Failure Detected", icon: AlertTriangle, status: "pending" },
  { id: "fix", label: "Fix Generated", icon: Wrench, status: "pending" },
  { id: "commit", label: "Commit Pushed", icon: GitCommit, status: "pending" },
  { id: "pass", label: "Pipeline Passed", icon: CheckCircle2, status: "pending" },
];

const stepStatusStyle: Record<string, { dot: string; line: string; text: string }> = {
  pending: { dot: "bg-muted-foreground/30 border-muted-foreground/30", line: "bg-muted-foreground/20", text: "text-muted-foreground" },
  active: { dot: "bg-primary border-primary animate-pulse shadow-[0_0_10px_hsl(173_80%_50%/0.5)]", line: "bg-primary/40", text: "text-primary" },
  done: { dot: "bg-accent border-accent", line: "bg-accent/60", text: "text-accent" },
  error: { dot: "bg-destructive border-destructive", line: "bg-destructive/40", text: "text-destructive" },
};

const PipelineTimeline = ({ steps }: { steps: TimelineStep[] }) => {
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
        DevOps Pipeline
      </h3>
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />
        {steps.map((step, i) => {
          const style = stepStatusStyle[step.status];
          const Icon = step.icon;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center relative z-10"
            >
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${style.dot} transition-all`}>
                <Icon className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className={`text-[10px] font-medium mt-2 ${style.text} whitespace-nowrap`}>
                {step.label}
              </span>
              {step.time && (
                <span className="text-[9px] text-muted-foreground font-mono">{step.time}</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineTimeline;
