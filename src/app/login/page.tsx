'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAddMode = searchParams.get('mode') === 'add';

  const { login, accounts, switchAccount, logoutAccount, logoutAll, isAuthenticated, user: currentUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated && !isAddMode) {
      router.replace('/dashboard');
    }
  }, [mounted, isAuthenticated, isAddMode, router]);

  const currentUserId = currentUser ? currentUser.id || (currentUser as any)._id : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, user } = res.data.data;
      login(user, accessToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchSaved = async (userId: string) => {
    await switchAccount(userId);
    router.push('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
          border: '1px solid var(--border2)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            className="sb-logo"
            style={{
              width: '52px',
              height: '52px',
              margin: '0 auto 14px',
              fontSize: '26px',
            }}
          >
            ☀️
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--txt)', letterSpacing: '-0.5px' }}>
            Masters Expo 2026
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '1.2px', textTransform: 'uppercase', marginTop: '4px', fontWeight: 600 }}>
            {isAddMode ? '+ Add & Sign In to Work Account' : 'Campaign Command Center · Secure Portal'}
          </p>
        </div>

        {/* SAVED ACCOUNTS LIST WITH SINGLE-ACCOUNT SIGN OUT & SIGN OUT ALL */}
        {mounted && accounts.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div className="fl" style={{ margin: 0 }}>Saved Accounts ({accounts.length})</div>
              <button
                type="button"
                style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 600 }}
                onClick={() => {
                  logoutAll();
                }}
              >
                Log Out All Accounts
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {accounts.map((acc) => {
                const accId = acc.user.id || (acc.user as any)._id;
                const isActive = accId === currentUserId || acc.user.email === currentUser?.email;

                return (
                  <div
                    key={accId || acc.user.email}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: isActive ? 'rgba(245,166,35,0.12)' : 'var(--panel2)',
                      border: `1px solid ${isActive ? 'var(--gold)' : 'var(--border2)'}`,
                      borderRadius: 'var(--rs)',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSwitchSaved(accId || acc.user.email)}
                  >
                    <div className="tc-av" style={{ background: acc.user.color || '#3B82F6', width: '28px', height: '28px', fontSize: '11px' }}>
                      {acc.user.short}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: isActive ? 'var(--gold)' : 'var(--txt)' }}>
                        {acc.user.name} {isActive ? '(Active)' : ''}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--txt3)' }}>{acc.user.email}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button type="button" className="btn btn-s btn-sm" style={{ padding: '3px 8px', fontSize: '10px' }}>
                        {isActive ? 'Current' : 'Switch'}
                      </button>
                      <button
                        type="button"
                        style={{
                          padding: '3px 7px',
                          fontSize: '11px',
                          color: 'var(--red)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                        title="Remove / Sign Out Account"
                        onClick={(e) => {
                          e.stopPropagation();
                          logoutAccount(accId || acc.user.email);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="divider" style={{ margin: '18px 0 16px' }} />
          </div>
        )}

        {error && (
          <div className="alert err" style={{ marginBottom: '20px' }}>
            <span>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="fg" style={{ marginBottom: '18px' }}>
            <label className="fl">{mounted && accounts.length > 0 ? 'Or Sign In to New Work Email' : 'Work Email Address'}</label>
            <input
              className="fi"
              type="email"
              placeholder="name@flumenx.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="fg" style={{ marginBottom: '22px' }}>
            <label className="fl">Password</label>
            <input
              className="fi"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-p"
            style={{ width: '100%', padding: '12px', fontSize: '13.5px', fontWeight: 700 }}
            disabled={loading}
          >
            {loading ? 'Authenticating Session...' : mounted && accounts.length > 0 ? 'Add Account & Sign In' : 'Sign In to Command Center'}
          </button>
        </form>

        {mounted && isAuthenticated && isAddMode && (
          <div style={{ marginTop: '14px', textAlign: 'center' }}>
            <button
              type="button"
              className="btn btn-s btn-sm"
              style={{ width: '100%' }}
              onClick={() => router.push('/dashboard')}
            >
              ← Back to Active Dashboard ({currentUser?.name})
            </button>
          </div>
        )}

        <div className="divider" style={{ margin: '24px 0 16px' }} />

        <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--txt3)' }}>
          <div>Protected by HTTP-Only Cookie JWT Authentication</div>
          <div style={{ marginTop: '4px', color: 'var(--txt3)' }}>
            Super Admin: <span className="mono" style={{ color: 'var(--gold)' }}>anoop@flumenx.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--txt3)' }}>Loading Portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
