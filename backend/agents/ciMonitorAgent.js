/**
 * CI Monitor Agent
 * Tracks iteration counts, records pass/fail per iteration, provides timeline.
 */

function createMonitor(retryLimit = 5) {
  let iteration = 1;
  const timeline = [];

  function canContinue() {
    return iteration <= retryLimit;
  }

  function currentIteration() {
    return iteration;
  }

  function recordIteration(iter, passed, timestamp) {
    timeline.push({
      iteration: iter,
      status: passed ? 'PASSED' : 'FAILED',
      timestamp: timestamp || new Date().toISOString()
    });
  }

  function advance() {
    iteration++;
  }

  function getTimeline() {
    return timeline;
  }

  return { canContinue, currentIteration, recordIteration, advance, getTimeline };
}

module.exports = { createMonitor };
