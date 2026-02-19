import { useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, Search, Zap, AlertCircle } from "lucide-react";

interface RepoInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const RepoInput = ({ onSubmit, isLoading }: RepoInputProps) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const validate = (val: string) => {
    const pattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(\.git)?$/;
    return pattern.test(val.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(url)) {
      setError("Enter a valid GitHub repository URL");
      return;
    }
    setError("");
    onSubmit(url.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6 glow-cyan"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <GitBranch className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Repository Analysis</h2>
          <p className="text-sm text-muted-foreground">Enter a GitHub repo to begin autonomous healing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            placeholder="https://github.com/owner/repository"
            className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            disabled={isLoading}
          />
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-6 left-0 text-xs text-destructive flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" /> {error}
            </motion.p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !url}
          className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Zap className="w-4 h-4" />
          {isLoading ? "Analyzing..." : "Start Healing"}
        </button>
      </form>
    </motion.div>
  );
};

export default RepoInput;
