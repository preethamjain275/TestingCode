

# Fix Edge Function Error + Show Language Detection

## Problems Found

1. **URL validation too strict**: The regex in RepoInput rejects valid GitHub URLs with trailing slashes or extra path segments (e.g., `https://github.com/owner/repo/`)
2. **Error handling issue**: The `supabase.functions.invoke` error object may not have a `.message` property, causing silent failures or unhelpful error messages
3. **No language/framework display**: The edge function already returns `detectedFramework` (e.g., "Mocha", "Vitest", "Jest") but this info is never shown to the user
4. **Repository URL not displaying correctly**: Need to show the analyzed repo URL and detected language prominently

Note: I tested the backend function directly and it works perfectly -- it successfully analyzed the Express.js repository and returned real issues. The problem is purely on the frontend side.

## Changes

### 1. Fix URL Validation (RepoInput.tsx)

Relax the GitHub URL regex to accept common URL variations:
- Trailing slashes
- `.git` suffix
- URLs with or without `www`
- Reject clearly invalid URLs but be more permissive

Change from:
```text
/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(\.git)?$/
```
To:
```text
/^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+/
```

### 2. Fix Error Handling (Index.tsx)

Update the error handling in `startLiveAnalysis` to properly extract error messages from the edge function response. The SDK may return the error differently depending on HTTP status codes.

### 3. Add Language/Framework Display

Show the detected framework prominently in the dashboard after analysis completes. This will appear as a badge/info bar showing:
- Repository URL being analyzed
- Detected language/framework (e.g., "JavaScript / Mocha")
- Number of files scanned

This will be added as a new info panel between the RepoInput and the Pipeline Timeline.

### 4. Show Repo Info Panel

Add a new section in Index.tsx that shows analysis metadata:
- Repository name and URL
- Detected framework
- File count
- Branch name
- Number of issues found

## Files Modified

| File | Change |
|------|--------|
| `src/components/RepoInput.tsx` | Relax URL validation regex |
| `src/pages/Index.tsx` | Fix error handling, add repo info display panel with language detection |

## Technical Notes

- The edge function already returns `detectedFramework`, `fileCount`, and `branch` -- we just need to display them
- No backend changes needed -- the function works correctly
- The fix is entirely frontend: validation + error handling + display

