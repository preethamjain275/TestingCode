

# Real GitHub Repo Analysis + Team Name Input + LLM Integration

## What Changes

Currently the platform runs a hardcoded simulation. This plan makes it work with **real GitHub repositories** by adding:

1. **Team Name and Leader Name input fields** so the branch name dynamically becomes `TEAMNAME_LEADERNAME_AI_Fix`
2. **A backend edge function** that uses Lovable AI (LLM) to analyze a real GitHub repo's contents via the GitHub API, detect issues, classify failures, and generate fix suggestions
3. **Dynamic simulation** that uses the LLM's analysis results instead of hardcoded data

## Prerequisites

- **Lovable Cloud** must be enabled (needed for edge functions and the `LOVABLE_API_KEY` secret)

## Implementation Steps

### 1. Update RepoInput Component

Add two new text fields alongside the repo URL input:
- **Team Name** (required, uppercase enforced)
- **Leader Name** (required, uppercase enforced)

The form will pass all three values (`url`, `teamName`, `leaderName`) to the parent on submit. The branch name will be computed as `${TEAMNAME}_${LEADERNAME}_AI_Fix`.

### 2. Create Edge Function: `supabase/functions/analyze-repo/index.ts`

This edge function will:
- Accept `{ repoUrl, teamName, leaderName }` from the frontend
- Use the GitHub API (public repos, no token needed) to fetch the repo's file tree and key files (package.json, tsconfig.json, test files, source files)
- Send the repo structure and file contents to Lovable AI (Gemini) with a system prompt instructing it to act as a CI/CD failure diagnosis agent
- The LLM will return structured output (via tool calling) with:
  - Detected test framework
  - List of issues found (file, bugType, line, description, fix suggestion, commit message)
  - Root cause analysis text
  - Fix reasoning and alternatives
  - Confidence score
- Return the structured analysis to the frontend

### 3. Create a New "Live Analysis" Flow in Index.tsx

When a user submits a real repo URL with team/leader names:
- Call the edge function to get the LLM analysis
- Use the returned data to populate the simulation state dynamically (real file names, real bug types, real RCA text)
- Run the visual simulation using the real data instead of hardcoded entries
- The branch name, commit messages, and all output will use the user-provided team/leader names

The existing demo mode will continue to work with the hardcoded simulation data.

### 4. Update Simulation Engine

Modify `src/lib/simulation.ts` to accept dynamic fix entries and log messages:
- Add a `createDynamicSimulation` function that takes the LLM analysis results and generates appropriate log sequences, agent schedules, and fix entries
- The existing `createSimulation` remains for demo mode

### 5. Update Downstream Components

- **HealingOutput**: Will display the dynamic branch name
- **generateReport.ts**: Will use the LLM-provided RCA text instead of hardcoded text
- **ExplainablePanel**: Will receive dynamic root cause, fix reasoning, and alternatives from the LLM response
- **generateResultsJSON**: Already dynamic, no changes needed

## Technical Details

### Edge Function Structure

```text
supabase/functions/analyze-repo/index.ts
```

- Fetches repo tree via `https://api.github.com/repos/{owner}/{repo}/git/trees/main?recursive=1`
- Fetches up to 10 key source files via the GitHub raw content API
- Sends contents to Lovable AI with a structured tool-call schema for `analyze_repository`
- Returns JSON with: `fixes[]`, `rootCause`, `fixReason`, `alternatives[]`, `confidence`, `detectedFramework`

### Config Update

```text
supabase/config.toml
```

Add the `analyze-repo` function with `verify_jwt = false`.

### RepoInput Changes

- Add `teamName` and `leaderName` state variables
- Update `onSubmit` signature to `(url: string, teamName: string, leaderName: string) => void`
- Add validation: all three fields required, team/leader names must be alphanumeric

### Index.tsx Changes

- Add state for `teamName` and `leaderName`
- Add `analyzeRepo` async function that calls the edge function
- On submit: call edge function first, then start dynamic simulation with results
- Show a "Fetching repo..." loading state between submit and simulation start
- Compute branch as `${teamName.toUpperCase()}_${leaderName.toUpperCase()}_AI_Fix`

### New Files

| File | Purpose |
|------|---------|
| `supabase/functions/analyze-repo/index.ts` | Edge function for LLM-powered repo analysis |
| `supabase/config.toml` | Edge function configuration |

### Modified Files

| File | Change |
|------|--------|
| `src/components/RepoInput.tsx` | Add team name + leader name fields |
| `src/pages/Index.tsx` | Add edge function call, dynamic simulation flow, team/leader state |
| `src/lib/simulation.ts` | Add `createDynamicSimulation` function |
| `src/lib/generateReport.ts` | Accept dynamic RCA text |
| `src/components/ExplainablePanel.tsx` | No structural change (already accepts props) |
| `src/components/HealingOutput.tsx` | No structural change (already accepts props) |

