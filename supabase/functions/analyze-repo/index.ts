import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { repoUrl, teamName, leaderName } = await req.json();

    // Parse owner/repo from URL
    const match = repoUrl.match(/github\.com\/([\w.-]+)\/([\w.-]+)/);
    if (!match) {
      return new Response(JSON.stringify({ error: "Invalid GitHub URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const [, owner, repo] = match;
    const repoName = repo.replace(/\.git$/, "");

    // Fetch repo tree (try main, then master)
    let tree: any[] = [];
    for (const branch of ["main", "master"]) {
      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/git/trees/${branch}?recursive=1`,
        { headers: { "User-Agent": "HealOps-Agent" } }
      );
      if (treeRes.ok) {
        const data = await treeRes.json();
        tree = data.tree || [];
        break;
      }
    }

    if (tree.length === 0) {
      return new Response(
        JSON.stringify({ error: "Could not fetch repository tree. Make sure the repo is public." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter to relevant source files
    const sourceFiles = tree
      .filter((f: any) => f.type === "blob")
      .filter((f: any) => {
        const p = f.path.toLowerCase();
        return (
          p.endsWith(".ts") ||
          p.endsWith(".tsx") ||
          p.endsWith(".js") ||
          p.endsWith(".jsx") ||
          p.endsWith(".py") ||
          p.endsWith(".json") ||
          p.endsWith(".css")
        );
      })
      .filter((f: any) => !f.path.includes("node_modules") && !f.path.includes(".lock"))
      .slice(0, 15);

    // Fetch file contents (up to 10 key files)
    const filesToFetch = sourceFiles.slice(0, 10);
    const fileContents: { path: string; content: string }[] = [];

    for (const file of filesToFetch) {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/HEAD/${file.path}`;
        const res = await fetch(rawUrl, { headers: { "User-Agent": "HealOps-Agent" } });
        if (res.ok) {
          const text = await res.text();
          // Limit each file to 3000 chars
          fileContents.push({ path: file.path, content: text.slice(0, 3000) });
        }
      } catch {
        // skip files that fail
      }
    }

    const allPaths = tree
      .filter((f: any) => f.type === "blob")
      .map((f: any) => f.path)
      .slice(0, 100);

    // Build LLM prompt
    const systemPrompt = `You are an expert CI/CD failure diagnosis agent. You analyze GitHub repositories to find bugs, code issues, and test failures.

Given a repository's file tree and source code, you must:
1. Detect the test framework used (e.g., Jest, Vitest, Pytest, Mocha, etc.)
2. Find real issues in the code — bugs, type errors, import issues, linting problems, syntax errors, logic errors, indentation issues
3. Classify each issue into EXACTLY one of: LINTING, SYNTAX, TYPE_ERROR, LOGIC, IMPORT, INDENTATION
4. Generate a specific fix description and commit message for each issue
5. Provide a root cause analysis explaining the main problems
6. Suggest fix reasoning and alternatives

Be thorough and find at least 3-6 real issues. Focus on actual problems, not style preferences.`;

    const userPrompt = `Analyze this repository: ${owner}/${repoName}

Team: ${teamName}
Leader: ${leaderName}
Branch will be: ${teamName}_${leaderName}_AI_Fix

File tree (${allPaths.length} files):
${allPaths.join("\n")}

Source files:
${fileContents.map((f) => `--- ${f.path} ---\n${f.content}`).join("\n\n")}

Analyze this repository and find all issues using the analyze_repository tool.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_repository",
              description: "Return structured analysis of repository issues",
              parameters: {
                type: "object",
                properties: {
                  detectedFramework: {
                    type: "string",
                    description: "Detected test framework (e.g. Vitest, Jest, Pytest)",
                  },
                  fixes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        file: { type: "string", description: "File path" },
                        bugType: {
                          type: "string",
                          enum: ["LINTING", "SYNTAX", "TYPE_ERROR", "LOGIC", "IMPORT", "INDENTATION"],
                        },
                        line: { type: "number", description: "Line number" },
                        description: { type: "string", description: "What the issue is" },
                        fixSuggestion: { type: "string", description: "How to fix it" },
                        commitMessage: {
                          type: "string",
                          description: "Commit message starting with [AI-AGENT]",
                        },
                      },
                      required: ["file", "bugType", "line", "description", "fixSuggestion", "commitMessage"],
                      additionalProperties: false,
                    },
                  },
                  rootCause: {
                    type: "string",
                    description: "Root cause analysis text",
                  },
                  fixReason: {
                    type: "string",
                    description: "Why these fixes are the best approach",
                  },
                  alternatives: {
                    type: "array",
                    items: { type: "string" },
                    description: "Alternative approaches considered and why they were rejected",
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence score 0-100",
                  },
                },
                required: ["detectedFramework", "fixes", "rootCause", "fixReason", "alternatives", "confidence"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_repository" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      // Fallback: try to parse from content
      console.error("No tool call in response:", JSON.stringify(aiData));
      return new Response(JSON.stringify({ error: "AI did not return structured analysis" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Ensure commit messages have [AI-AGENT] prefix
    if (analysis.fixes) {
      analysis.fixes = analysis.fixes.map((f: any) => ({
        ...f,
        commitMessage: f.commitMessage.startsWith("[AI-AGENT]")
          ? f.commitMessage
          : `[AI-AGENT] ${f.commitMessage}`,
      }));
    }

    return new Response(
      JSON.stringify({
        ...analysis,
        repoUrl,
        teamName,
        leaderName,
        branch: `${teamName}_${leaderName}_AI_Fix`,
        fileCount: allPaths.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-repo error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
