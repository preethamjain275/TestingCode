import jsPDF from "jspdf";
import { SimulationState } from "@/lib/simulation";

export function generatePDFReport(state: SimulationState, repoUrl: string, dynamicRCA?: string) {
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
  const fixedCount = state.fixes ? state.fixes.filter(f => f.status === "fixed").length : 0;
  const summary = [
    `Repository: ${repoUrl}`,
    `Branch: ${state.branch}`,
    `Initial Failures: ${state.initialFailures}`,
    `Fixes Applied: ${fixedCount}`,
    `Final Status: ${state.finalStatus || (state.isComplete ? "PASSED" : "IN PROGRESS")}`,
    `Iterations: ${state.currentIteration || 1}`,
    `Pre-Fix Health: ${state.healthBefore}/100`,
    `Post-Fix Health: ${state.healthAfter}/100`,
    `Confidence: ${state.confidence}%`,
  ];
  summary.forEach(line => {
    doc.text(line, 18, y);
    y += 6;
  });
  y += 6;

  // Fixes Table
  addSection("Applied Fixes (File | Bug Type | Line | Commit | Status)");
  if (state.fixes) {
    state.fixes.forEach(fix => {
      const line = `${fix.file} | ${fix.bugType} | L${fix.line} | ${fix.commitMessage} | ${fix.status.toUpperCase()}`;
      const wrapped = doc.splitTextToSize(line, pageW - 36);
      doc.text(wrapped, 18, y);
      y += wrapped.length * 5 + 2;
    });
  }
  y += 6;

  // Failure Classification
  addSection("Failure Classification");
  const categories = ["LINTING", "SYNTAX", "TYPE_ERROR", "LOGIC", "IMPORT", "INDENTATION"];
  categories.forEach(cat => {
    const count = state.fixes ? state.fixes.filter(f => f.bugType === cat).length : 0;
    doc.text(`• ${cat}: ${count} error${count !== 1 ? "s" : ""}`, 18, y);
    y += 5;
  });
  y += 6;

  // Root Cause Analysis
  addSection("Root Cause Analysis");
  const rcaText = dynamicRCA || "Import path 'react-query' is outdated. Package was renamed to '@tanstack/react-query' in v4+.";
  const rcaLines = doc.splitTextToSize(rcaText, pageW - 36);
  doc.text(rcaLines, 18, y);
  y += rcaLines.length * 5 + 6;

  // Agent Activity
  addSection("Agent Activity");
  state.agents.forEach(agent => {
    if (y > 275) { doc.addPage(); y = 20; }
    const statusEmoji = agent.status === "done" ? "✓" : agent.status === "active" ? "●" : "○";
    doc.text(`${statusEmoji} ${agent.name} — ${agent.description} [${agent.status.toUpperCase()}]`, 18, y);
    y += 5;
  });
  y += 6;

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

  doc.save("HealOps_AI_Report.pdf");
}
