'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StatCard } from '@/components/common/StatCard';
import { ChartWidget } from '@/components/common/ChartWidget';
import { useAuthStore } from '@/store/useAuthStore';
import { PageGuard } from '@/components/rbac/PermissionGuard';
import { BudgetItem } from '@/components/dashboard/CommandCenterDashboard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const PHASES = [
  { id: 'ph1', name: 'IGNITE' },
  { id: 'ph2', name: 'AMPLIFY' },
  { id: 'ph3', name: 'CONVERT' },
  { id: 'ph4', name: 'LAST MILE' },
  { id: 'ph5', name: 'LIVE + POST' },
];

export default function BudgetPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuthStore();
  const [inputs, setInputs] = useState<Record<string, number>>({});

  const { data: budgetList = [], isLoading: budgetLoading } = useQuery({
    queryKey: ['budget'],
    queryFn: () => api.get('/budget').then((res) => res.data.data),
  });

  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, spent }: { id: string; spent: number }) =>
      api.put(`/budget/${id}`, { spent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] });
    },
  });

  const EXPO_START = new Date('2026-07-18T00:00:00+05:30');
  const EXPO_END = new Date('2026-09-29T23:59:00+05:30');

  const tot = budgetList.reduce((a: number, b: BudgetItem) => a + b.total, 0);
  const spent = budgetList.reduce((a: number, b: BudgetItem) => a + b.spent, 0);
  const now = new Date();

  const elapsed = Math.max(1, Math.ceil((now.getTime() - EXPO_START.getTime()) / 86400000));
  const totalDays = Math.ceil((EXPO_END.getTime() - EXPO_START.getTime()) / 86400000);
  const idealSpend = Math.round(tot * (elapsed / totalDays));
  const pace = spent - idealSpend;

  if (budgetLoading) {
    return <LoadingSpinner message="Loading Budget & Spend Allocations..." minHeight="450px" />;
  }

  const fmtINR = (val: number) => {
    return '₹' + val.toLocaleString('en-IN');
  };

  const chartData = useMemo(() => {
    return {
      labels: PHASES.map((p) => p.name),
      datasets: budgetList.map((b: BudgetItem & { color?: string; phases?: Record<string, number> }) => ({
        label: b.platform,
        data: PHASES.map((p) => (b.phases ? b.phases[p.id] || 0 : 0)),
        backgroundColor: (b.color || '#3B82F6') + 'CC',
        borderRadius: 5,
      })),
    };
  }, [budgetList]);

  const handleUpdate = (id: string) => {
    const val = inputs[id];
    if (val !== undefined) {
      updateBudgetMutation.mutate({ id, spent: val });
    }
  };

  return (
    <PageGuard requiredPermission="view_budget">
      <div>
        <div className={`alert ${Math.abs(pace) > 30000 ? 'warn' : 'ok'}`}>
          <span>₹</span>
          <div>
            <b>Ad budget: {fmtINR(tot)} (Package B).</b> Agency fee is handled separately and is not tracked here.
            {pace < -15000
              ? ` Currently ${fmtINR(Math.abs(pace))} behind pace — underspending early means less data to optimise with later.`
              : pace > 15000
              ? ` Currently ${fmtINR(pace)} ahead of pace — check that Phase 3 still has enough left for the conversion push.`
              : ' Spend is tracking close to plan.'}
          </div>
        </div>

        <div className="grid g4 mb">
          <StatCard
            label="Total Ad Budget"
            value={fmtINR(tot)}
            note="Meta + Google only"
          />
          <StatCard
            label="Spent"
            value={fmtINR(spent)}
            colorClass="c"
            progressFillClass="c"
            progressPct={tot ? (spent / tot) * 100 : 0}
            note={`${Math.round(tot ? (spent / tot) * 100 : 0)}% deployed`}
          />
          <StatCard
            label="Remaining"
            value={fmtINR(tot - spent)}
            colorClass="g"
            note={`${totalDays - elapsed} days left to deploy`}
          />
          <StatCard
            label="Pace vs Plan"
            value={`${pace >= 0 ? '+' : ''}${fmtINR(pace)}`}
            colorClass={Math.abs(pace) > 30000 ? 'r' : 'a'}
            note={`${pace >= 0 ? 'ahead of' : 'behind'} ideal burn`}
          />
        </div>

        <div className="grid g2 mb">
          {budgetList.map((b: BudgetItem & { icon?: string; color?: string; phases?: Record<string, number> }) => {
            const p = b.total ? (b.spent / b.total) * 100 : 0;
            const bId = b.budgetId || (b as any).id;
            return (
              <div key={bId} className="bud">
                <div className="bud-top">
                  <div className="bud-plat">
                    {b.icon || '📱'} {b.platform}
                  </div>
                  <div className="bud-amt" style={{ color: b.color || '#3B82F6' }}>
                    {fmtINR(b.spent)}{' '}
                    <span style={{ color: 'var(--txt3)', fontSize: '12px' }}>
                      / {fmtINR(b.total)}
                    </span>
                  </div>
                </div>

                <div className="pbar" style={{ height: '7px' }}>
                  <div
                    className="pfill"
                    style={{ width: `${p}%`, background: b.color || '#3B82F6' }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '10.5px',
                    color: 'var(--txt3)',
                    marginTop: '6px',
                  }}
                >
                  <span>{Math.round(p)}% spent</span>
                  <span>{fmtINR(b.total - b.spent)} remaining</span>
                </div>

                <div className="divider" />
                <div
                  style={{
                    fontSize: '10.5px',
                    letterSpacing: '.6px',
                    textTransform: 'uppercase',
                    color: 'var(--txt3)',
                    fontWeight: 600,
                    marginBottom: '9px',
                  }}
                >
                  Phase Allocation
                </div>

                {PHASES.map((ph) => {
                  const amt = b.phases ? b.phases[ph.id] || 0 : 0;
                  const pp = b.total ? (amt / b.total) * 100 : 0;
                  return (
                    <div key={ph.id} style={{ marginBottom: '7px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          marginBottom: '3px',
                        }}
                      >
                        <span style={{ color: 'var(--txt2)' }}>{ph.name}</span>
                        <span className="mono">{fmtINR(amt)}</span>
                      </div>
                      <div className="pbar" style={{ height: '3px' }}>
                        <div
                          className="pfill"
                          style={{
                            width: `${pp}%`,
                            background: (b.color || '#3B82F6') + '88',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                {hasPermission('view_budget') && (
                  <div style={{ marginTop: '12px', display: 'flex', gap: '7px' }}>
                    <input
                      className="fi"
                      style={{ flex: 1, padding: '6px 9px' }}
                      type="number"
                      placeholder="Update spent"
                      value={inputs[bId] !== undefined ? inputs[bId] : b.spent}
                      onChange={(e) =>
                        setInputs({ ...inputs, [bId]: Number(e.target.value) })
                      }
                    />
                    <button
                      className="btn btn-s btn-sm"
                      onClick={() => handleUpdate(bId)}
                    >
                      Update
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">Phase-wise Budget Plan</div>
              <div className="card-s">
                Spend concentrates in Phase 3 (Convert) — the highest-conversion window
              </div>
            </div>
          </div>
          <ChartWidget data={chartData} height={120} stacked />
        </div>
      </div>
    </PageGuard>
  );
}
