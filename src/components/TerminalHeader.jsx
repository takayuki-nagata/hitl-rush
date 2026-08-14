import React, { useState } from 'react';
import { toggleMute, getMuteState } from '../game/audioEngine.js';

export function TerminalHeader({
  level,
  totalTimeMs,
  commandsAudited,
  totalRoundsVictory,
  autoApprovedSet,
  onClearAutoPilot,
  scenarioTitle,
}) {
  const [muted, setMuted] = useState(getMuteState());

  const handleToggleMute = () => {
    const nextMute = toggleMute();
    setMuted(nextMute);
  };

  const formattedSeconds = (totalTimeMs / 1000).toFixed(3);

  // Satirical Level Badges
  let levelTitle = 'JUNIOR RUBBER STAMP';
  if (level >= 3) levelTitle = 'SENIOR YES-MAN';
  if (level >= 6) levelTitle = 'PRINCIPAL APPROVAL BOT';
  if (level >= 10) levelTitle = 'CHIEF BLIND FAITH OFFICER';
  if (level >= 15) levelTitle = 'HITL SURVIVOR (NIGHTMARE)';

  return (
    <header className="terminal-header glass-panel">
      <div className="header-top-row">
        <div className="brand-title">
          <span className="pulsing-dot"></span>
          <span className="brand-text">AGY-CLI</span>
          <span className="brand-sub">// HUMAN-IN-THE-LOOP (HITL) APPROVAL SPEEDRUN</span>
        </div>

        <div className="header-actions">
          <button
            className={`btn-icon ${muted ? 'muted' : ''}`}
            onClick={handleToggleMute}
            title={muted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {muted ? '🔇 Muted' : '🔊 Sound ON'}
          </button>
        </div>
      </div>

      <div className="stats-hud-grid">
        <div className="hud-card level-card">
          <span className="hud-label">HUMAN OVERSIGHT LEVEL</span>
          <div className="hud-value level-value">
            <span className="level-num">LVL {level}</span>
            <span className="level-badge">{levelTitle}</span>
          </div>
        </div>

        <div className="hud-card timer-card">
          <span className="hud-label">APPROVAL SPEED (LOWER IS BETTER)</span>
          <div className="hud-value timer-value">
            {formattedSeconds} <span className="unit">sec</span>
          </div>
        </div>

        <div className="hud-card progress-card">
          <span className="hud-label">QUARTERLY YES-STAMP TARGET</span>
          <div className="hud-value progress-value">
            {commandsAudited} / {totalRoundsVictory} <span className="unit">stamps</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(100, (commandsAudited / totalRoundsVictory) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {scenarioTitle && (
        <div className="scenario-banner">
          <span className="banner-tag">AI AGENT TASK:</span>
          <span className="banner-title">{scenarioTitle}</span>
        </div>
      )}

      <div className="whitelist-bar">
        <span className="whitelist-label">BLIND FAITH WHITELIST (AUTO-PILOT):</span>
        {autoApprovedSet.length === 0 ? (
          <span className="whitelist-empty">None (You are manually reading commands... management disapproves!)</span>
        ) : (
          <div className="whitelist-tags">
            {autoApprovedSet.map(verb => (
              <span key={verb} className="whitelist-tag">
                ⚡ {verb}
              </span>
            ))}
            <button className="btn-clear-whitelist" onClick={onClearAutoPilot} title="Clear Auto-Pilot Whitelist">
              ✖ Regain Control
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
