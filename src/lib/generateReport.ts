import jsPDF from "jspdf";
import { SimulationState } from "@/lib/simulation";

export function generatePDFReport(state: SimulationState, repoUrl: string) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  let y = 20;

  const addSection = (title: string) => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setTextColor(0, 180, 150);
    doc.text(title, 14, y);
    y += 4;
    doc.setDrawColor(0, 180, 150);
    doc.line(14, y, pageW - 14, y);
    y += 8;
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
  };

  // Title
  doc.setFontSize(24);
  doc.setTextColor(0, 180, 150);
  doc.text("HealOps AI Healing Report", 14, y);
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
  y += 6;
  doc.text(`Repository: ${repoUrl}`, 14, y);
  y += 12;

  // Summary
  addSection("Healing Summary");
  const summary = [
    `Status: ${state.isComplete ? "Complete - All Tests Passing" : "In Progress"}`,
    `Branch: HEALOPS_ADMIN_AI_Fix`,
    `Fixes Applied: 3`,
    `Healing Iterations: 1`,
    `Total Time: 33.0s`,
    `Pre-Fix Health: ${state.healthBefore}/100`,
    `Post-Fix Health: ${state.healthAfter}/100`,
    `Confidence: ${state.confidence}%`,
  ];
  summary.forEach(line => {
    doc.text(line, 18, y);
    y += 6;
  });
  y += 6;

  // Agent Activity
  addSection("Agent Activity");
  state.agents.forEach(agent => {
    const statusEmoji = agent.status === "done" ? "✓" : agent.status === "active" ? "●" : "○";
    doc.text(`${statusEmoji} ${agent.name} — ${agent.description} [${agent.status.toUpperCase()}]`, 18, y);
    y += 5;
  });
  y += 6;

  // Failure Classification
  addSection("Failure Classification");
  const failures = [
    "IMPORT: 4 errors", "SYNTAX: 3 errors", "TYPE: 5 errors",
    "DEPENDENCY: 2 errors", "LOGIC: 3 errors", "CONFIG: 1 error",
  ];
  failures.forEach(f => { doc.text(`• ${f}`, 18, y); y += 5; });
  y += 6;

  // Root Cause Analysis
  addSection("Root Cause Analysis");
  const rcaLines = doc.splitTextToSize(
    "Import path 'react-query' is outdated. Package was renamed to '@tanstack/react-query' in v4+. The useQuery API also changed from positional arguments to an object config.",
    pageW - 36
  );
  doc.text(rcaLines, 18, y);
  y += rcaLines.length * 5 + 6;

  // Patches Applied
  addSection("Patches Applied");
  const patches = [
    "1. Updated import path in Dashboard.tsx: 'react-query' → '@tanstack/react-query'",
    "2. Fixed type annotation in useAuth.ts: 'any' → 'DashboardData'",
    "3. Updated useQuery API from positional args to object config",
  ];
  patches.forEach(p => {
    const lines = doc.splitTextToSize(p, pageW - 36);
    doc.text(lines, 18, y);
    y += lines.length * 5 + 2;
  });
  y += 4;

  // Log Timeline
  addSection("Execution Log");
  state.logs.forEach(log => {
    if (y > 275) { doc.addPage(); y = 20; }
    const prefix = log.level === "error" ? "✗" : log.level === "success" ? "✓" : log.level === "warn" ? "!" : "→";
    const line = `${log.timestamp} [${log.agent}] ${prefix} ${log.message}`;
    const wrapped = doc.splitTextToSize(line, pageW - 36);
    doc.text(wrapped, 18, y);
    y += wrapped.length * 4.5 + 1;
  });

  // Footer
  doc.addPage();
  y = 20;
  addSection("Conclusion");
  const conclusion = doc.splitTextToSize(
    "The HealOps autonomous healing pipeline successfully diagnosed and repaired all 5 failing tests across 3 code files. The pipeline health score improved from 61 to 94. All fixes were committed with the [AI-AGENT] prefix and pushed to branch HEALOPS_ADMIN_AI_Fix. A pull request (#42) has been created for review.",
    pageW - 36
  );
  doc.text(conclusion, 18, y);

  doc.save("HealOps_AI_Report.pdf");
}
