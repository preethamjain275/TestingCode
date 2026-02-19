import { motion } from "framer-motion";
import { Shield, AlertTriangle, TrendingUp } from "lucide-react";

interface ConfidenceMeterProps {
  confidence: number;
  risk: "low" | "medium" | "high";
  impact: number;
}

const riskConfig = {
  low: { color: "text-accent", bg: "bg-accent/10", label: "Low Risk" },
  medium: { color: "text-warning", bg: "bg-warning/10", label: "Med Risk" },
  high: { color: "text-destructive", bg: "bg-destructive/10", label: "High Risk" },
};

const ConfidenceMeter = ({ confidence, risk, impact }: ConfidenceMeterProps) => {
  const r = riskConfig[risk];

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Fix Assessment
      </h3>
      <div className="space-y-4">
        {/* Confidence bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <Shield className="w-3 h-3" /> Confidence
            </span>
            <span className="text-primary font-mono font-semibold">{confidence}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
        {/* Risk */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Risk Level
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.bg} ${r.color}`}>
            {r.label}
          </span>
        </div>
        {/* Impact */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Impact Score
            </span>
            <span className="text-accent font-mono font-semibold">{impact}/10</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${impact * 10}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceMeter;
