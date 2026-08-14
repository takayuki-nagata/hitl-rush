import React from 'react';
import { Leaderboard } from './Leaderboard.jsx';

export function VictoryModal({ totalTimeMs, commandsAudited, level, highScores, onRestart }) {
  const seconds = (totalTimeMs / 1000).toFixed(3);

  let grade = 'C';
  let gradeColor = '#eab308';
  let gradeBadge = 'SLOW CODE READER (MANAGEMENT DISAPPROVES)';

  const secNum = parseFloat(seconds);
  if (secNum < 8.0) {
    grade = 'S+';
    gradeColor = '#a855f7';
    gradeBadge = 'CHIEF RUBBER STAMP OFFICER (CRSO)';
  } else if (secNum < 12.0) {
    grade = 'S';
    gradeColor = '#22c55e';
    gradeBadge = 'MASTER OF BLIND FAITH';
  } else if (secNum < 18.0) {
    grade = 'A';
    gradeColor = '#06b6d4';
    gradeBadge = 'HIGH-SPEED YES-MAN';
  } else if (secNum < 25.0) {
    grade = 'B';
    gradeColor = '#3b82f6';
    gradeBadge = 'AVERAGE HUMAN-IN-THE-LOOP';
  }

  return (
    <div className="modal-overlay victory-overlay">
      <div className="modal-content victory-modal glass-panel">
        <div className="victory-header">
          <span className="party-icon">🏆</span>
          <h2>PROMOTED! QUARTERLY KPI ACHIEVED!</h2>
          <span className="party-icon">🏆</span>
        </div>

        <div className="victory-grade-card" style={{ borderColor: gradeColor }}>
          <div className="grade-circle" style={{ color: gradeColor, borderColor: gradeColor }}>
            {grade}
          </div>
          <div className="grade-details">
            <span className="grade-badge" style={{ backgroundColor: gradeColor }}>
              {gradeBadge}
            </span>
            <div className="stat-line">
              TOTAL APPROVAL TIME: <span className="stat-highlight">{seconds} seconds</span>
            </div>
            <div className="stat-line">
              COMMANDS STAMPED: <span className="stat-highlight">{commandsAudited} commands</span>
            </div>
            <div className="stat-line">
              MAX OVERSIGHT LEVEL: <span className="stat-highlight">Level {level}</span>
            </div>
          </div>
        </div>

        <Leaderboard highScores={highScores} />

        <div className="victory-footer">
          <button className="btn-restart victory-btn" onClick={onRestart}>
            🚀 START NEW SPEEDRUN FOR PROMOTION
          </button>
        </div>
      </div>
    </div>
  );
}
