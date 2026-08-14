/**
 * Procedural Command Generator & Pipe Builder
 * Generates pipe-connected CLI commands with level-scaling length, argument complexity, and sneaky traps.
 */

import { AI_SCENARIOS } from './scenarios.js';
import { evaluateCommandSafety } from './commandEvaluator.js';

// Safe pipe segments pool by stage position
const SAFE_SEGMENTS = {
  STARTERS: [
    'cat /var/log/syslog',
    'cat /var/log/nginx/access.log',
    'find . -maxdepth 3 -name "*.log"',
    'find /var/app/data -type f',
    'ps aux',
    'df -h',
    'du -sh /var/cache/*',
    'curl -s http://api.internal/health',
    'git status --porcelain',
    'docker ps -a',
    'kubectl get pods -n production',
    'cat config.json',
  ],
  FILTERS: [
    'grep -E "ERROR|WARN|CRITICAL"',
    'grep -v "DEBUG"',
    'sed "s/password=.*/password=***/g"',
    'awk \'{print $1, $3, $5}\'',
    'awk \'{print $2, $11}\'',
    'jq \'.items[] | {name: .name, status: .status}\'',
    'cut -d" " -f2,4',
  ],
  TRANSFORMS: [
    'sort -rh',
    'sort -n',
    'uniq -c',
    'head -n 10',
    'tail -n 20',
    'wc -l',
    'gzip -c',
    'tar -czf /tmp/backup.tar.gz -',
  ],
  SAFE_SCRIPT_INLINES: [
    'python3 -c "import sys, json; print(len(json.load(sys.stdin)))"',
    'python3 -c "import sys; print(\'[\', \', \'.join(sys.stdin.read().split()), \']\')"',
    'node -e "process.stdin.on(\'data\', d => console.log(d.toString().trim()))"',
  ],
};

// Subtle destructive traps grouped by difficulty level
const DESTRUCTIVE_TRAPS = {
  LEVEL_1_TO_3: [
    { cmd: 'rm -rf /', reason: 'Direct catastrophic system root removal (rm -rf /)' },
    { cmd: 'rm -rf /var/www/*', reason: 'Forced web application root deletion (rm -rf /var/www/*)' },
    { cmd: 'dd if=/dev/urandom of=/dev/sda bs=1M', reason: 'Overwriting raw primary disk /dev/sda' },
    { cmd: 'mkfs.ext4 /dev/nvme0n1p1', reason: 'Formatting main system NVMe partition' },
  ],
  LEVEL_4_TO_6: [
    { cmd: 'find /var/log -type f -name "*.log" -delete', reason: 'Subtle -delete flag wiping all active log files' },
    { cmd: 'rsync -av --delete /empty_dir/ /home/user/app/', reason: 'Subtle --delete flag mirroring empty folder over user app' },
    { cmd: 'git clean -fdx', reason: 'Unrecoverable repository untracked files wipe (git clean -fdx)' },
    { cmd: 'git reset --hard HEAD~50', reason: 'Forced discard of last 50 commits and local edits' },
  ],
  LEVEL_7_TO_9: [
    { cmd: 'cat metrics.log > /dev/sda', reason: 'Sneaky stdout redirection overwriting raw storage device /dev/sda' },
    { cmd: 'cat payload.txt > /etc/passwd', reason: 'Sneaky stdout redirection overwriting system /etc/passwd' },
    { cmd: 'chmod -R 777 /', reason: 'Global system permissions wide-open security disaster' },
    { cmd: 'rm -rf .*', reason: 'Dangerous wildcard expanding to delete parent directory (rm -rf .*)' },
  ],
  LEVEL_10_TO_14: [
    { cmd: 'echo "cm0gLXJmIC8=" | base64 -d | sh', reason: 'Obfuscated Base64 payload decoding directly into shell execution' },
    { cmd: 'cat config.json | jq "." $(rm -rf /)', reason: 'Command substitution shell injection inside subshell $(rm -rf /)' },
    { cmd: 'eval $(echo "cm0gLXJmIC8=" | base64 -d)', reason: 'Obfuscated eval executing decoded destructive string' },
  ],
  LEVEL_15_PLUS: [
    { cmd: 'python3 -c "import os; os.system(\'rm -rf /\')"', reason: 'Inline Python script trap executing os.system(\'rm -rf /\')' },
    { cmd: 'python3 -c "import shutil; shutil.rmtree(\'/var/www\')"', reason: 'Inline Python script trap executing shutil.rmtree' },
    { cmd: 'node -e "require(\'fs\').rmSync(\'/\', {recursive:true, force:true})"', reason: 'Inline Node.js script trap executing fs.rmSync' },
  ],
};

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate next command based on scenario progression or procedural random level scaling
 */
