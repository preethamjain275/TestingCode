import { motion } from "framer-motion";
import { Activity, Clock, GitBranch, RotateCw, FileCheck } from "lucide-react";

interface ResultsSummaryProps {
  repoName: string;
  branch: string;
  iterations: number;
  fixesApplied: number;
  totalTime: string;
  status: "success" | "partial" | "failed";
}

const statusConfig = {
  success: { label: "All Tests Passing", color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
  partial: { label: "Partial Fix", color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
  failed: { label: "Fix Failed", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
};

const ResultsSummary = ({ repoName, branch, iterations, fixesApplied, totalTime, status }: ResultsSummaryProps) => {
  const s = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass rounded-xl p-6 border ${s.border}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Healing Results
        </h3>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${s.bg} ${s.color}`}>
          {s.label}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={GitBranch} label="Branch" value={branch} />
        <Stat icon={RotateCw} label="Iterations" value={String(iterations)} />
        <Stat icon={FileCheck} label="Fixes Applied" value={String(fixesApplied)} />
        <Stat icon={Clock} label="Total Time" value={totalTime} />
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs font-mono text-muted-foreground">
          Repository: <span className="text-foreground">{repoName}</span>
        </p>
      </div>
    </motion.div>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground font-mono">{value}</p>
    </div>
  </div>
);

export default ResultsSummary;
