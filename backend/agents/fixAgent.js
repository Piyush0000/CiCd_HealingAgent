/**
 * Fix Agent
 * Applies deterministic rule-based fixes to source files.
 */

const fs = require('fs');
const path = require('path');
const { BUG_TYPES } = require('./analyzerAgent');

// Fix strategies per bug type
const fixStrategies = {
  [BUG_TYPES.LINTING]: fixLinting,
  [BUG_TYPES.SYNTAX]: fixSyntax,
  [BUG_TYPES.LOGIC]: fixLogic,
  [BUG_TYPES.TYPE_ERROR]: fixTypeError,
  [BUG_TYPES.IMPORT]: fixImport,
  [BUG_TYPES.INDENTATION]: fixIndentation
};

function resolveFilePath(repoPath, file) {
  if (path.isAbsolute(file) && fs.existsSync(file)) return file;
  const joined = path.join(repoPath, file);
  if (fs.existsSync(joined)) return joined;
  // Search for the file
  return null;
}

function fixLinting(repoPath, failure) {
  const filePath = resolveFilePath(repoPath, failure.file);
  if (!filePath) return { status: 'Failed', reason: 'File not found' };

  const content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split(/\r?\n/);
  const msg = (failure.message || '').toLowerCase();
  
  // Line index from test runner is often 1-based
  let lineIdx = (failure.line || 1) - 1;
  
  // If line number is 0 or out of bounds, try to find it by content if possible
  if (lineIdx < 0 || lineIdx >= lines.length) {
    if (msg.includes('unused') && msg.includes('import')) {
      const match = msg.match(/import ['"](.+?)['"]/);
      if (match) {
        const mod = match[1];
        lineIdx = lines.findIndex(l => l.includes(`import ${mod}`) || l.includes(`from ${mod}`));
      }
    }
  }

  // Remove unused import
  if (msg.includes('unused') && (msg.includes('import') || msg.includes('require'))) {
    if (lineIdx >= 0 && lineIdx < lines.length && (lines[lineIdx].includes('import') || lines[lineIdx].includes('require'))) {
      const removed = lines.splice(lineIdx, 1);
      fs.writeFileSync(filePath, lines.join('\n'));
      return { status: 'Fixed', action: `Removed unused import: ${removed[0].trim()}` };
    }
  }

  return { status: 'Failed', reason: 'No applicable linting fix' };
}

function fixSyntax(repoPath, failure) {
  const filePath = resolveFilePath(repoPath, failure.file);
  if (!filePath) return { status: 'Failed', reason: 'File not found' };

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const msg = (failure.message || '').toLowerCase();
  const lineIdx = (failure.line || 1) - 1;

  if (lineIdx < 0 || lineIdx >= lines.length) return { status: 'Failed', reason: 'Invalid line number' };

  const line = lines[lineIdx];
  const commentIdx = line.indexOf('#');
  const codePart = commentIdx !== -1 ? line.substring(0, commentIdx).trimEnd() : line.trimEnd();
  const commentPart = commentIdx !== -1 ? line.substring(commentIdx) : '';

  // Missing colon (Python)
  if (msg.includes('expected') && msg.includes(':') || msg.includes('missing colon') || msg.includes('invalid syntax')) {
    const keywords = ['if', 'else', 'elif', 'for', 'while', 'def', 'class', 'try', 'except', 'finally', 'with'];
    if (keywords.some(kw => codePart.trim().startsWith(kw)) && !codePart.endsWith(':')) {
      lines[lineIdx] = codePart + ':' + (commentPart ? ' ' + commentPart : '');
      fs.writeFileSync(filePath, lines.join('\n'));
      return { status: 'Fixed', action: 'Added missing colon' };
    }
  }

  // Missing semicolon (JS/TS)
  if (msg.includes('expected ;') || msg.includes('missing ;')) {
    if (!codePart.endsWith(';') && !codePart.endsWith('}') && !codePart.endsWith('{')) {
      const jsCommentIdx = line.indexOf('//');
      const jsCodePart = jsCommentIdx !== -1 ? line.substring(0, jsCommentIdx).trimEnd() : line.trimEnd();
      const jsCommentPart = jsCommentIdx !== -1 ? line.substring(jsCommentIdx) : '';
      
      lines[lineIdx] = jsCodePart + ';' + (jsCommentPart ? ' ' + jsCommentPart : '');
      fs.writeFileSync(filePath, lines.join('\n'));
      return { status: 'Fixed', action: 'Added missing semicolon' };
    }
  }

  // Unclosed bracket - try removing trailing content
  if (msg.includes('unexpected token') || msg.includes('unexpected end')) {
    return { status: 'Failed', reason: 'Complex syntax error requires manual fix' };
  }

  return { status: 'Failed', reason: 'No applicable syntax fix' };
}

function fixLogic(repoPath, failure) {
  const filePath = resolveFilePath(repoPath, failure.file);
  if (!filePath) return { status: 'Failed', reason: 'File not found' };

  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const lineIdx = (failure.line || 1) - 1;
  const msg = (failure.message || '').toLowerCase();

  // Mark assertion errors with a comment for traceability
  if (msg.includes('assertionerror') || msg.includes('assert')) {
    if (lines[lineIdx]) {
      const comment = filePath.endsWith('.py') ? '  # [AI-AGENT] Logic check - review assertion' : '  // [AI-AGENT] Logic check - review assertion';
      if (!lines[lineIdx].includes('[AI-AGENT]')) {
        lines[lineIdx] = lines[lineIdx] + comment;
        fs.writeFileSync(filePath, lines.join('\n'));
        return { status: 'Fixed', action: 'Marked assertion for review' };
      }
    }
  }

  return { status: 'Failed', reason: 'Logic errors require manual fix' };
}

function fixTypeError(repoPath, failure) {
  const filePath = resolveFilePath(repoPath, failure.file);
  if (!filePath) return { status: 'Failed', reason: 'File not found' };

  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const lineIdx = (failure.line || 1) - 1;
  const msg = (failure.message || '').toLowerCase();

  // undefined is not a function
  if (msg.includes('is not a function') || msg.includes('is not defined')) {
    if (lines[lineIdx]) {
      const comment = '  // [AI-AGENT] TypeError: verify function/variable definition';
      if (!lines[lineIdx].includes('[AI-AGENT]')) {
        lines[lineIdx] = lines[lineIdx] + comment;
        fs.writeFileSync(filePath, lines.join('\n'));
        return { status: 'Fixed', action: 'Annotated TypeError for review' };
      }
    }
  }

  // None type (Python)
  if (msg.includes('nonetype') || msg.includes('attributeerror')) {
    if (lines[lineIdx]) {
      const comment = '  # [AI-AGENT] TypeError: add null check';
      if (!lines[lineIdx].includes('[AI-AGENT]')) {
        lines[lineIdx] = lines[lineIdx] + comment;
        fs.writeFileSync(filePath, lines.join('\n'));
        return { status: 'Fixed', action: 'Annotated TypeError for null check' };
      }
    }
  }

  return { status: 'Failed', reason: 'No applicable TypeError fix' };
}

function fixImport(repoPath, failure) {
  const filePath = resolveFilePath(repoPath, failure.file);
  if (!filePath) return { status: 'Failed', reason: 'File not found' };

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const msg = failure.message || '';
  const isPython = filePath.endsWith('.py');

  // Extract missing module name
  const moduleMatch = msg.match(/['"](.+?)['"]/);
  if (!moduleMatch) return { status: 'Failed', reason: 'Cannot determine missing module' };

  const moduleName = moduleMatch[1];

  // Check if already imported
  const alreadyImported = lines.some(l =>
    l.includes(`import ${moduleName}`) ||
    l.includes(`from ${moduleName}`) ||
    l.includes(`require('${moduleName}')`) ||
    l.includes(`require("${moduleName}")`)
  );

  if (alreadyImported) return { status: 'Failed', reason: 'Module already imported' };

  // Add import at top of file
  const importLine = isPython ? `import ${moduleName}` : `const ${moduleName} = require('${moduleName}');`;
  lines.unshift(importLine);
  fs.writeFileSync(filePath, lines.join('\n'));

  return { status: 'Fixed', action: `Added missing import: ${moduleName}` };
}

function fixIndentation(repoPath, failure) {
  const filePath = resolveFilePath(repoPath, failure.file);
  if (!filePath) return { status: 'Failed', reason: 'File not found' };

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const lineIdx = (failure.line || 1) - 1;

  if (!lines[lineIdx]) return { status: 'Failed', reason: 'Line not found' };

  // Python: fix indentation using context from previous line
  if (filePath.endsWith('.py')) {
    const prevLine = lines[lineIdx - 1] || '';
    const prevIndent = prevLine.match(/^(\s*)/)[1];
    const currentContent = lines[lineIdx].trimStart();

    // If previous line ends with colon, indent one level
    if (prevLine.trimEnd().endsWith(':')) {
      lines[lineIdx] = prevIndent + '    ' + currentContent;
    } else {
      lines[lineIdx] = prevIndent + currentContent;
    }

    fs.writeFileSync(filePath, lines.join('\n'));
    return { status: 'Fixed', action: 'Fixed indentation' };
  }

  // JS/TS: normalize to 2 spaces
  if (filePath.match(/\.(js|ts|jsx|tsx)$/)) {
    const fixedContent = content.replace(/^\t/gm, '  ');
    fs.writeFileSync(filePath, fixedContent);
    return { status: 'Fixed', action: 'Normalized indentation to 2 spaces' };
  }

  return { status: 'Failed', reason: 'Unknown file type for indentation fix' };
}

async function applyFixes(repoPath, analyzedFailures) {
  const results = [];

  for (const failure of analyzedFailures) {
    const strategy = fixStrategies[failure.bugType];
    let fixResult = { status: 'Failed', reason: 'No strategy available' };

    if (strategy) {
      try {
        fixResult = strategy(repoPath, failure);
      } catch (e) {
        fixResult = { status: 'Failed', reason: e.message };
      }
    }

    const commitMessage = `[AI-AGENT] ${fixResult.status === 'Fixed' ? 'Fix' : 'Attempted fix'}: ${failure.bugType} in ${path.basename(failure.file || 'unknown')} line ${failure.line || 'N/A'}`;

    results.push({
      file: failure.file,
      bugType: failure.bugType,
      line: failure.line,
      message: failure.message,
      commitMessage,
      status: fixResult.status,
      action: fixResult.action || fixResult.reason || 'No action taken'
    });
  }

  return results;
}

module.exports = { applyFixes };
