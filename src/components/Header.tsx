import { motion } from "framer-motion";
import { Cpu, Activity, Zap, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center"
          >
            <Cpu className="w-5 h-5 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
              HealOps
              <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                AI
              </span>
            </h1>
            <p className="text-[10px] text-muted-foreground">Autonomous CI/CD Healing Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="w-3.5 h-3.5 text-accent animate-pulse" />
            <span>System Online</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span>v2.0.0</span>
          </div>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-warning" />
            ) : (
              <Moon className="w-4 h-4 text-primary" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
