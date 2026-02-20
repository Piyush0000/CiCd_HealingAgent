const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const os = require('os');

function getRepoDir(repoUrl) {
  // Sanitize name: replace :, \, / with underscore
  const safeName = repoUrl.replace(/[:\\/]/g, '_').replace('.git', '') + '_' + Date.now();
  return path.join(os.tmpdir(), 'cicd-agent', safeName);
}

async function cloneRepo(repoUrl) {
  const repoPath = getRepoDir(repoUrl);
  fs.mkdirSync(repoPath, { recursive: true });

  const git = simpleGit();
  
  // Inject GitHub Token for authentication (if present)
  let authUrl = repoUrl;
  if (process.env.GITHUB_TOKEN && repoUrl.startsWith('https://github.com/')) {
    authUrl = repoUrl.replace('https://github.com/', `https://${process.env.GITHUB_TOKEN}@github.com/`);
  }

  await git.clone(authUrl, repoPath, ['--depth', '1']);

  return repoPath;
}

async function createBranch(repoPath, branchName) {
  const git = simpleGit(repoPath);
  await git.checkoutLocalBranch(branchName);
}

async function commitAndPush(repoPath, branchName, commitMessage) {
  const git = simpleGit(repoPath);

  // Set Git User Identity
  const authorName = process.env.GIT_COMMIT_AUTHOR_NAME || 'AI-AGENT';
  const authorEmail = process.env.GIT_COMMIT_AUTHOR_EMAIL || 'ai-agent@cicd-healer.dev';

  await git.addConfig('user.email', authorEmail);
  await git.addConfig('user.name', authorName);

  await git.add('.');
  
  const status = await git.status();
  if (status.files.length === 0) {
    return; // Nothing to commit
  }

  await git.commit(commitMessage);

  // Retry logic for pushing (handles network blips)
  let pushSuccess = false;
  for (let i = 0; i < 3; i++) {
    try {
      console.log(`[GIT] Pushing to ${branchName} (Attempt ${i + 1}/3)...`);
      await git.push('origin', branchName, ['--set-upstream']);
      pushSuccess = true;
      break;
    } catch (e) {
      console.warn(`[GIT] Push failed (Attempt ${i + 1}):`, e.message);
      await new Promise(r => setTimeout(r, 2000)); // Wait 2s
    }
  }

  if (!pushSuccess) {
    throw new Error('Failed to push to remote after 3 attempts');
  }
}

function cleanup(repoPath) {
  // Schedule deletion after a delay
  setTimeout(() => {
    try {
      fs.rmSync(repoPath, { recursive: true, force: true });
    } catch (e) {
      console.warn('Cleanup warning:', e.message);
    }
  }, 5000);
}

module.exports = { cloneRepo, createBranch, commitAndPush, cleanup };
