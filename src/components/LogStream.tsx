import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Terminal } from "lucide-react";

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  agent: string;
  message: string;
}

const levelColors: Record<string, string> = {
  info: "text-primary",
  warn: "text-warning",
  error: "text-destructive",
  success: "text-accent",
};

const levelBg: Record<string, string> = {
  info: "bg-primary/10",
  warn: "bg-warning/10",
  error: "bg-destructive/10",
  success: "bg-accent/10",
};

const LogStream = ({ logs }: { logs: LogEntry[] }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  return (
    <div className="glass rounded-xl p-4 flex flex-col h-[320px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Live Logs
          </h3>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          {logs.length} entries
        </span>
      </div>
      <div
        className="flex-1 overflow-y-auto space-y-1 font-mono text-xs scrollbar-thin"
        onScroll={(e) => {
          const el = e.currentTarget;
          setAutoScroll(el.scrollHeight - el.scrollTop - el.clientHeight < 50);
        }}
      >
        {logs.map((log, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex gap-2 p-1.5 rounded ${levelBg[log.level]}`}
          >
            <span className="text-muted-foreground shrink-0">{log.timestamp}</span>
            <span className={`shrink-0 font-semibold ${levelColors[log.level]}`}>
              [{log.agent}]
            </span>
            <span className="text-foreground/90">{log.message}</span>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default LogStream;
