import { motion } from "framer-motion";

interface HealthScoreProps {
  label: string;
  score: number;
  maxScore?: number;
  color?: "cyan" | "green" | "amber" | "red";
}

const colorMap = {
  cyan: { ring: "text-primary", trail: "text-primary/20", glow: "glow-cyan" },
  green: { ring: "text-accent", trail: "text-accent/20", glow: "glow-green" },
  amber: { ring: "text-warning", trail: "text-warning/20", glow: "" },
  red: { ring: "text-destructive", trail: "text-destructive/20", glow: "glow-red" },
};

const HealthScore = ({ label, score, maxScore = 100, color = "cyan" }: HealthScoreProps) => {
  const pct = Math.min((score / maxScore) * 100, 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const c = colorMap[color];

  return (
    <div className={`glass rounded-xl p-5 flex flex-col items-center ${c.glow}`}>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{label}</p>
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="6" className={`stroke-current ${c.trail}`} />
          <motion.circle
            cx="50" cy="50" r={radius} fill="none" strokeWidth="6"
            strokeLinecap="round"
            className={`stroke-current ${c.ring}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeDasharray={circumference}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{score}</span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">/ {maxScore}</p>
    </div>
  );
};

export default HealthScore;
