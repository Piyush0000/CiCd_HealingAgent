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

  try {
    await git.push('origin', branchName, ['--set-upstream']);
  } catch (e) {
    console.warn('Push warning:', e.message);
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
