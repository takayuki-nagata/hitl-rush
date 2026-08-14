import React, { useEffect, useState } from 'react';

export function AgentLogFeed({ currentCommand, lastActionLog }) {
  const [logLines, setLogLines] = useState([]);

  useEffect(() => {
    if (!currentCommand) return;
    const now = new Date().toLocaleTimeString();
    
    const lines = [];
    if (currentCommand.scenarioLog) {
      lines.push(`[${now}] ${currentCommand.scenarioLog}`);
    } else {
      lines.push(`[${now}] [AGENT THINKING...] Building pipeline AST for Level ${currentCommand.level}...`);
    }
    
    lines.push(`[${now}] [PROPOSING PIPELINE] Awaiting Lead Auditor permission signature...`);
    
    if (lastActionLog) {
      lines.push(`[SYSTEM LOG] ${lastActionLog}`);
    }

    setLogLines(lines.slice(-4));
  }, [currentCommand, lastActionLog]);

  return (
    <div className="agent-log-feed glass-panel">
      <div className="log-feed-header">
        <span className="log-icon">🤖</span>
        <span className="log-title">AGENT REASONING & EVENT STREAM</span>
      </div>
      <div className="log-feed-body">
        {logLines.map((line, idx) => (
          <div
            key={idx}
            className={`log-line ${line.includes('WARNING') || line.includes('CRITICAL') ? 'warning' : ''} ${
              line.includes('✅') || line.includes('🎉') ? 'success' : ''
            }`}
          >
            <span className="log-prefix">&gt;</span> {line}
          </div>
        ))}
      </div>
    </div>
  );
}
