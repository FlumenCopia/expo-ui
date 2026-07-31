'use client';

import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  minHeight?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading data from database...',
  minHeight = '300px',
}) => {
  return (
    <div
      style={{
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        color: 'var(--txt2)',
      }}
    >
      <div
        className="rt"
        style={{
          width: '16px',
          height: '16px',
          marginBottom: '12px',
          background: 'var(--gold)',
        }}
      />
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt)' }}>
        {message}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--txt3)', marginTop: '4px' }}>
        Fetching live records from MongoDB database…
      </div>
    </div>
  );
};
