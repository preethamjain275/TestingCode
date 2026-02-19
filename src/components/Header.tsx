import { motion } from "framer-motion";
import { Cpu, Activity, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Docs", href: "#docs" },
    { name: "Contact Us", href: "#contact" },
  ];

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
            <p className="text-[10px] text-muted-foreground hidden sm:block">Autonomous CI/CD Healing Platform</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:text-primary"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground mr-2">
            <Activity className="w-3.5 h-3.5 text-accent animate-pulse" />
            <span>System Online</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-warning" />
            ) : (
              <Moon className="w-4 h-4 text-primary" />
            )}
          </Button>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm">Log In</Button>
            <Button size="sm">Sign Up</Button>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-primary" />
                  HealOps AI
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="h-px bg-border my-2" />
                <Button variant="outline" className="w-full justify-start">Log In</Button>
                <Button className="w-full justify-start">Sign Up</Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
