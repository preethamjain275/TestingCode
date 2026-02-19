import { motion } from "framer-motion";
import { ArrowDown, Cpu, Shield, Brain, Zap, GitBranch, BarChart3 } from "lucide-react";
import AgentNetworkScene from "@/components/AgentNetwork3D";

interface HeroLandingProps {
  onGetStarted: () => void;
}

const FEATURES = [
  { icon: Brain, title: "AI Root Cause Analysis", desc: "LLM-powered reasoning identifies why errors occur" },
  { icon: Shield, title: "Confidence Scoring", desc: "Every fix rated for reliability and risk" },
  { icon: GitBranch, title: "Auto PR Creation", desc: "Commits, pushes, and opens pull requests" },
  { icon: BarChart3, title: "Pipeline Intelligence", desc: "Health scoring and predictive failure engine" },
];

const HeroLanding = ({ onGetStarted }: HeroLandingProps) => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Hero Section */}
      <section className="relative pt-20 pb-8">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-primary">Multi-Agent Autonomous System</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight leading-[1.1] mb-6">
              Self-Healing
              <br />
              <span className="text-primary text-glow-cyan">CI/CD Pipelines</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
              HealOps deploys a network of 10 AI agents that autonomously analyze, diagnose, 
              patch, and push fixes to your repositories — with full explainability.
            </p>

            <div className="flex items-center justify-center gap-4 mb-12">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:brightness-110 transition-all glow-cyan flex items-center gap-2 text-lg"
              >
                <Zap className="w-5 h-5" />
                Launch Dashboard
              </button>
              <a
                href="#features"
                className="px-8 py-4 glass rounded-xl font-medium text-foreground hover:bg-secondary/80 transition-all flex items-center gap-2"
              >
                Learn More
                <ArrowDown className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* 3D Agent Network */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <AgentNetworkScene />
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-4"
          >
            {[
              { val: "10", label: "AI Agents" },
              { val: "94%", label: "Avg Confidence" },
              { val: "<30s", label: "Heal Time" },
              { val: "8", label: "Failure Types" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-primary font-mono">{stat.val}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Intelligent Pipeline Healing
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Every failure is an opportunity. HealOps turns broken builds into learning moments.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
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

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-20"
          >
            <button
              onClick={onGetStarted}
              className="px-10 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:brightness-110 transition-all glow-cyan flex items-center gap-2 mx-auto text-lg"
            >
              <Cpu className="w-5 h-5" />
              Start Healing Now
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HeroLanding;
