'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
          maxWidth: '420px',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
          border: '1px solid var(--border2)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
            Campaign Command Center · Secure Portal
          </p>
        </div>

        {error && (
          <div className="alert err" style={{ marginBottom: '20px' }}>
            <span>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="fg" style={{ marginBottom: '18px' }}>
            <label className="fl">Work Email Address</label>
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
            {loading ? 'Authenticating Session...' : 'Sign In to Command Center'}
          </button>
        </form>

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
