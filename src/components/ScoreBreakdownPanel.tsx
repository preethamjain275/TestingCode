import { motion } from "framer-motion";
import { Trophy, Zap, AlertTriangle, TrendingUp } from "lucide-react";

interface ScoreBreakdownPanelProps {
    baseScore: number;
    speedBonus: number;
    efficiencyPenalty: number;
    finalScore: number;
}

const ScoreBreakdownPanel = ({ baseScore, speedBonus, efficiencyPenalty, finalScore }: ScoreBreakdownPanelProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-xl p-6 border border-primary/20"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-foreground">Score Breakdown</h3>
                    <p className="text-xs text-muted-foreground">Performance Analysis</p>
                </div>
                <div className="ml-auto text-2xl font-black text-primary">
                    {finalScore}
                </div>
            </div>

            <div className="space-y-4">
                {/* Base Score */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Base Score</span>
                    </div>
                    <span className="font-mono font-bold text-foreground">{baseScore}</span>
                </div>

                {/* Speed Bonus */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">Speed Bonus</span>
                    </div>
                    <span className="font-mono font-bold text-green-600">+{speedBonus}</span>
                </div>

                {/* Efficiency Penalty */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-red-600">Efficiency Penalty</span>
                    </div>
                    <span className="font-mono font-bold text-red-600">{efficiencyPenalty}</span>
                </div>

                {/* Chart Bar (Simple visual) */}
                <div className="mt-4 pt-4 border-t border-border">
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex">
                        <div
                            className="h-full bg-primary"
                            style={{ width: `${Math.min(finalScore, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-muted-foreground font-mono">
                        <span>0</span>
                        <span>100</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ScoreBreakdownPanel;
