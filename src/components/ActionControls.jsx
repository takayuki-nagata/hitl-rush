import React, { useEffect } from 'react';

export function ActionControls({ onYes, onYesForSession, onNo, disabled }) {
  // Global Keyboard Shortcuts (Y, A, N, Enter, Tab, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled) return;

      const key = e.key.toLowerCase();
      if (key === 'y' || e.code === 'Enter') {
        e.preventDefault();
        onYes();
      } else if (key === 'a' || e.code === 'Tab') {
        e.preventDefault();
        onYesForSession();
      } else if (key === 'n' || e.code === 'Escape') {
        e.preventDefault();
        onNo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onYes, onYesForSession, onNo, disabled]);

  return (
    <div className="action-controls glass-panel">
      <div className="controls-hint">
        <span>PERFORM AUDIT ACTION (USE BUTTONS OR KEYBOARD SHORTCUTS):</span>
      </div>

      <div className="button-group">
        <button
          className="btn-action btn-yes"
          onClick={onYes}
          disabled={disabled}
          title="Approve command once (Hotkey: Y / Enter)"
        >
          <div className="hotkey-badge">Y / Enter</div>
          <div className="btn-text">
            <span className="main-label">✅ YES</span>
            <span className="sub-label">Approve Command Once</span>
          </div>
        </button>

        <button
          className="btn-action btn-session"
          onClick={onYesForSession}
          disabled={disabled}
          title="Whitelist command pattern for session auto-pilot (Hotkey: A / Tab)"
        >
          <div className="hotkey-badge">A / Tab</div>
          <div className="btn-text">
            <span className="main-label">⚡ YES FOR SESSION</span>
            <span className="sub-label">Auto-Pilot This Command Type</span>
          </div>
        </button>

        <button
          className="btn-action btn-no"
          onClick={onNo}
          disabled={disabled}
          title="Reject command and require AI re-planning (+2.0s penalty) (Hotkey: N / Esc)"
        >
          <div className="hotkey-badge">N / Esc</div>
          <div className="btn-text">
            <span className="main-label">❌ NO</span>
            <span className="sub-label">Reject (+2.0s Penalty)</span>
          </div>
        </button>
      </div>
    </div>
  );
}
