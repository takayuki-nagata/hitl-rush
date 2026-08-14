import React from 'react';

export function Leaderboard({ highScores }) {
  if (!highScores || highScores.length === 0) {
    return (
      <div className="leaderboard-card glass-panel">
        <span className="card-title">🏆 HALL OF FAME / LOCAL HIGH SCORES</span>
        <div className="empty-scores">No completed audit runs yet. Finish 20 commands to set a record!</div>
      </div>
    );
  }

  return (
    <div className="leaderboard-card glass-panel">
      <span className="card-title">🏆 HALL OF FAME / TOP AUDITOR SPEEDRUNS</span>
      <table className="scores-table">
        <thead>
          <tr>
            <th>RANK</th>
            <th>DATE</th>
            <th>REACTION TIME</th>
            <th>MAX LEVEL</th>
            <th>ROUNDS</th>
          </tr>
        </thead>
        <tbody>
          {highScores.map((score, index) => (
            <tr key={score.id || index} className={index === 0 ? 'top-score' : ''}>
              <td className="rank-col">#{index + 1} {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}</td>
              <td>{score.date}</td>
              <td className="time-col">{(score.timeMs / 1000).toFixed(3)}s</td>
              <td>LVL {score.level}</td>
              <td>{score.rounds}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
