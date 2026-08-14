/**
 * Command Registry & Dictionary Management
 * Centralized database for CLI commands, safe/destructive building blocks, and safety metadata.
 */

export const COMMAND_CATEGORIES = {
  FILE_OPS: 'file_ops',
  LOG_ANALYSIS: 'log_analysis',
  SYS_ADMIN: 'sys_admin',
  GIT_OPS: 'git_ops',
  DEVOPS_CONTAINER: 'devops_container',
  SCRIPT_RUNTIMES: 'script_runtimes',
  DATABASE: 'database',
};

export const RISK_LEVELS = {
  SAFE: 'SAFE',
  DESTRUCTIVE_OBVIOUS: 'DESTRUCTIVE_OBVIOUS',
  DESTRUCTIVE_SUBTLE: 'DESTRUCTIVE_SUBTLE',
  DESTRUCTIVE_INLINE: 'DESTRUCTIVE_INLINE',
};

// Safe command verbs and common sub-arguments for pipeline construction
export const SAFE_COMMAND_VERBS = [
  { verb: 'cat', category: COMMAND_CATEGORIES.FILE_OPS, desc: 'Concatenate and print files' },
  { verb: 'grep', category: COMMAND_CATEGORIES.LOG_ANALYSIS, desc: 'Search pattern in input' },
  { verb: 'find', category: COMMAND_CATEGORIES.FILE_OPS, desc: 'Search for files in a directory hierarchy' },
  { verb: 'awk', category: COMMAND_CATEGORIES.LOG_ANALYSIS, desc: 'Pattern scanning and processing language' },
  { verb: 'sed', category: COMMAND_CATEGORIES.LOG_ANALYSIS, desc: 'Stream editor for filtering and transforming text' },
  { verb: 'sort', category: COMMAND_CATEGORIES.LOG_ANALYSIS, desc: 'Sort lines of text files' },
  { verb: 'uniq', category: COMMAND_CATEGORIES.LOG_ANALYSIS, desc: 'Report or omit repeated lines' },
  { verb: 'head', category: COMMAND_CATEGORIES.FILE_OPS, desc: 'Output the first part of files' },
  { verb: 'tail', category: COMMAND_CATEGORIES.FILE_OPS, desc: 'Output the last part of files' },
  { verb: 'wc', category: COMMAND_CATEGORIES.LOG_ANALYSIS, desc: 'Print newline, word, and byte counts' },
  { verb: 'tar', category: COMMAND_CATEGORIES.FILE_OPS, desc: 'An archiving utility' },
  { verb: 'gzip', category: COMMAND_CATEGORIES.FILE_OPS, desc: 'Compress or expand files' },
  { verb: 'curl', category: COMMAND_CATEGORIES.SYS_ADMIN, desc: 'Transfer data from or to a server' },
  { verb: 'jq', category: COMMAND_CATEGORIES.LOG_ANALYSIS, desc: 'Commandline JSON processor' },
  { verb: 'ps', category: COMMAND_CATEGORIES.SYS_ADMIN, desc: 'Report a snapshot of current processes' },
  { verb: 'df', category: COMMAND_CATEGORIES.SYS_ADMIN, desc: 'Report file system disk space usage' },
  { verb: 'du', category: COMMAND_CATEGORIES.SYS_ADMIN, desc: 'Estimate file space usage' },
  { verb: 'git', category: COMMAND_CATEGORIES.GIT_OPS, desc: 'Distributed version control system' },
  { verb: 'docker', category: COMMAND_CATEGORIES.DEVOPS_CONTAINER, desc: 'Container runtime CLI' },
  { verb: 'kubectl', category: COMMAND_CATEGORIES.DEVOPS_CONTAINER, desc: 'Kubernetes cluster control CLI' },
  { verb: 'python3', category: COMMAND_CATEGORIES.SCRIPT_RUNTIMES, desc: 'Python 3 interpreter' },
  { verb: 'node', category: COMMAND_CATEGORIES.SCRIPT_RUNTIMES, desc: 'Node.js JavaScript runtime' },
];

