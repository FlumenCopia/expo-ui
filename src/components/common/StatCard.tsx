'use client';

import React from 'react';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
  progressPct?: number;
  colorClass?: 'c' | 'g' | 'a' | 'r' | 'p' | '';
  progressFillClass?: 'c' | 'g' | 'a' | 'r' | '';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  note,
  progressPct,
  colorClass = '',
  progressFillClass = '',
}) => {
  return (
    <div className={`stat ${colorClass}`}>
      <div className="stat-l">{label}</div>
      <div className="stat-v">{value}</div>
      {progressPct !== undefined && (
        <div className="pbar">
          <div
            className={`pfill ${progressFillClass}`}
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
        </div>
      )}
      {note && <div className="stat-n">{note}</div>}
    </div>
  );
};
