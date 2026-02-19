import { motion } from "framer-motion";
import { RotateCw, Settings2 } from "lucide-react";

interface IterationTrackerProps {
  currentIteration: number;
  maxIterations: number;
  failuresPerIteration: number[];
  isRunning: boolean;
}

const IterationTracker = ({ currentIteration, maxIterations, failuresPerIteration, isRunning }: IterationTrackerProps) => {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RotateCw className={`w-4 h-4 text-primary ${isRunning ? "animate-spin" : ""}`} />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Healing Iterations
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
          <Settings2 className="w-3 h-3" />
          Max: {maxIterations}
        </div>
      </div>

      <div className="flex gap-2">
        {Array.from({ length: maxIterations }, (_, i) => {
          const iterNum = i + 1;
          const isDone = iterNum < currentIteration;
          const isCurrent = iterNum === currentIteration;
          const failures = failuresPerIteration[i];

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`flex-1 rounded-lg p-3 text-center border transition-all ${
                isDone
                  ? "bg-accent/10 border-accent/20"
                  : isCurrent
                  ? "bg-primary/10 border-primary/30 glow-cyan"
                  : "bg-secondary/30 border-border/50"
              }`}
            >
              <div className={`text-lg font-bold font-mono ${
                isDone ? "text-accent" : isCurrent ? "text-primary" : "text-muted-foreground/40"
              }`}>
                #{iterNum}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {isDone ? `${failures ?? 0} fails` : isCurrent && isRunning ? "Running..." : isCurrent ? `${failures ?? 0} fails` : "—"}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(currentIteration / maxIterations) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

export default IterationTracker;
