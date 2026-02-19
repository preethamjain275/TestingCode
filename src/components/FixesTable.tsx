import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, FileCode } from "lucide-react";

export interface FixEntry {
  file: string;
  bugType: "LINTING" | "SYNTAX" | "TYPE_ERROR" | "LOGIC" | "IMPORT" | "INDENTATION";
  line: number;
  commitMessage: string;
  status: "fixed" | "failed" | "pending";
}

const statusConfig = {
  fixed: { icon: CheckCircle2, label: "FIXED", className: "text-accent" },
  failed: { icon: XCircle, label: "FAILED", className: "text-destructive" },
  pending: { icon: Clock, label: "PENDING", className: "text-warning" },
};

const bugTypeColors: Record<string, string> = {
  LINTING: "bg-primary/10 text-primary",
  SYNTAX: "bg-destructive/10 text-destructive",
  TYPE_ERROR: "bg-warning/10 text-warning",
  LOGIC: "bg-purple-500/10 text-purple-400",
  IMPORT: "bg-accent/10 text-accent",
  INDENTATION: "bg-blue-500/10 text-blue-400",
};

const FixesTable = ({ fixes }: { fixes: FixEntry[] }) => {
  const fixedCount = fixes.filter(f => f.status === "fixed").length;
  const totalCount = fixes.length;

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Applied Fixes
          </h3>
        </div>
        <span className="text-[10px] font-mono text-accent">
          {fixedCount}/{totalCount} resolved
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 text-muted-foreground font-semibold">File</th>
              <th className="text-left py-2 px-2 text-muted-foreground font-semibold">Bug Type</th>
              <th className="text-center py-2 px-2 text-muted-foreground font-semibold">Line</th>
              <th className="text-left py-2 px-2 text-muted-foreground font-semibold">Commit Message</th>
              <th className="text-center py-2 px-2 text-muted-foreground font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {fixes.map((fix, i) => {
              const s = statusConfig[fix.status];
              const Icon = s.icon;
              return (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-2.5 px-2 font-mono text-foreground/90 truncate max-w-[200px]">
                    {fix.file}
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${bugTypeColors[fix.bugType]}`}>
                      {fix.bugType}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono text-foreground/80">
                    {fix.line}
                  </td>
                  <td className="py-2.5 px-2 text-foreground/80 truncate max-w-[250px]">
                    {fix.commitMessage}
                  </td>
                  <td className="py-2.5 px-2">
                    <div className={`flex items-center justify-center gap-1 ${s.className}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">{s.label}</span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FixesTable;
