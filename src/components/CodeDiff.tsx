import { motion } from "framer-motion";

interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
  lineNum: number;
}

interface CodeDiffProps {
  fileName: string;
  lines: DiffLine[];
}

const lineStyle = {
  add: "bg-accent/10 text-accent border-l-2 border-accent",
  remove: "bg-destructive/10 text-destructive border-l-2 border-destructive line-through opacity-70",
  context: "text-muted-foreground border-l-2 border-transparent",
};

const linePrefix = { add: "+", remove: "-", context: " " };

const CodeDiff = ({ fileName, lines }: CodeDiffProps) => {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 bg-secondary/50 border-b border-border flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-warning/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-accent/60" />
        </div>
        <span className="text-xs font-mono text-muted-foreground ml-2">{fileName}</span>
      </div>
      <div className="p-3 overflow-x-auto font-mono text-xs leading-relaxed">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className={`px-3 py-0.5 ${lineStyle[line.type]} rounded-sm`}
          >
            <span className="text-muted-foreground/50 mr-3 select-none w-8 inline-block text-right">
              {line.lineNum}
            </span>
            <span className="text-muted-foreground/50 mr-2 select-none">{linePrefix[line.type]}</span>
            {line.content}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CodeDiff;
