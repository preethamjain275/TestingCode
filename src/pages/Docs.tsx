import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Book, FileText, Code, Terminal, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Docs = () => {
    const guides = [
        {
            title: "Getting Started",
            description: "Learn how to set up HealOps and connect your first repository.",
            icon: Zap,
        },
        {
            title: "Configuration",
            description: "Customize agent behavior, risk thresholds, and notification settings.",
            icon: Terminal,
        },
        {
            title: "API Reference",
            description: "Detailed documentation for the HealOps API and integration points.",
            icon: Code,
        },
        {
            title: "Architecture",
            description: "Understand the multi-agent system and how it heals your code.",
            icon: FileText,
        }
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <div className="flex-1 container max-w-[1200px] mx-auto px-6 py-12">
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                        <Book className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-medium text-primary">Documentation</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Documentation</h1>
                    <p className="text-muted-foreground max-w-2xl text-lg">
                        Everything you need to build, configure, and deploy with HealOps.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {guides.map((guide) => {
                        const Icon = guide.icon;
                        return (
                            <Card key={guide.title} className="hover:border-primary/50 transition-colors cursor-pointer group">
                                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl">{guide.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        {guide.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="mt-16 prose prose-invert max-w-none">
                    <h3>Quick Start</h3>
                    <p className="text-muted-foreground">
                        Get up and running with HealOps in under 5 minutes.
                    </p>
                    <div className="bg-card border border-border rounded-lg p-4 font-mono text-sm overflow-x-auto">
                        <span className="text-primary">npm</span> install @healops/cli<br />
                        <span className="text-primary">healops</span> init
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Docs;
