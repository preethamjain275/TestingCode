import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Search, Zap, AlertCircle, Users, User, Lock, HelpCircle, X, CheckCircle2 } from "lucide-react";

interface RepoInputProps {
  onSubmit: (url: string, teamName: string, leaderName: string, token?: string) => void;
  isLoading: boolean;
}

const RepoInput = ({ onSubmit, isLoading }: RepoInputProps) => {
  const [url, setUrl] = useState("");
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [token, setToken] = useState("");
  const [showHelp, setShowHelp] = useState(false);
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
    onSubmit(url.trim(), teamName.trim().toUpperCase(), leaderName.trim().toUpperCase(), token.trim());
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
              placeholder="e.g. RIFT ORGANISERS"
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
              placeholder="e.g. SAIYAM KUMAR"
              className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all uppercase"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* GitHub Token (Optional) */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="GitHub Personal Access Token (Optional)"
            className="w-full pl-10 pr-10 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary transition-colors"
            title="How to generate a token?"
          >
            {showHelp ? <X className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
          </button>
        </div>

        {/* Token Help Modal */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="glass border border-primary/20 rounded-lg overflow-hidden"
            >
              <div className="p-4 space-y-4 text-sm bg-background/50 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="font-semibold flex items-center gap-2 text-primary">
                    <CheckCircle2 className="w-4 h-4" /> Generating a GitHub Token
                  </h4>
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors"
                  >
                    Open Settings ↗
                  </a>
                </div>

                <div className="space-y-4 text-muted-foreground text-xs">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 text-green-500 font-bold text-[10px]">1</div>
                    <div>
                      <strong className="text-foreground block mb-1">Login & Go to Settings</strong>
                      Log in to GitHub. Click Profile → Settings → Developer settings (bottom left).
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 text-green-500 font-bold text-[10px]">2</div>
                    <div>
                      <strong className="text-foreground block mb-1">Create Token</strong>
                      Click <span className="text-primary/80">Personal access tokens</span> → <span className="text-primary/80">Tokens (classic)</span> → <span className="text-primary/80">Generate new token (classic)</span>.
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 text-green-500 font-bold text-[10px]">3</div>
                    <div>
                      <strong className="text-foreground block mb-1">Config & Perms</strong>
                      Name it eg:"HealOps". Select Expiration Date. <span className="text-destructive font-bold">Important:</span> Check the <code className="bg-secondary px-1 rounded text-foreground">repo</code> checkbox for full repository access.
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 text-green-500 font-bold text-[10px]">4</div>
                    <div>
                      <strong className="text-foreground block mb-1">Generate & Copy</strong>
                      Click "Generate token". Copy the code starting with <code className="bg-secondary px-1 rounded text-foreground">ghp_</code> immediately.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
          {isLoading ? "Running Agent..." : "Run Agent"}
        </button>
      </form>
    </motion.div>
  );
};

export default RepoInput;
