import { motion } from "framer-motion";
import { Terminal, Copy, Check } from "lucide-react";
import { useState } from "react";

interface HealingOutputProps {
  repoUrl: string;
  branch: string;
  initialFailures: number;
  fixesApplied: number;
  finalStatus: "PASSED" | "FAILED";
  iterations: number;
}

const HealingOutput = ({ repoUrl, branch, initialFailures, fixesApplied, finalStatus, iterations }: HealingOutputProps) => {
  const [copied, setCopied] = useState(false);

  const output = `Repository: ${repoUrl}
Branch: ${branch}
Initial Failures: ${initialFailures}
Fixes Applied: ${fixesApplied}
Final Status: ${finalStatus}
Iterations: ${iterations}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Hackathon Output Format
          </h3>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs space-y-1">
        <OutputLine label="Repository" value={repoUrl} />
        <OutputLine label="Branch" value={branch} />
        <OutputLine label="Initial Failures" value={String(initialFailures)} />
        <OutputLine label="Fixes Applied" value={String(fixesApplied)} />
        <OutputLine
          label="Final Status"
          value={finalStatus}
          valueClass={finalStatus === "PASSED" ? "text-accent font-bold" : "text-destructive font-bold"}
        />
        <OutputLine label="Iterations" value={String(iterations)} />
      </div>

      {/* CI/CD Status Badge */}
      <div className="mt-4 flex items-center gap-3">
        <div className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${
          finalStatus === "PASSED"
            ? "bg-accent/10 text-accent border border-accent/20"
            : "bg-destructive/10 text-destructive border border-destructive/20"
        }`}>
          <span className={`w-2 h-2 rounded-full ${finalStatus === "PASSED" ? "bg-accent" : "bg-destructive"} animate-pulse`} />
          CI/CD: {finalStatus}
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          {iterations} iteration{iterations !== 1 ? "s" : ""} • {fixesApplied} fix{fixesApplied !== 1 ? "es" : ""}
        </span>
      </div>
    </motion.div>
  );
};

const OutputLine = ({ label, value, valueClass = "text-foreground" }: { label: string; value: string; valueClass?: string }) => (
  <div className="flex">
    <span className="text-primary w-[160px] shrink-0">{label}:</span>
    <span className={valueClass}>{value}</span>
  </div>
);

export default HealingOutput;
