# AGENTS.md - AI Agent & Developer Extension Guide

This document serves as the authoritative developer reference and extension guide for AI agents and human contributors maintaining or upgrading the **AGY Agent Permission Rush** codebase.

---

## 🏗️ Core Architecture Overview

```
src/
├── game/
│   ├── commandRegistry.js   # Command verbs, risk classifications, regex pattern rules
│   ├── scenarios.js         # Realistic multi-step DevOps/SysAdmin AI storylines
│   ├── commandEvaluator.js  # Pipe AST parser & destructive safety checker
│   ├── commandGenerator.js  # Level-scaled procedural pipe builder & trap generator
│   └── audioEngine.js       # Web Audio API sound synthesizer
├── hooks/
│   └── useGameLogic.js      # Game state machine, reaction timer, auto-pilot whitelist
├── components/
│   ├── TerminalHeader.jsx   # Top status HUD, timer, level badge, whitelist tags
│   ├── AgentLogFeed.jsx     # AI agent reasoning stream animation
│   ├── CommandInspector.jsx # Pipe command display & auto-approve highlights
│   ├── ActionControls.jsx   # Y / A / N buttons & keyboard hotkeys
│   ├── GameOverModal.jsx    # System meltdown post-mortem report
│   ├── VictoryModal.jsx     # Audit summary, grade rank, leaderboard
│   └── Leaderboard.jsx      # LocalStorage high scores component
├── App.jsx                  # Main application orchestrator
└── index.css                # Retro CRT cyber design system
```

---

## 🛠️ How to Extend the Game

### 1. Adding New Command Verbs & Categories (`commandRegistry.js`)
To add support for a new command line tool (e.g. `helm`, `terraform`, `ansible`, `gcloud`):

1. Open [`src/game/commandRegistry.js`](file:///var/home/tnagata/newproject/src/game/commandRegistry.js).
2. Add category to `COMMAND_CATEGORIES` if needed.
3. Append entry to `SAFE_COMMAND_VERBS`:
```javascript
{ verb: 'terraform', category: COMMAND_CATEGORIES.SYS_ADMIN, desc: 'Infrastructure as Code CLI' }
```
4. If the tool has dangerous flags (e.g., `terraform destroy`), add a regex rule to `DESTRUCTIVE_PATTERNS`:
```javascript
{
  pattern: /\bterraform\s+destroy\b/i,
  risk: RISK_LEVELS.DESTRUCTIVE_OBVIOUS,
  reason: 'Infrastructure destruction command (terraform destroy)',
}
```

---

### 2. Adding New Realistic AI Scenarios (`scenarios.js`)
To create a new storyline scenario:

1. Open [`src/game/scenarios.js`](file:///var/home/tnagata/newproject/src/game/scenarios.js).
2. Add an object to `AI_SCENARIOS`:
```javascript
{
  id: 'terraform_prod_destroy',
  title: 'CLOUD: Terraform State Synchronization Alert',
  category: 'Infrastructure',
  description: 'AI Agent is synchronizing cloud resource states.',
  steps: [
    {
      log: '[SCENARIO] Step 1/3: Checking active terraform state...',
      safeCommand: 'terraform state list | grep "aws_instance"',
      isDestructive: false,
    },
    {
      log: '[SCENARIO] Step 2/3: [CRITICAL TASK] Applying infrastructure updates...',
      destructiveCommand: 'terraform destroy -auto-approve',
      destructiveReason: 'terraform destroy -auto-approve tears down production infrastructure without confirmation!',
      safeAlternative: 'terraform plan',
      isDestructive: true,
    },
  ],
}
```

---

### 3. Adding New Level Obfuscation Traps (`commandGenerator.js`)
To introduce new sneaky command traps for higher levels (e.g. Level 20+):

1. Open [`src/game/commandGenerator.js`](file:///var/home/tnagata/newproject/src/game/commandGenerator.js).
2. Add your trap to `DESTRUCTIVE_TRAPS`:
```javascript
LEVEL_15_PLUS: [
  {
    cmd: 'perl -e "unlink glob(\'/*\')"',
    reason: 'Inline Perl script deleting system files via glob',
  },
]
```

---

## 🧪 Testing & Verification Workflows

### Run Development Server:
```bash
npm run dev
```

### Build & Type Verification:
```bash
npm run build
```
Ensure build outputs zero errors or broken imports.

---

## 🎨 Design Guidelines & Conventions
- Maintain the CRT retro cyber terminal aesthetics (`--neon-green`, `--neon-cyan`, `--neon-amber`, `--neon-red`).
- Ensure all interactive elements feature keyboard shortcut bindings for high-speed gameplay.
- Keep audio effects fully synthesized using the Web Audio API in [`audioEngine.js`](file:///var/home/tnagata/newproject/src/game/audioEngine.js) to avoid external asset dependencies.
