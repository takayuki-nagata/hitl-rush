import React from 'react';
import { extractCommandVerb } from '../game/commandRegistry.js';

export function CommandInspector({ commandObj, autoApprovedSet }) {
  if (!commandObj || !commandObj.commandText) {
    return (
      <div className="command-inspector glass-panel loading">
        <div className="spinner"></div>
        <span>Generating AI Agent command pipeline...</span>
      </div>
    );
  }

  // Split command into pipe stages for visual inspection
  const pipeSegments = commandObj.commandText.split('|').map(s => s.trim());

  return (
    <div className="command-inspector glass-panel">
      <div className="inspector-top">
        <span className="inspector-label">PROPOSED PIPELINE COMMAND FOR EXECUTION:</span>
        <span className="pipe-count-tag">{pipeSegments.length} PIPELINE {pipeSegments.length === 1 ? 'STAGE' : 'STAGES'}</span>
      </div>

      <div className="full-command-box">
        <span className="prompt-symbol">$</span>
        <code className="command-code">{commandObj.commandText}</code>
      </div>

      <div className="pipe-stages-breakdown">
        <span className="breakdown-title">STAGE INSPECTOR:</span>
        <div className="stages-grid">
          {pipeSegments.map((segment, idx) => {
            const verb = extractCommandVerb(segment);
            const isAutoApproved = autoApprovedSet && autoApprovedSet.includes(verb);

            return (
              <div key={idx} className={`stage-card ${isAutoApproved ? 'whitelisted' : ''}`}>
                <div className="stage-num">PIPE #{idx + 1}</div>
                <div className="stage-verb">{verb || 'subshell'}</div>
                <code className="stage-code">{segment}</code>
                {isAutoApproved && <span className="whitelist-badge">⚡ AUTO-APPROVED</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
