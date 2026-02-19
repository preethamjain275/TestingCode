import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Clock, FileCode, ChevronDown, ChevronRight, Copy, Check, Download, Eye } from "lucide-react";

export interface DetailedFix {
  file: string;
  bugType: "LINTING" | "SYNTAX" | "TYPE_ERROR" | "LOGIC" | "IMPORT" | "INDENTATION";
  line: number;
  description: string;
  fixSuggestion: string;
  commitMessage: string;
  status: "fixed" | "failed" | "pending";
  selected: boolean;
}

interface FixDetailPanelProps {
  fixes: DetailedFix[];
  onToggleSelect: (index: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onExportSelected: () => void;
}

const bugTypeColors: Record<string, string> = {
  LINTING: "bg-primary/10 text-primary border-primary/20",
  SYNTAX: "bg-destructive/10 text-destructive border-destructive/20",
  TYPE_ERROR: "bg-warning/10 text-warning border-warning/20",
  LOGIC: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  IMPORT: "bg-accent/10 text-accent border-accent/20",
  INDENTATION: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const statusConfig = {
  fixed: { icon: CheckCircle2, label: "FIXED", className: "text-accent" },
  failed: { icon: XCircle, label: "FAILED", className: "text-destructive" },
  pending: { icon: Clock, label: "PENDING", className: "text-warning" },
};

const FixDetailPanel = ({ fixes, onToggleSelect, onSelectAll, onDeselectAll, onExportSelected }: FixDetailPanelProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const selectedCount = fixes.filter(f => f.selected).length;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Detected Issues & Fixes
          </h3>
          <span className="text-[10px] font-mono text-accent ml-2">
            {selectedCount}/{fixes.length} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSelectAll}
            className="text-[10px] font-mono text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded bg-primary/5 hover:bg-primary/10"
          >
            Select All
          </button>
          <button
            onClick={onDeselectAll}
            className="text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded bg-secondary/50 hover:bg-secondary"
          >
            Deselect All
          </button>
          {selectedCount > 0 && (
            <button
              onClick={onExportSelected}
              className="text-[10px] font-bold text-accent-foreground bg-accent hover:brightness-110 transition-all px-3 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              Export {selectedCount} Fix{selectedCount > 1 ? "es" : ""}
            </button>
          )}
        </div>
      </div>

      {/* Fix list */}
      <div className="space-y-2">
        {fixes.map((fix, i) => {
          const isExpanded = expandedIndex === i;
          const s = statusConfig[fix.status];
          const StatusIcon = s.icon;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`border rounded-lg transition-all ${
                fix.selected
                  ? "border-primary/30 bg-primary/5"
                  : "border-border/50 bg-secondary/20"
              }`}
            >
              {/* Row header */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Checkbox */}
                <button
                  onClick={() => onToggleSelect(i)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                    fix.selected
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  }`}
                >
                  {fix.selected && <Check className="w-3 h-3 text-primary-foreground" />}
                </button>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-foreground truncate max-w-[250px]">{fix.file}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">:{fix.line}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${bugTypeColors[fix.bugType]}`}>
                      {fix.bugType}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                    {fix.description}
                  </p>
                </div>

                {/* Status */}
                <div className={`flex items-center gap-1 shrink-0 ${s.className}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">{s.label}</span>
                </div>

                {/* Expand button */}
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
                      {/* Description */}
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Issue Description</label>
                        <p className="text-xs text-foreground/90 mt-1 leading-relaxed">{fix.description}</p>
                      </div>

                      {/* Fix Suggestion */}
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Eye className="w-3 h-3" />
                            Suggested Fix
                          </label>
                          <button
                            onClick={() => handleCopy(fix.fixSuggestion, i)}
                            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                          >
                            {copiedIndex === i ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
                            {copiedIndex === i ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <div className="mt-1 bg-secondary/70 rounded-lg p-3 font-mono text-xs text-foreground/90 whitespace-pre-wrap border border-border/30">
                          {fix.fixSuggestion}
                        </div>
                      </div>

                      {/* Commit message */}
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Commit Message</label>
                        <div className="mt-1 bg-secondary/50 rounded-lg px-3 py-2 font-mono text-[11px] text-accent">
                          {fix.commitMessage}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FixDetailPanel;
