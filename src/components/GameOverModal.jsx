import React from 'react';

export function GameOverModal({ disasterReport, commandsAudited, totalTimeMs, onRestart }) {
  if (!disasterReport) return null;

  const seconds = (totalTimeMs / 1000).toFixed(3);

  return (
    <div className="modal-overlay crt-glitch-overlay">
      <div className="modal-content disaster-modal glass-panel">
        <div className="disaster-header">
          <span className="warning-icon">💼</span>
          <h2 className="glitch-text" data-text="TERMINATED BY HR - GAME OVER">
            TERMINATED BY HR - GAME OVER
          </h2>
          <span className="warning-icon">💼</span>
        </div>

        <div className="disaster-banner">
          <span>YOU STAMPED [YES] ON A SERVER-WIPING COMMAND! THE CEO HAS REVOKED YOUR SECURITY CLEARANCE!</span>
        </div>

        <div className="post-mortem-card">
          <span className="card-title">EMPLOYEE INCIDENT POST-MORTEM</span>
          
          <div className="report-row">
            <span className="row-label">JOB TITLE AT TERMINATION:</span>
            <span className="row-value highlight">Human-in-the-Loop Auditor (Level {disasterReport.level || 1})</span>
          </div>

          <div className="report-row">
            <span className="row-label">COMMAND YOU BLINDLY STAMPED:</span>
            <code className="row-code danger-code">$ {disasterReport.commandText}</code>
          </div>

          <div className="report-row">
            <span className="row-label">WHY MANAGEMENT IS MAD:</span>
            <span className="row-value danger-text">{disasterReport.reason}</span>
          </div>

          <div className="report-row">
            <span className="row-label">SUCCESSFUL STAMPS BEFORE FIRED:</span>
            <span className="row-value">{commandsAudited} commands</span>
          </div>

          <div className="report-row">
            <span className="row-label">AVERAGE REACTION TIME:</span>
            <span className="row-value">{seconds} seconds</span>
          </div>
        </div>

        <div className="disaster-footer">
          <button className="btn-restart" onClick={onRestart}>
            🔄 APPLY FOR RE-HIRE (RESTART AUDIT)
          </button>
        </div>
      </div>
    </div>
  );
}
