'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface DatabaseGuardProps {
  children: React.ReactNode;
}

export const DatabaseGuard: React.FC<DatabaseGuardProps> = ({ children }) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(5);

  const checkDbConnection = useCallback(async () => {
    setStatus('checking');
    setErrorMessage('');
    try {
      const res = await api.get('/health');
      if (res.data && res.data.dbConnected === true) {
        setStatus('connected');
      } else {
        setStatus('error');
        setErrorMessage(res.data?.message || 'Database connection is not ready. Service unavailable.');
      }
    } catch (err: any) {
      setStatus('error');
      const msg = err?.response?.data?.message || err?.message || 'Failed to connect to backend server / MongoDB database.';
      setErrorMessage(msg);
    }
  }, []);

  useEffect(() => {
    checkDbConnection();
  }, [checkDbConnection]);

  // Auto-retry timer when database connection fails
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'error') {
      setCountdown(5);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            checkDbConnection();
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, checkDbConnection]);

  if (status === 'checking') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090B',
          color: '#FAFAFA',
          fontFamily: 'Inter, sans-serif',
          padding: '20px',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #FFFFFF, #A1A1AA)',
            color: '#09090B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            marginBottom: '20px',
            boxShadow: '0 0 30px rgba(255, 255, 255, 0.25)',
            animation: 'pulse 2s infinite',
          }}
        >
          ☀
        </div>
        <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px', textAlign: 'center' }}>
          Masters Expo 2026 Command Center
        </div>
        <div style={{ fontSize: '13px', color: '#A1A1AA', marginBottom: '24px', textAlign: 'center' }}>
          Verifying Database Connection & Backend Health…
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#121215',
            border: '1px solid #27272A',
            borderRadius: '20px',
            padding: '8px 18px',
            fontSize: '12px',
            color: '#FAFAFA',
          }}
        >
          <span className="rt" style={{ width: '10px', height: '10px' }} />
          Connecting to MongoDB Database…
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090B',
          color: '#FAFAFA',
          fontFamily: 'Inter, sans-serif',
          padding: '24px',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            background: '#121215',
            border: '1px solid #EF4444',
            borderRadius: '14px',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(239, 68, 68, 0.25)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '44px', marginBottom: '12px' }}>⚠️</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#EF4444', marginBottom: '10px' }}>
            Database Connection Error
          </div>
          <p style={{ fontSize: '13.5px', color: '#A1A1AA', lineHeight: 1.6, marginBottom: '20px' }}>
            The application cannot load because a verified database connection could not be established.
          </p>

          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '12px',
              color: '#FCA5A5',
              fontFamily: 'JetBrains Mono, monospace',
              wordBreak: 'break-word',
              marginBottom: '24px',
            }}
          >
            {errorMessage || '503 Service Unavailable — MongoDB Connection Disconnected'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            <button
              className="btn btn-p"
              style={{
                width: '100%',
                padding: '12px 20px',
                fontSize: '13px',
                fontWeight: 700,
                background: '#FFFFFF',
                color: '#09090B',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={checkDbConnection}
            >
              🔄 Retry Connection Now
            </button>
            <div style={{ fontSize: '11px', color: '#71717A' }}>
              Auto-retrying in <b style={{ color: '#FFFFFF' }}>{countdown}s</b>…
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
