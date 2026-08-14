/**
 * Safety Parser & Command Evaluator
 * Inspects multi-stage piped CLI commands to determine if they contain destructive operations.
 */

import { DESTRUCTIVE_PATTERNS, RISK_LEVELS, extractCommandVerb } from './commandRegistry.js';

export function evaluateCommandSafety(fullCommand) {
  if (!fullCommand || typeof fullCommand !== 'string') {
    return {
      isDestructive: false,
      riskLevel: RISK_LEVELS.SAFE,
      reason: 'Empty command',
      matchedSegment: '',
      primaryVerbs: [],
    };
  }

  // Split by pipe operator while respecting quoted strings
  const pipeSegments = splitPipes(fullCommand);
  const primaryVerbs = pipeSegments.map(seg => extractCommandVerb(seg)).filter(Boolean);

  // Check full command against destructive pattern database
  for (const item of DESTRUCTIVE_PATTERNS) {
    if (item.pattern.test(fullCommand)) {
      return {
        isDestructive: true,
        riskLevel: item.risk,
        reason: item.reason,
        matchedSegment: fullCommand,
        primaryVerbs,
      };
    }
  }

  // Check individual pipe segments for subtle hidden sub-commands
  for (const segment of pipeSegments) {
    const verb = extractCommandVerb(segment);

    // Destructive verbs check
    if (['rm', 'mkfs', 'dd', 'shutdown', 'reboot', 'init'].includes(verb)) {
      if (verb === 'rm' && (segment.includes('-r') || segment.includes('-f') || segment.includes('*'))) {
        return {
          isDestructive: true,
          riskLevel: RISK_LEVELS.DESTRUCTIVE_OBVIOUS,
          reason: 'Recursive or forced file deletion (rm -r / rm -f)',
          matchedSegment: segment,
          primaryVerbs,
        };
      }
      if (verb === 'dd' || verb === 'mkfs') {
        return {
          isDestructive: true,
          riskLevel: RISK_LEVELS.DESTRUCTIVE_OBVIOUS,
          reason: `Low-level disk format / raw block write (${verb})`,
          matchedSegment: segment,
          primaryVerbs,
        };
      }
    }

    // Check for inline python/node traps
    if (verb === 'python' || verb === 'python3' || verb === 'node' || verb === 'perl') {
      if (/(system|rmtree|unlink|remove|rmSync|unlinkSync|execSync|child_process|eval)/i.test(segment)) {
        if (/(rm\s+-rf|drop\s+database|unlink|remove|delete)/i.test(segment)) {
          return {
            isDestructive: true,
            riskLevel: RISK_LEVELS.DESTRUCTIVE_INLINE,
            reason: `Destructive system call inside inline ${verb} script!`,
            matchedSegment: segment,
            primaryVerbs,
          };
        }
      }
    }
  }

  return {
    isDestructive: false,
    riskLevel: RISK_LEVELS.SAFE,
    reason: 'Verified safe command workflow',
    matchedSegment: '',
    primaryVerbs,
  };
}

/**
 * Split command string by pipe character '|', respecting single/double quotes
 */
function splitPipes(cmd) {
  const result = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < cmd.length; i++) {
    const char = cmd[i];
    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
    } else if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
    }

    if (char === '|' && !inSingleQuote && !inDoubleQuote) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    result.push(current.trim());
  }
  return result;
}
