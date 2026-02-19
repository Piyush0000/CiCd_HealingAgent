/**
 * Analyzer Agent
 * Classifies each test failure into a bug type.
 */

const BUG_TYPES = {
  LINTING: 'LINTING',
  SYNTAX: 'SYNTAX',
  LOGIC: 'LOGIC',
  TYPE_ERROR: 'TYPE_ERROR',
  IMPORT: 'IMPORT',
  INDENTATION: 'INDENTATION'
};

function classifyBug(failure) {
  const msg = (failure.message || '').toLowerCase();
  const raw = (failure.rawOutput || '').toLowerCase();
  const combined = msg + ' ' + raw;

  if (combined.includes('indentationerror') || combined.includes('unexpected indent')) {
    return BUG_TYPES.INDENTATION;
  }
  if (combined.includes('importerror') || combined.includes('modulenotfounderror') || combined.includes('cannot find module') || combined.includes('no module named')) {
    return BUG_TYPES.IMPORT;
  }
  if (combined.includes('syntaxerror') || combined.includes('unexpected token') || combined.includes('missing') && combined.includes('colon')) {
    return BUG_TYPES.SYNTAX;
  }
  if (combined.includes('typeerror') || combined.includes('is not a function') || combined.includes('is not defined') || combined.includes('undefined is not')) {
    return BUG_TYPES.TYPE_ERROR;
  }
  if (combined.includes('assertionerror') || combined.includes('expected') || combined.includes('assert') || combined.includes('received')) {
    return BUG_TYPES.LOGIC;
  }
  if (combined.includes('unused') || combined.includes('eslint') || combined.includes('lint') || combined.includes('no-unused')) {
    return BUG_TYPES.LINTING;
  }

  // Default classification by message keywords
  if (combined.includes('import') || combined.includes('require')) return BUG_TYPES.IMPORT;
  if (combined.includes('syntax')) return BUG_TYPES.SYNTAX;
  if (combined.includes('type')) return BUG_TYPES.TYPE_ERROR;
  if (combined.includes('indent')) return BUG_TYPES.INDENTATION;

  return BUG_TYPES.LOGIC;
}

function analyzeFailures(failures) {
  return failures.map(failure => ({
    ...failure,
    bugType: classifyBug(failure)
  }));
}

module.exports = { analyzeFailures, classifyBug, BUG_TYPES };
