const { runOrchestrator } = require('./agents/orchestratorAgent');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'test_output.txt');
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
  console.log(msg);
}

async function test() {
  log('Starting test run...');
  try {
    const repoPath = 'D:/pwioi/test-repo';
    log(`Using repo path: ${repoPath}`);
    
    const result = await runOrchestrator(
      { 
        repoUrl: repoPath, 
        teamName: 'Botzilla', 
        leaderName: 'Dani Daniels' 
      }, 
      (e) => log(`[${e.type}] ${e.message}`)
    );
    
    log('--- RESULT ---');
    log(JSON.stringify(result, null, 2));
    log('SUCCESS');
  } catch (err) {
    log(`ERROR: ${err.message}`);
    log(err.stack);
  }
}

test();
