import { motion } from "framer-motion";
import { Database, TrendingUp, ArrowRight } from "lucide-react";

interface PatternEntry {
  pattern: string;
  count: number;
  lastSeen: string;
}

const PATTERNS: PatternEntry[] = [
  { pattern: "Missing default export", count: 12, lastSeen: "2 min ago" },
  { pattern: "Undefined variable reference", count: 8, lastSeen: "5 min ago" },
  { pattern: "Type mismatch in props", count: 15, lastSeen: "1 min ago" },
  { pattern: "Package version conflict", count: 6, lastSeen: "8 min ago" },
  { pattern: "Circular dependency detected", count: 3, lastSeen: "12 min ago" },
];

const PredictivePanel = () => {
  const nextFailProb = 23;

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-warning" />
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Predictive Engine & Memory
        </h3>
      </div>

      {/* Prediction */}
      <div className="p-3 rounded-lg bg-warning/5 border border-warning/10 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-warning font-semibold uppercase">Next Build Failure Probability</span>
          <span className="text-lg font-bold text-warning font-mono">{nextFailProb}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-warning rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${nextFailProb}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* Pattern memory */}
      <div className="flex items-center gap-1.5 mb-2">
        <Database className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground font-semibold uppercase">Learned Patterns</span>
      </div>
      <div className="space-y-1.5">
        {PATTERNS.map((p, i) => (
          <motion.div
            key={p.pattern}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between text-xs p-2 rounded-lg bg-secondary/30"
          >
            <div className="flex items-center gap-2 min-w-0">
              <ArrowRight className="w-3 h-3 text-primary shrink-0" />
              <span className="text-foreground/80 truncate">{p.pattern}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-mono text-primary">{p.count}×</span>
              <span className="text-muted-foreground text-[10px]">{p.lastSeen}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PredictivePanel;