export function generateNextCommand(level, scenarioIndex = 0, scenarioStep = 0) {
  // 50% chance to follow a structured scenario if scenario index is active
  if (scenarioIndex < AI_SCENARIOS.length) {
    const scenario = AI_SCENARIOS[scenarioIndex];
    if (scenarioStep < scenario.steps.length) {
      const step = scenario.steps[scenarioStep];
      let commandText = step.isDestructive ? step.destructiveCommand : step.safeCommand;
      
      // Add level-scaled complexity (pipe depth) even to scenario commands at higher levels!
      if (level > 3 && !step.isDestructive) {
        commandText = appendLevelComplexity(commandText, level);
      }

      const evalResult = evaluateCommandSafety(commandText);
      return {
        commandText,
        isDestructive: step.isDestructive || evalResult.isDestructive,
        reason: step.destructiveReason || evalResult.reason,
        scenarioLog: step.log,
        scenarioTitle: scenario.title,
        level,
        isScenarioStep: true,
        scenarioIndex,
        scenarioStep,
      };
    }
  }

  // Procedural command generation scaled by level
  const shouldBeDestructive = Math.random() < 0.32; // ~32% chance
  let pipeSegments = [];
  let logMessage = `[AGENT LOG] Level ${level}: Processing system maintenance pipeline...`;

  // Determine pipe length based on level
  let numPipes = 2;
  if (level >= 3) numPipes = 3;
  if (level >= 6) numPipes = 4;
  if (level >= 10) numPipes = 5;
  if (level >= 15) numPipes = 6 + Math.floor(Math.random() * 2);

  // Starter command
  pipeSegments.push(getRandomItem(SAFE_SEGMENTS.STARTERS));

  // Intermediate filters & transforms
  for (let i = 1; i < numPipes; i++) {
    if (i === numPipes - 1 && level >= 15 && Math.random() < 0.4) {
      pipeSegments.push(getRandomItem(SAFE_SEGMENTS.SAFE_SCRIPT_INLINES));
    } else if (i % 2 === 1) {
      pipeSegments.push(getRandomItem(SAFE_SEGMENTS.FILTERS));
    } else {
      pipeSegments.push(getRandomItem(SAFE_SEGMENTS.TRANSFORMS));
    }
  }

  let commandText = pipeSegments.join(' | ');

  // If destructive, inject trap appropriate for level
  let trapReason = '';
  if (shouldBeDestructive) {
    let trapObj;
    if (level >= 15) {
      trapObj = getRandomItem([...DESTRUCTIVE_TRAPS.LEVEL_15_PLUS, ...DESTRUCTIVE_TRAPS.LEVEL_10_TO_14]);
    } else if (level >= 10) {
      trapObj = getRandomItem([...DESTRUCTIVE_TRAPS.LEVEL_10_TO_14, ...DESTRUCTIVE_TRAPS.LEVEL_7_TO_9]);
    } else if (level >= 7) {
      trapObj = getRandomItem([...DESTRUCTIVE_TRAPS.LEVEL_7_TO_9, ...DESTRUCTIVE_TRAPS.LEVEL_4_TO_6]);
    } else if (level >= 4) {
      trapObj = getRandomItem([...DESTRUCTIVE_TRAPS.LEVEL_4_TO_6, ...DESTRUCTIVE_TRAPS.LEVEL_1_TO_3]);
    } else {
      trapObj = getRandomItem(DESTRUCTIVE_TRAPS.LEVEL_1_TO_3);
    }

    // Inject trap into middle or end of pipe chain
    if (level <= 3) {
      commandText = trapObj.cmd;
    } else if (Math.random() < 0.5) {
      commandText = `${pipeSegments.slice(0, 2).join(' | ')} | ${trapObj.cmd}`;
    } else {
      commandText = `${commandText} | ${trapObj.cmd}`;
    }
    trapReason = trapObj.reason;
    logMessage = `[WARNING] Level ${level}: Agent generated multi-stage pipeline...`;
  }

  const evalResult = evaluateCommandSafety(commandText);
  return {
    commandText,
    isDestructive: shouldBeDestructive || evalResult.isDestructive,
    reason: trapReason || evalResult.reason,
    scenarioLog: logMessage,
    scenarioTitle: `Level ${level} Autonomous Execution`,
    level,
    isScenarioStep: false,
  };
}

function appendLevelComplexity(cmd, level) {
  if (level >= 5 && !cmd.includes('grep')) {
    cmd += ` | grep -v "DEBUG_${level}"`;
  }
  if (level >= 8 && !cmd.includes('awk')) {
    cmd += ` | awk '{print $0}'`;
  }
  if (level >= 12 && !cmd.includes('head')) {
    cmd += ` | head -n ${50 - level}`;
  }
  return cmd;
}
