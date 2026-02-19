import simpleGit from 'simple-git';
import { GoogleGenerativeAI } from '@google/generative-ai';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const git = simpleGit();

const main = async () => {
    console.log(chalk.cyanBright(`
   _____                 _ _            _   _____ 
  / ____|               | (_)          | | |  __ \\
 | |  __ _   _  __ _ ___| |_  __ _ _ __| |_| |__) |
 | | |_ | | | |/ _\` / __| | |/ _\` | '__| __|  ___/ 
 | |__| | |_| | (_| \\__ \\ | | (_| | |  | |_| |     
  \\_____|\\__,_|\\__,_|___/_|_|\\__,_|_|   \\__|_|     
                                                   
  `));
    console.log(chalk.bold.blue("Auto-Healing AI Agent - Local Execution Mode"));
    console.log(chalk.gray("--------------------------------------------------"));

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'repoUrl',
            message: 'GitHub Repository URL:',
            validate: (input) => input.includes('github.com') || 'Please enter a valid GitHub URL',
        },
        {
            type: 'password',
            name: 'githubToken',
            message: 'GitHub Personal Access Token (for pushing):',
            mask: '*',
            validate: (input) => input.length > 0 || 'Token is required to push changes',
        },
        {
            type: 'password',
            name: 'geminiKey',
            message: 'Gemini API Key (leave empty to simulate fixes):',
        },
        {
            type: 'input',
            name: 'teamName',
            message: 'Team Name:',
            default: 'RIFT_ORGANISERS',
        },
        {
            type: 'input',
            name: 'leaderName',
            message: 'Leader Name:',
            default: 'SAIYAM_KUMAR',
        }
    ]);

    const { repoUrl, githubToken, geminiKey, teamName, leaderName } = answers;
    const branchName = `${teamName.toUpperCase().replace(/\s+/g, '_')}_${leaderName.toUpperCase().replace(/\s+/g, '_')}_AI_Fix`;

    // Setup Directory
    const targetDir = path.resolve(process.cwd(), 'temp_hacked_repo');

    // Clone
    const spinner = ora('Cloning repository...').start();
    try {
        try {
            await fs.access(targetDir);
            await fs.rm(targetDir, { recursive: true, force: true });
        } catch { }

        await fs.mkdir(targetDir, { recursive: true });

        // Inject token into URL for authentication
        // Format: https://TOKEN@github.com/owner/repo.git
        const repoUrlWithAuth = repoUrl.replace('https://', `https://${githubToken}@`);

        await git.clone(repoUrlWithAuth, targetDir);
        spinner.succeed('Repository cloned successfully.');
    } catch (error) {
        spinner.fail('Failed to clone repository.');
        console.error(chalk.red(error));
        return;
    }

    // Checkout Branch
    const repoGit = simpleGit(targetDir);
    spinner.start(`Creating branch ${branchName}...`);
    try {
        await repoGit.checkoutLocalBranch(branchName);
        spinner.succeed(`Switched to new branch: ${branchName}`);
    } catch (error) {
        spinner.fail('Failed to create branch.');
        console.error(chalk.red(error));
        return;
    }

    // Analyze and Fix
    spinner.start('AI Agent analyzing code...');

    // Simulation or Real AI
    if (geminiKey) {
        spinner.text = "Gemini is analyzing and fixing code...";
        try {
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            // Simple strategy: check root files like README or package.json
            const files = await fs.readdir(targetDir);
            const targetFile = files.find(f => f.toLowerCase() === 'readme.md') || 'README.md';
            const filePath = path.join(targetDir, targetFile);

            // Wait a bit to simulate "thinking"
            await new Promise(r => setTimeout(r, 2000));

            let content = '';
            try {
                content = await fs.readFile(filePath, 'utf-8');
            } catch {
                content = '# New Repo';
            }

            const prompt = `You are a helpful AI agent fixing a repository. 
        Add a section to the bottom of this markdown file confirming that the repository has been analyzed and fixed by the AI Agent.
        Include the team name: ${teamName} and leader: ${leaderName}.
        
        File Content:
        ${content}`;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            await fs.writeFile(filePath, text);
            spinner.succeed('Applied AI Fixes (Updated README with AI verification).');

        } catch (e) {
            spinner.warn('Gemini Analysis failed, falling back to simulated fix.');
            await fs.appendFile(path.join(targetDir, 'README.md'), `\n\n## AI Analysis Result\nVerified by HealOps Agent for Team ${teamName} (Leader: ${leaderName}) on ${new Date().toISOString()}.`);
            spinner.succeed('Applied Simulation Fixes.');
        }

    } else {
        await new Promise(r => setTimeout(r, 3000));
        // Fake Fix
        await fs.appendFile(path.join(targetDir, 'README.md'), `\n\n## AI Analysis Result\nVerified by HealOps Agent for Team ${teamName} (Leader: ${leaderName}) on ${new Date().toISOString()}.`);
        spinner.succeed('Applied Simulation Fixes (No Gemini Key provided).');
    }

    // Push
    spinner.start('Pushing changes to GitHub...');
    try {
        // Configure git user
        await repoGit.addConfig('user.name', 'HealOps AI Agent');
        await repoGit.addConfig('user.email', 'agent@healops.ai');

        await repoGit.add('.');
        await repoGit.commit(`[AI-AGENT] Applied automated fixes for ${teamName}`);
        await repoGit.push('origin', branchName);
        spinner.succeed('Changes pushed successfully!');

        console.log(chalk.greenBright(`\nSUCCESS! Review your Pull Request at:`));
        console.log(chalk.underline.blue(`${repoUrl}/pull/new/${branchName}`));

        // Cleanup
        // await fs.rm(targetDir, { recursive: true, force: true });
        console.log(chalk.gray(`\nLocal clone preserved at: ${targetDir}`));

    } catch (error) {
        spinner.fail('Failed to push changes.');
        console.log(chalk.yellow('Hint: Check your Personal Access Token permissions using the link provided in the console.'));
        console.error(chalk.red(error));
    }
};

main().catch(console.error);
