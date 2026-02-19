import { motion } from "framer-motion";
import { ArrowDown, Cpu, Shield, Brain, Zap, GitBranch, BarChart3, Play, Code, Database, Bot, TestTube, Eye, FileText, Sparkles } from "lucide-react";
import AgentNetworkScene from "@/components/AgentNetwork3D";
import AnimatedCounter from "@/components/AnimatedCounter";
import TypingEffect from "@/components/TypingEffect";

interface HeroLandingProps {
  onGetStarted: () => void;
  onDemo: () => void;
}

const FEATURES = [
  { icon: Brain, title: "AI Root Cause Analysis", desc: "LLM-powered reasoning identifies why errors occur, not just where" },
  { icon: Shield, title: "Confidence & Risk Scoring", desc: "Every fix rated for reliability, risk level, and impact score" },
  { icon: GitBranch, title: "Auto PR Creation", desc: "Commits with [AI-AGENT] prefix, pushes to branches, opens PRs" },
  { icon: BarChart3, title: "Pipeline Intelligence", desc: "Health scoring, predictive failure engine, and optimization" },
  { icon: Eye, title: "Explainable Decisions", desc: "Full transparency: root cause, fix reasoning, alternatives considered" },
  { icon: Database, title: "Self-Learning Memory", desc: "Remembers error patterns and adapts future fixes automatically" },
];

const AGENT_LIST = [
  { name: "Repo Intelligence", desc: "Maps structure, deps, frameworks", icon: Code },
  { name: "Test Discovery", desc: "Detects & runs test frameworks", icon: TestTube },
  { name: "Failure Diagnosis", desc: "Classifies into 8 failure types", icon: Eye },
  { name: "Root Cause Analysis", desc: "LLM-powered why analysis", icon: Brain },
  { name: "Patch Generation", desc: "Minimal, safe code fixes", icon: Sparkles },
  { name: "Confidence & Risk", desc: "Scores reliability & impact", icon: Shield },
  { name: "Validation Agent", desc: "Re-runs tests, compares results", icon: TestTube },
  { name: "GitOps Automation", desc: "Branch, commit, push, PR", icon: GitBranch },
  { name: "Learning Memory", desc: "Stores & reuses patterns", icon: Database },
  { name: "Pipeline Optimizer", desc: "Build speed improvements", icon: BarChart3 },
];

const HeroLanding = ({ onGetStarted, onDemo }: HeroLandingProps) => {
  return (
    <div className="bg-background overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Hero Section */}
      <section className="relative pt-16 pb-0">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-primary">Multi-Agent Autonomous System • 10 AI Agents</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight leading-[1.05] mb-4">
              Self-Healing
              <br />
              <TypingEffect />
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              HealOps deploys a network of AI agents that autonomously analyze, diagnose, 
              patch, and push fixes to your repositories — with full explainability and learning capability.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:brightness-110 transition-all glow-cyan flex items-center gap-2 text-lg"
              >
                <Zap className="w-5 h-5" />
                Launch Dashboard
              </button>
              <button
                onClick={onDemo}
                className="px-8 py-4 bg-accent text-accent-foreground font-bold rounded-xl hover:brightness-110 transition-all glow-green flex items-center gap-2 text-lg"
              >
                <Play className="w-5 h-5" />
                Watch Live Demo
              </button>
              <a
                href="#agents"
                className="px-8 py-4 glass rounded-xl font-medium text-foreground hover:bg-secondary/80 transition-all flex items-center gap-2"
              >
                Explore
                <ArrowDown className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* 3D Agent Network */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
          >
            <AgentNetworkScene />
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto -mt-8 relative z-10"
          >
            <AnimatedCounter end={10} label="AI Agents" />
            <AnimatedCounter end={94} suffix="%" label="Avg Confidence" />
            <AnimatedCounter end={33} prefix="<" suffix="s" label="Heal Time" />
            <AnimatedCounter end={8} label="Failure Types" />
          </motion.div>
        </div>
      </section>

      {/* Agent Architecture Section */}
      <section id="agents" className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Bot className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-mono text-primary uppercase">Distributed Architecture</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              10-Agent Intelligence Network
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              Each agent specializes in one aspect of the healing pipeline, collaborating to deliver autonomous fixes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {AGENT_LIST.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-lg p-4 hover:glow-cyan transition-all group text-left"
                >
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{agent.name}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{agent.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Intelligent Pipeline Healing
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              Every failure is an opportunity. HealOps turns broken builds into learning moments.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass rounded-xl p-6 hover:glow-cyan transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              From broken build to passing pipeline in under 30 seconds.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[
              { step: "01", title: "Clone Repo", desc: "Analyzes project structure" },
              { step: "02", title: "Run Tests", desc: "Detects failures automatically" },
              { step: "03", title: "Diagnose", desc: "Classifies failure types" },
              { step: "04", title: "Generate Fix", desc: "AI creates minimal patches" },
              { step: "05", title: "Validate", desc: "Re-runs tests to verify" },
              { step: "06", title: "Push & PR", desc: "Commits and opens PR" },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-4 text-center relative"
              >
                <span className="text-3xl font-black text-primary/20 font-mono">{s.step}</span>
                <h4 className="font-semibold text-foreground text-sm mt-1">{s.title}</h4>
                <p className="text-[10px] text-muted-foreground mt-1">{s.desc}</p>
                {i < 5 && (
                  <div className="hidden md:block absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 text-primary/30 z-10 text-lg">→</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-10 glow-cyan"
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Ready to Heal Your Pipeline?
            </h2>
            <p className="text-muted-foreground mb-8 text-sm">
              See the full autonomous healing cycle in action with our live demo.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={onDemo}
                className="px-8 py-4 bg-accent text-accent-foreground font-bold rounded-xl hover:brightness-110 transition-all glow-green flex items-center gap-2 text-lg"
              >
                <Play className="w-5 h-5" />
                Run Live Demo
              </button>
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:brightness-110 transition-all flex items-center gap-2"
              >
                <Cpu className="w-5 h-5" />
                Open Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">HealOps AI</span>
            <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">v2.0</span>
          </div>
          <p className="text-xs text-muted-foreground">Autonomous CI/CD Healing Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default HeroLanding;
