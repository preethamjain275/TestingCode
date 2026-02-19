
import { Octokit } from "octokit";

export interface GitConfig {
    owner: string;
    repo: string;
    token: string;
    branch: string;
}

export const createBranch = async (config: GitConfig) => {
    const octokit = new Octokit({ auth: config.token });

    // Get main branch ref
    let sha;
    try {
        const { data: refData } = await octokit.rest.git.getRef({
            owner: config.owner,
            repo: config.repo,
            ref: "heads/main",
        });
        sha = refData.object.sha;
    } catch (e) {
        const { data: refData } = await octokit.rest.git.getRef({
            owner: config.owner,
            repo: config.repo,
            ref: "heads/master",
        });
        sha = refData.object.sha;
    }

    // Create new branch
    await octokit.rest.git.createRef({
        owner: config.owner,
        repo: config.repo,
        ref: `refs/heads/${config.branch}`,
        sha,
    });
};

export const commitFile = async (config: GitConfig, path: string, content: string, message: string) => {
    const octokit = new Octokit({ auth: config.token });

    // Get current file sha (if exists) to update, or create new
    let fileSha: string | undefined;
    try {
        const { data } = await octokit.rest.repos.getContent({
            owner: config.owner,
            repo: config.repo,
            path,
            ref: config.branch,
        });
        if (!Array.isArray(data)) {
            fileSha = data.sha;
        }
    } catch (e) {
        // File doesn't exist, create new
    }

    await octokit.rest.repos.createOrUpdateFileContents({
        owner: config.owner,
        repo: config.repo,
        path,
        message,
        content: btoa(unescape(encodeURIComponent(content))), // Handle UTF-8
        branch: config.branch,
        sha: fileSha,
    });
};