// Destructive command signatures used for evaluation and high-level generation
export const DESTRUCTIVE_PATTERNS = [
  {
    pattern: /\brm\s+-[a-zA-Z]*r[a-zA-Z]*f?\b|\brm\s+-[a-zA-Z]*f[a-zA-Z]*r?\b|\brm\s+.*--no-preserve-root/i,
    risk: RISK_LEVELS.DESTRUCTIVE_OBVIOUS,
    reason: 'Catastrophic file removal flag (-rf / --no-preserve-root)',
  },
  {
    pattern: /\bdd\s+if=.*of=\/dev\/(sd[a-z]|nvme[0-n]|hd[a-z]|disk[0-9])/i,
    risk: RISK_LEVELS.DESTRUCTIVE_OBVIOUS,
    reason: 'Raw disk drive partition overwrite (dd of=/dev/sdX)',
  },
  {
    pattern: /\bmkfs(\.[a-z0-9]+)?\s+\/dev\//i,
    risk: RISK_LEVELS.DESTRUCTIVE_OBVIOUS,
    reason: 'Filesystem format operation on disk partition',
  },
  {
    pattern: /:\(\)\{\s*:\|:&\s*\};:/,
    risk: RISK_LEVELS.DESTRUCTIVE_OBVIOUS,
    reason: 'Shell Fork Bomb (denial of service attack payload)',
  },
  {
    pattern: /\bchmod\s+(-R\s+)?777\s+(\/|\/etc|\/var|\/usr|\/home)/i,
    risk: RISK_LEVELS.DESTRUCTIVE_OBVIOUS,
    reason: 'Global permission wipe on system root directory (chmod 777 -R)',
  },
  {
    pattern: /\bfind\s+.*-delete\b/i,
    risk: RISK_LEVELS.DESTRUCTIVE_SUBTLE,
    reason: 'Subtle file deletion flag embedded in find command (-delete)',
  },
  {
    pattern: /\brsync\s+.*--delete\b/i,
    risk: RISK_LEVELS.DESTRUCTIVE_SUBTLE,
    reason: 'Subtle remote directory mirror wiping flag (--delete)',
  },
  {
    pattern: /\bgit\s+clean\s+-[a-zA-Z]*f[a-zA-Z]*x?\b/i,
    risk: RISK_LEVELS.DESTRUCTIVE_SUBTLE,
    reason: 'Unrecoverable git repository untracked file wipe (git clean -fdx)',
  },
  {
    pattern: /\bgit\s+reset\s+--hard\b/i,
    risk: RISK_LEVELS.DESTRUCTIVE_SUBTLE,
    reason: 'Destructive git commit history & working directory discard',
  },
  {
    pattern: />\s*\/dev\/(sd[a-z]|nvme[0-9]|sda[0-9]|etc\/passwd|etc\/shadow)/i,
    risk: RISK_LEVELS.DESTRUCTIVE_SUBTLE,
    reason: 'Sneaky stdout redirection overwriting vital system file or disk',
  },
  {
    pattern: /base64\s+(-d|--decode)\s*\|\s*(ba)?sh/i,
    risk: RISK_LEVELS.DESTRUCTIVE_SUBTLE,
    reason: 'Obfuscated Base64 shell execution wrapper (base64 -d | sh)',
  },
  {
    pattern: /python[3]?\s+-c\s+['"].*(import\s+os|import\s+shutil|os\.system|shutil\.rmtree|os\.remove|os\.unlink).*['"]/i,
    risk: RISK_LEVELS.DESTRUCTIVE_INLINE,
    reason: 'Destructive Python one-liner inline script (os.system / shutil.rmtree)',
  },
  {
    pattern: /node\s+-e\s+['"].*(fs\.rmSync|fs\.unlinkSync|child_process|execSync).*['"]/i,
    risk: RISK_LEVELS.DESTRUCTIVE_INLINE,
    reason: 'Destructive Node.js one-liner inline script (fs.rmSync / child_process)',
  },
];

/**
 * Extract primary command verb from a pipe segment string
 */
export function extractCommandVerb(pipeSegment) {
  if (!pipeSegment) return '';
  const trimmed = pipeSegment.trim();
  // Handle environment variables or subshells at start
  const words = trimmed.replace(/^([A-Z_]+=\S+\s+)*/, '').split(/\s+/);
  if (words.length === 0) return '';
  
  let firstWord = words[0];
  // Handle path prefixes like /usr/bin/grep
  if (firstWord.includes('/')) {
    firstWord = firstWord.split('/').pop();
  }
  return firstWord.toLowerCase();
}
