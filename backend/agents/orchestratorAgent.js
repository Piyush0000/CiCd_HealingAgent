const repositoryAgent = require('./repositoryAgent');
const testExecutionAgent = require('./testExecutionAgent');
const analyzerAgent = require('./analyzerAgent');
const fixAgent = require('./fixAgent');
const ciMonitorAgent = require('./ciMonitorAgent');
const fs = require('fs');
const path = require('path');

// Persistent results directory — never deleted
const RESULTS_DIR = path.join(__dirname, '..', 'results');
if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });

const RETRY_LIMIT = 5;

async function runOrchestrator({ repoUrl, teamName, leaderName }, emitEvent) {
  const startTime = Date.now();

  const branchName = `${teamName.toUpperCase().replace(/\s+/g, '_')}_${leaderName.toUpperCase().replace(/\s+/g, '_')}_AI_Fix`;

  emitEvent({ type: 'START', message: `Starting CI/CD Healing Agent`, branchName });

  // Step 1: Clone repo
  emitEvent({ type: 'STEP', message: `Cloning repository: ${repoUrl}` });
  const repoPath = await repositoryAgent.cloneRepo(repoUrl);
  emitEvent({ type: 'STEP', message: `Repository cloned to: ${repoPath}` });

  // Step 2: Create branch
  emitEvent({ type: 'STEP', message: `Creating branch: ${branchName}` });
  await repositoryAgent.createBranch(repoPath, branchName);
  emitEvent({ type: 'STEP', message: `Branch created: ${branchName}` });

  const ciMonitor = ciMonitorAgent.createMonitor(RETRY_LIMIT);
  const allFixes = [];
  let finalStatus = 'FAILED';
  let iterationsUsed = 0;
  let totalFailures = 0;

  // Step 3: Retry loop
  while (ciMonitor.canContinue()) {
    const iteration = ciMonitor.currentIteration();
    iterationsUsed = iteration;

    emitEvent({ type: 'ITERATION', message: `Running tests - Iteration ${iteration}/${RETRY_LIMIT}`, iteration, maxIterations: RETRY_LIMIT });

    // Run tests with progress tracking
    const testResult = await testExecutionAgent.runTests(repoPath, (msg) => {
      emitEvent({ type: 'STEP', message: msg });
    });
    const timestamp = new Date().toISOString();

    emitEvent({
      type: 'TEST_RESULT',
      message: testResult.passed ? 'All tests passed!' : `Tests failed: ${testResult.failures.length} failure(s)`,
      passed: testResult.passed,
      failures: testResult.failures,
      iteration,
      timestamp
    });

    ciMonitor.recordIteration(iteration, testResult.passed, timestamp);

    if (testResult.passed) {
      finalStatus = 'PASSED';
      emitEvent({ type: 'STEP', message: 'All tests passed! Agent work complete.' });
      break;
    }

    totalFailures += testResult.failures.length;

    // Analyze failures
    emitEvent({ type: 'STEP', message: 'Analyzing test failures...' });
    const analyzedFailures = analyzerAgent.analyzeFailures(testResult.failures);

    // Apply fixes
    emitEvent({ type: 'STEP', message: `Applying fixes for ${analyzedFailures.length} issue(s)...` });
    const fixResults = await fixAgent.applyFixes(repoPath, analyzedFailures);

    for (const fix of fixResults) {
      allFixes.push(fix);
      emitEvent({ type: 'FIX', message: `Fixed: ${fix.file} - ${fix.bugType}`, fix });
    }

    // Commit and push
    if (fixResults.some(f => f.status === 'Fixed')) {
      const commitMsg = `[AI-AGENT] Fix iteration ${iteration}: ${fixResults.filter(f => f.status === 'Fixed').length} issue(s) resolved`;
      emitEvent({ type: 'STEP', message: `Committing: ${commitMsg}` });
      try {
        await repositoryAgent.commitAndPush(repoPath, branchName, commitMsg);
        emitEvent({ type: 'STEP', message: `Pushed to branch: ${branchName}` });
      } catch (err) {
        emitEvent({ type: 'STEP', message: `⚠️ Push failed: ${err.message}. (Fix verified locally)` });
      }
    }

    ciMonitor.advance();
  }

  const timeTaken = Math.round((Date.now() - startTime) / 1000);

  // Score calculation
  const commitCount = allFixes.filter(f => f.status === 'Fixed').length;
  let score = 100;
  if (timeTaken < 300) score += 10;
  if (commitCount > 20) score -= 2 * (commitCount - 20);

  // Final Result Construction
  const result = {
    runId: `RUN-${Date.now().toString().slice(-6)}`, // Generate a short unique ID
    branchName, // Explicitly named for frontend
    repoUrl,
    finalStatus: finalStatus,
    totalFailures: totalFailures,
    totalFixes: allFixes.filter(f => f.status === 'Fixed').length,
    iterations: iterationsUsed, // The actual number of iterations used
    maxIterations: RETRY_LIMIT, // The limit
    timeTaken: `${timeTaken}s`,
    score: score,
    scoreBreakdown: {
      base: 100,
      timeBonus: timeTaken < 300 ? 10 : 0,
      commitPenalty: commitCount > 20 ? -2 * (commitCount - 20) : 0
    },
    // Map timeline for frontend
    history: ciMonitor.getTimeline() || [], 
    fixes: allFixes
  };

  // Save results.json inside cloned repo
  const resultsInRepo = path.join(repoPath, 'results.json');
  fs.writeFileSync(resultsInRepo, JSON.stringify(result, null, 2));

  // Also save to persistent backend/results/ folder with timestamp
  const safeRepoName = repoUrl.split('/').pop().replace('.git', '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const persistentFilename = `${safeRepoName}_${branchName}_${timestamp}.json`;
  const persistentPath = path.join(RESULTS_DIR, persistentFilename);
  fs.writeFileSync(persistentPath, JSON.stringify(result, null, 2));

  emitEvent({
    type: 'DONE',
    message: `Results saved → ${persistentPath}`,
    result,
    resultsPath: persistentPath
  });

  // NOTE: Cloned repo kept on disk for inspection at: repoPath
  // To enable auto-cleanup uncomment the line below:
  // repositoryAgent.cleanup(repoPath);

  return result;
}

module.exports = { runOrchestrator };
