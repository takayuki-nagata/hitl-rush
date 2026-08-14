import React from 'react';
import { useGameLogic } from './hooks/useGameLogic.js';
import { TerminalHeader } from './components/TerminalHeader.jsx';
import { AgentLogFeed } from './components/AgentLogFeed.jsx';
import { CommandInspector } from './components/CommandInspector.jsx';
import { ActionControls } from './components/ActionControls.jsx';
import { GameOverModal } from './components/GameOverModal.jsx';
import { VictoryModal } from './components/VictoryModal.jsx';
import { Leaderboard } from './components/Leaderboard.jsx';

export default function App() {
  const {
    gameState,
    level,
    commandsAudited,
    totalTimeMs,
    currentCommand,
    autoApprovedSet,
    lastActionLog,
    disasterReport,
    highScores,
    totalRoundsVictory,
    startGame,
    handleYes,
    handleYesForSession,
    handleNo,
    clearAutoPilot,
  } = useGameLogic();

  return (
    <div className="app-container">
      {gameState === 'START' && (
        <div className="start-screen glass-panel">
          <div className="satire-badge">🎭 THE HUMAN-IN-THE-LOOP (HITL) SIMULATOR</div>
          <h1 className="start-title">AGY AGENT PERMISSION RUSH</h1>
          <p className="start-desc">
            Welcome to modern software engineering! You no longer write code—your entire career now consists of being a 
            <strong> High-Speed Human Rubber Stamp</strong> for an autonomous AI Agent. 
            Management evaluates your performance based on <em>how many milliseconds it takes you to click [YES]</em>. 
            Just try not to accidentally approve <code>rm -rf /</code> while chasing your quarterly approval speed KPI!
          </p>

          <div className="rules-card">
            <h3>🤖 THE HUMAN-IN-THE-LOOP JOB DESCRIPTION:</h3>
            <ul className="rules-list">
              <li>
                <strong>[Y] Yes (Rubber Stamp)</strong>: Approve the command. Lower reaction time = HR loves you!
              </li>
              <li>
                <strong>[A] Yes for Session (Blind Faith Auto-Pilot)</strong>: Blindly trust the AI for a command type. Saves time (0ms penalty), but if the AI sneaks in a server wipe, you take 100% of the blame!
              </li>
              <li>
                <strong>[N] No (Actual Oversight)</strong>: Reject a command (+2.0s penalty). Management hates it when you slow down the pipeline to actually read code.
              </li>
              <li>
                <strong>Level Scaling</strong>: Starts simple at Level 1. As the session progresses, the AI gets more chaotic, disguising <code>rm -rf /</code> inside <code>find -delete</code>, Base64 strings, and <code>python -c</code> traps!
              </li>
            </ul>
          </div>

          <Leaderboard highScores={highScores} />

          <button className="btn-start-game" onClick={startGame}>
            ⌨️ START RUBBER STAMPING (INITIATE HITL)
          </button>
        </div>
      )}

      {(gameState === 'PLAYING' || gameState === 'GAME_OVER' || gameState === 'VICTORY') && (
        <>
          <TerminalHeader
            level={level}
            totalTimeMs={totalTimeMs}
            commandsAudited={commandsAudited}
            totalRoundsVictory={totalRoundsVictory}
            autoApprovedSet={autoApprovedSet}
            onClearAutoPilot={clearAutoPilot}
            scenarioTitle={currentCommand?.scenarioTitle}
          />

          <AgentLogFeed currentCommand={currentCommand} lastActionLog={lastActionLog} />

          <CommandInspector commandObj={currentCommand} autoApprovedSet={autoApprovedSet} />

          <ActionControls
            onYes={handleYes}
            onYesForSession={handleYesForSession}
            onNo={handleNo}
            disabled={gameState !== 'PLAYING'}
          />
        </>
      )}

      {gameState === 'GAME_OVER' && (
        <GameOverModal
          disasterReport={disasterReport}
          commandsAudited={commandsAudited}
          totalTimeMs={totalTimeMs}
          onRestart={startGame}
        />
      )}

      {gameState === 'VICTORY' && (
        <VictoryModal
          totalTimeMs={totalTimeMs}
          commandsAudited={commandsAudited}
          level={level}
          highScores={highScores}
          onRestart={startGame}
        />
      )}
    </div>
  );
}
