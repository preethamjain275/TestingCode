import { motion } from "framer-motion";
import { Brain, Lightbulb, ArrowRight } from "lucide-react";

interface ExplainablePanelProps {
  rootCause: string;
  fixReason: string;
  alternatives: string[];
}

const ExplainablePanel = ({ rootCause, fixReason, alternatives }: ExplainablePanelProps) => {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Explainable AI
        </h3>
      </div>
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
          <p className="text-[10px] text-destructive font-semibold uppercase mb-1">Root Cause</p>
          <p className="text-sm text-foreground/90">{rootCause}</p>
        </div>
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-[10px] text-primary font-semibold uppercase mb-1">Why This Fix</p>
          <p className="text-sm text-foreground/90">{fixReason}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-2 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" /> Alternatives Considered
          </p>
          <div className="space-y-1.5">
            {alternatives.map((alt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-2 text-xs text-muted-foreground"
              >
                <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground/50" />
                {alt}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplainablePanel;
