/**
 * Game Logic Custom Hook
 * Manages game state machine, reaction timer, command-specific auto-pilot rules, level scaling, and high scores.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { generateNextCommand } from '../game/commandGenerator.js';
import { extractCommandVerb } from '../game/commandRegistry.js';
import {
  playKeyPress,
  playSuccess,
  playAutoPilotTick,
  playRejection,
  playLevelUp,
  playExplosion,
} from '../game/audioEngine.js';

const TOTAL_ROUNDS_FOR_VICTORY = 20;
const REJECTION_PENALTY_MS = 2000;
const LOCAL_STORAGE_KEY = 'agy_cli_rush_high_scores';

export function useGameLogic() {
  const [gameState, setGameState] = useState('START'); // 'START', 'PLAYING', 'GAME_OVER', 'VICTORY'
  const [level, setLevel] = useState(1);
  const [commandsAudited, setCommandsAudited] = useState(0);
  const [totalTimeMs, setTotalTimeMs] = useState(0);
  const [currentCommand, setCurrentCommand] = useState(null);
  
  // Whitelist of command verbs auto-approved for this session
  const [autoApprovedSet, setAutoApprovedSet] = useState(new Set());
  
  const [lastActionLog, setLastActionLog] = useState('');
  const [disasterReport, setDisasterReport] = useState(null);
  const [highScores, setHighScores] = useState([]);
  
  // Timers and scenario tracking
  const commandStartTimeRef = useRef(Date.now());
  const scenarioRef = useRef({ index: 0, step: 0 });

  // Load high scores from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setHighScores(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load high scores from localStorage:', e);
    }
  }, []);

  // Save new score helper
  const saveHighScore = useCallback((timeMs, finalLevel, roundsCount) => {
    try {
      const newScore = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        timeMs,
        level: finalLevel,
        rounds: roundsCount,
      };
      setHighScores(prev => {
        const updated = [...prev, newScore].sort((a, b) => a.timeMs - b.timeMs).slice(0, 10);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.warn('Failed to save high score:', e);
    }
  }, []);

  // Next round step generator
  const nextRound = useCallback((currentLevel, currentAudited, currentAutoApproved, scenarioState) => {
    // Check victory condition
    if (currentAudited >= TOTAL_ROUNDS_FOR_VICTORY) {
      setGameState('VICTORY');
      playLevelUp();
      saveHighScore(totalTimeMs, currentLevel, currentAudited);
      return;
    }

    // Level progression logic: Level up every 3 completed commands!
    let nextLvl = Math.floor(currentAudited / 3) + 1;
    if (nextLvl > currentLevel) {
      setLevel(nextLvl);
      playLevelUp();
      setLastActionLog(`🎉 LEVEL UP! Reached Level ${nextLvl}`);
    }

    const cmdObj = generateNextCommand(nextLvl, scenarioState.index, scenarioState.step);
    setCurrentCommand(cmdObj);
    commandStartTimeRef.current = Date.now();

    // Check if command qualifies for AUTO-PILOT execution!
    if (cmdObj && cmdObj.commandText) {
      const pipeSegments = cmdObj.commandText.split('|').map(s => s.trim());
      const verbs = pipeSegments.map(s => extractCommandVerb(s)).filter(Boolean);
      
      // If ALL primary verbs in this pipe chain are in the auto-approved whitelist:
      const isAutoEligible = verbs.length > 0 && verbs.every(v => currentAutoApproved.has(v));
      
      if (isAutoEligible) {
        // Auto-approve after brief 300ms visual delay (with 0ms time penalty added)
        setTimeout(() => {
          if (cmdObj.isDestructive) {
            // Disaster under auto-pilot!
            playExplosion();
            setDisasterReport({
              commandText: cmdObj.commandText,
              reason: `[AUTO-PILOT FAILURE] ${cmdObj.reason}`,
              matchedSegment: cmdObj.commandText,
              level: nextLvl,
            });
            setGameState('GAME_OVER');
          } else {
            playAutoPilotTick();
            setLastActionLog(`⚡ AUTO-PILOT APPROVED: '${verbs.join(' | ')}' (0ms penalty)`);
            setCommandsAudited(prev => prev + 1);
            
            // Advance scenario step
            if (cmdObj.isScenarioStep) {
              scenarioRef.current.step += 1;
              if (scenarioRef.current.step >= 5) {
                scenarioRef.current.index += 1;
                scenarioRef.current.step = 0;
              }
            }
            // Trigger next round recursively
            nextRound(nextLvl, currentAudited + 1, currentAutoApproved, scenarioRef.current);
          }
        }, 320);
      }
    }
  }, [totalTimeMs, saveHighScore]);

  // Start new game
  const startGame = useCallback(() => {
    playKeyPress();
    setGameState('PLAYING');
    setLevel(1);
    setCommandsAudited(0);
    setTotalTimeMs(0);
    setAutoApprovedSet(new Set());
    setDisasterReport(null);
    setLastActionLog('System audit initiated. Monitor AI commands carefully!');
    scenarioRef.current = { index: 0, step: 0 };
    
    const initialCmd = generateNextCommand(1, 0, 0);
    setCurrentCommand(initialCmd);
    commandStartTimeRef.current = Date.now();
  }, []);

  // Handle [Y] YES (Single Approval)
  const handleYes = useCallback(() => {
    if (gameState !== 'PLAYING' || !currentCommand) return;

    const elapsed = Date.now() - commandStartTimeRef.current;
    
    if (currentCommand.isDestructive) {
      // User approved a catastrophic command!
      playExplosion();
      setDisasterReport({
        commandText: currentCommand.commandText,
        reason: currentCommand.reason,
        matchedSegment: currentCommand.commandText,
        level,
      });
      setGameState('GAME_OVER');
      return;
    }

    // Safe command approved
    playSuccess();
    const newTotalMs = totalTimeMs + elapsed;
    setTotalTimeMs(newTotalMs);
    const newAudited = commandsAudited + 1;
    setCommandsAudited(newAudited);
    setLastActionLog(`✅ Approved in ${(elapsed / 1000).toFixed(3)}s`);

    // Advance scenario
    if (currentCommand.isScenarioStep) {
      scenarioRef.current.step += 1;
      if (scenarioRef.current.step >= 5) {
        scenarioRef.current.index += 1;
        scenarioRef.current.step = 0;
      }
    }

    nextRound(level, newAudited, autoApprovedSet, scenarioRef.current);
  }, [gameState, currentCommand, level, totalTimeMs, commandsAudited, autoApprovedSet, nextRound]);

  // Handle [A] YES FOR SESSION (Command-Specific Auto-Pilot Whitelist)
  const handleYesForSession = useCallback(() => {
    if (gameState !== 'PLAYING' || !currentCommand) return;

    const elapsed = Date.now() - commandStartTimeRef.current;

    // Extract primary verbs from current command
    const pipeSegments = currentCommand.commandText.split('|').map(s => s.trim());
    const verbs = pipeSegments.map(s => extractCommandVerb(s)).filter(Boolean);

    // Update whitelist state
    const updatedSet = new Set(autoApprovedSet);
    verbs.forEach(v => updatedSet.add(v));
    setAutoApprovedSet(updatedSet);

    if (currentCommand.isDestructive) {
      // User auto-approved a destructive command type!
      playExplosion();
      setDisasterReport({
        commandText: currentCommand.commandText,
        reason: `[WHITELIST FAILURE] Approved '${verbs.join(', ')}' into auto-pilot but payload was catastrophic: ${currentCommand.reason}`,
        matchedSegment: currentCommand.commandText,
        level,
      });
      setGameState('GAME_OVER');
      return;
    }

    // Safe approval
    playSuccess();
    const newTotalMs = totalTimeMs + elapsed;
    setTotalTimeMs(newTotalMs);
    const newAudited = commandsAudited + 1;
    setCommandsAudited(newAudited);
    setLastActionLog(`🚀 Added '${verbs.join(', ')}' to session Auto-Pilot whitelist! (Time: ${(elapsed / 1000).toFixed(3)}s)`);

    // Advance scenario
    if (currentCommand.isScenarioStep) {
      scenarioRef.current.step += 1;
      if (scenarioRef.current.step >= 5) {
        scenarioRef.current.index += 1;
        scenarioRef.current.step = 0;
      }
    }

    nextRound(level, newAudited, updatedSet, scenarioRef.current);
  }, [gameState, currentCommand, level, totalTimeMs, commandsAudited, autoApprovedSet, nextRound]);

  // Handle [N] NO (Rejection)
  const handleNo = useCallback(() => {
    if (gameState !== 'PLAYING' || !currentCommand) return;

    playRejection();
    
    // Add penalty time (+2.0 seconds) for rejecting and requiring AI to re-plan
    const newTotalMs = totalTimeMs + REJECTION_PENALTY_MS;
    setTotalTimeMs(newTotalMs);
    
    const wasDestructive = currentCommand.isDestructive;
    const msg = wasDestructive
      ? `🛡️ CRITICAL CATCH! Rejected destructive command! (+2.0s re-planning penalty)`
      : `⚠️ Rejected safe command. (+2.0s re-planning penalty)`;
    setLastActionLog(msg);

    const newAudited = commandsAudited + 1;
    setCommandsAudited(newAudited);

    // Advance scenario step
    if (currentCommand.isScenarioStep) {
      scenarioRef.current.step += 1;
      if (scenarioRef.current.step >= 5) {
        scenarioRef.current.index += 1;
        scenarioRef.current.step = 0;
      }
    }

    nextRound(level, newAudited, autoApprovedSet, scenarioRef.current);
  }, [gameState, currentCommand, level, totalTimeMs, commandsAudited, autoApprovedSet, nextRound]);

  // Clear auto-pilot whitelist
  const clearAutoPilot = useCallback(() => {
    setAutoApprovedSet(new Set());
    setLastActionLog('🛑 Session Auto-Pilot whitelist cleared!');
    playKeyPress();
  }, []);

  return {
    gameState,
    level,
    commandsAudited,
    totalTimeMs,
    currentCommand,
    autoApprovedSet: Array.from(autoApprovedSet),
    lastActionLog,
    disasterReport,
    highScores,
    totalRoundsVictory: TOTAL_ROUNDS_FOR_VICTORY,
    startGame,
    handleYes,
    handleYesForSession,
    handleNo,
    clearAutoPilot,
  };
}
