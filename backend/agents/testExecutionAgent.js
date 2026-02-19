const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function detectTestRunner(repoPath) {
  const pkgPath = path.join(repoPath, 'package.json');
  const requirementsTxt = path.join(repoPath, 'requirements.txt');
  const setupPy = path.join(repoPath, 'setup.py');
  const pyprojectToml = path.join(repoPath, 'pyproject.toml');

  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const scripts = pkg.scripts || {};
    if (scripts.test) return { runner: 'npm', command: 'npm test -- --watchAll=false --passWithNoTests 2>&1', type: 'node' };
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps['jest']) return { runner: 'jest', command: 'npx jest --watchAll=false 2>&1', type: 'node' };
    if (deps['mocha']) return { runner: 'mocha', command: 'npx mocha 2>&1', type: 'node' };
    if (deps['vitest']) return { runner: 'vitest', command: 'npx vitest run 2>&1', type: 'node' };
  }

  if (fs.existsSync(requirementsTxt) || fs.existsSync(setupPy) || fs.existsSync(pyprojectToml)) {
    return { runner: 'pytest', command: 'python -m pytest --tb=short 2>&1', type: 'python' };
  }

  return { runner: 'unknown', command: null, type: 'unknown' };
}

function parseNodeTestOutput(output) {
  const failures = [];
  const lines = output.split('\n');

  // Jest pattern
  const jestFailPattern = /● (.+)/;
  const jestFilePattern = /at .+ \((.+):(\d+):\d+\)/;
  const jestExpectPattern = /expect\((.+)\)\.(.+)/;

  // General error patterns
  const errorPattern = /FAIL\s+(.+\.(?:js|ts|jsx|tsx|spec\.\w+|test\.\w+))/i;
  const assertionPattern = /AssertionError|assert\.(\w+)|Expected|received/i;
  const linePattern = /\((.+):(\d+):\d+\)/;
  const syntaxPattern = /SyntaxError:/i;
  const typePattern = /TypeError:/i;
  const importPattern = /Cannot find module|require\('(.+)'\)|import .+ from/i;

  let currentFile = 'unknown';
  let currentLine = 0;
  let currentError = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const errorFileMatch = errorPattern.exec(line);
    if (errorFileMatch) {
      currentFile = errorFileMatch[1];
    }

    const lineMatch = linePattern.exec(line);
    if (lineMatch) {
      currentFile = lineMatch[1];
      currentLine = parseInt(lineMatch[2], 10);
    }

    if (syntaxPattern.test(line)) {
      failures.push({
        file: currentFile,
        line: currentLine,
        message: line.trim(),
        rawOutput: lines.slice(Math.max(0, i - 2), i + 5).join('\n')
      });
    } else if (typePattern.test(line)) {
      failures.push({
        file: currentFile,
        line: currentLine,
        message: line.trim(),
        rawOutput: lines.slice(Math.max(0, i - 2), i + 5).join('\n')
      });
    } else if (importPattern.test(line) && line.includes('Error')) {
      failures.push({
        file: currentFile,
        line: currentLine,
        message: line.trim(),
        rawOutput: lines.slice(Math.max(0, i - 2), i + 5).join('\n')
      });
    } else if (assertionPattern.test(line) && line.includes('Error')) {
      failures.push({
        file: currentFile,
        line: currentLine,
        message: line.trim(),
        rawOutput: lines.slice(Math.max(0, i - 2), i + 5).join('\n')
      });
    }
  }

  return failures;
}

function parsePythonTestOutput(output) {
  const failures = [];
  const lines = output.split('\n');

  const failPattern = /FAILED (.+\.py)::(.+)/;
  const errorPattern = /ERROR (.+\.py)::(.+)/;
  const fileLinePattern = /File "(.+\.py)", line (\d+)/;
  const exceptionPattern = /(SyntaxError|IndentationError|ImportError|ModuleNotFoundError|TypeError|AssertionError|NameError): (.+)/;

  let currentFile = 'unknown';
  let currentLine = 0;
  let currentException = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const failMatch = failPattern.exec(line) || errorPattern.exec(line);
    if (failMatch) {
      currentFile = failMatch[1];
    }

    const fileLineMatch = fileLinePattern.exec(line);
    if (fileLineMatch) {
      currentFile = fileLineMatch[1];
      currentLine = parseInt(fileLineMatch[2], 10);
    }

    const exceptionMatch = exceptionPattern.exec(line);
    if (exceptionMatch) {
      currentException = line.trim();
      failures.push({
        file: currentFile,
        line: currentLine,
        message: currentException,
        rawOutput: lines.slice(Math.max(0, i - 5), i + 3).join('\n')
      });
    }
  }

  return failures;
}

async function runTests(repoPath, onProgress = () => {}) {
  const { runner, command, type } = detectTestRunner(repoPath);

  if (!command) {
    return {
      passed: true,
      failures: [],
      output: 'No test runner detected. Considering as passed.',
      runner: 'none'
    };
  }

  try {
    // Install dependencies first if node project
    if (type === 'node' && fs.existsSync(path.join(repoPath, 'package.json'))) {
      onProgress('Installing dependencies (npm install)... this may take a minute');
      try {
        execSync('npm install --prefer-offline --no-audit --no-fund --loglevel=error 2>&1', {
          cwd: repoPath,
          timeout: 300000, // 5 minute limit for install
          stdio: 'pipe'
        });
        onProgress('Dependencies installed successfully');
      } catch (e) {
        onProgress('Warning: npm install had some issues, but attempting to run tests anyway');
      }
    }

    onProgress(`Executing test runner: ${runner}`);
    const result = spawnSync(command, {
      cwd: repoPath,
      shell: true,
      timeout: 180000,
      encoding: 'utf8'
    });

    const output = (result.stdout || '') + (result.stderr || '');
    const passed = result.status === 0;

    let failures = [];
    if (!passed) {
      if (type === 'node') {
        failures = parseNodeTestOutput(output);
      } else if (type === 'python') {
        failures = parsePythonTestOutput(output);
      }

      // If parsing found no structured failures, create a generic one
      if (failures.length === 0 && !passed) {
        failures.push({
          file: 'unknown',
          line: 0,
          message: output.split('\n').find(l => l.includes('Error') || l.includes('FAIL') || l.includes('failed')) || 'Test suite failed',
          rawOutput: output.slice(0, 500)
        });
      }
    }

    return { passed, failures, output: output.slice(0, 3000), runner };
  } catch (e) {
    return {
      passed: false,
      failures: [{
        file: 'unknown',
        line: 0,
        message: e.message,
        rawOutput: e.message
      }],
      output: e.message,
      runner
    };
  }
}

module.exports = { runTests, detectTestRunner };
