import { useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, Search, Zap, AlertCircle, Users, User } from "lucide-react";

interface RepoInputProps {
  onSubmit: (url: string, teamName: string, leaderName: string) => void;
  isLoading: boolean;
}

const RepoInput = ({ onSubmit, isLoading }: RepoInputProps) => {
  const [url, setUrl] = useState("");
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [error, setError] = useState("");

  const validateUrl = (val: string) => {
    const pattern = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+/;
    return pattern.test(val.trim());
  };

  const validateName = (val: string) => /^[a-zA-Z0-9_]+$/.test(val.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUrl(url)) {
      setError("Enter a valid GitHub repository URL");
      return;
    }
    if (!teamName.trim() || !validateName(teamName)) {
      setError("Team name is required (alphanumeric only)");
      return;
    }
    if (!leaderName.trim() || !validateName(leaderName)) {
      setError("Leader name is required (alphanumeric only)");
      return;
    }
    setError("");
    onSubmit(url.trim(), teamName.trim().toUpperCase(), leaderName.trim().toUpperCase());
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

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Repo URL */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            placeholder="https://github.com/owner/repository"
            className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            disabled={isLoading}
          />
        </div>

        {/* Team + Leader row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={teamName}
              onChange={(e) => { setTeamName(e.target.value.toUpperCase()); setError(""); }}
              placeholder="TEAM NAME"
              className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all uppercase"
              disabled={isLoading}
            />
          </div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={leaderName}
              onChange={(e) => { setLeaderName(e.target.value.toUpperCase()); setError(""); }}
              placeholder="LEADER NAME"
              className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all uppercase"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Branch preview */}
        {teamName && leaderName && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-xs font-mono text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2"
          >
            Branch: <span className="text-primary">{teamName.toUpperCase()}_{leaderName.toUpperCase()}_AI_Fix</span>
          </motion.div>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-destructive flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" /> {error}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={isLoading || !url}
          className="w-full px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          {isLoading ? "Analyzing..." : "Start Healing"}
        </button>
      </form>
    </motion.div>
  );
};

export default RepoInput;
