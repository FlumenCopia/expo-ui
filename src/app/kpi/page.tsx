'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { KPIItem } from '@/components/dashboard/CommandCenterDashboard';

export default function KPIPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuthStore();
  const [inputs, setInputs] = useState<Record<string, number>>({});

  const { data: kpis = [] } = useQuery({
    queryKey: ['kpis'],
    queryFn: () => api.get('/kpis').then((res) => res.data.data),
  });

  const updateKpiMutation = useMutation({
    mutationFn: ({ id, current }: { id: string; current: number }) =>
      api.put(`/kpis/${id}`, { current }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });

  const handleUpdate = (id: string) => {
    const val = inputs[id];
    if (val !== undefined) {
      updateKpiMutation.mutate({ id, current: val });
    }
  };

  return (
    <div>
      <div className="alert info">
        <span>🎯</span>
        <div>
          <b>Two lines matter here.</b> The green marker is what we contracted with Masters — that is the commitment. The gold zone beyond it is the stretch target the team is pushing for. Contract is the floor, not the goal.
        </div>
      </div>

      <div className="grid g2 mb">
        {kpis.map((k: KPIItem) => {
          const cur = k.current;
          const pct = Math.min(100, (cur / k.dreamMax) * 100);
          const agStart = (k.agreedMin / k.dreamMax) * 100;
          const agEnd = (k.agreedMax / k.dreamMax) * 100;
          const drStart = (k.dreamMin / k.dreamMax) * 100;
          const hitAgreed = cur >= k.agreedMin;
          const hitDream = cur >= k.dreamMin;
          const kId = k.kpiId || (k as any).id || (k as any)._id;

          return (
            <div key={kId} className="kpi">
              <div className="kpi-h">
                <div>
                  <div className="kpi-n">{k.name}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--txt3)', marginTop: '2px' }}>
                    {(k as any).source || ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    className="kpi-cur"
                    style={{
                      color: hitDream
                        ? 'var(--gold)'
                        : hitAgreed
                        ? 'var(--green)'
                        : 'var(--txt)',
                    }}
                  >
                    {cur.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--txt3)', marginTop: '3px' }}>
                    {hitDream
                      ? '★ Stretch hit'
                      : hitAgreed
                      ? '✓ Contract met'
                      : `${Math.round((cur / k.agreedMin) * 100)}% of contract`}
                  </div>
                </div>
              </div>

              <div className="kpi-track">
                <div className="kpi-rail" />
                <div
                  className="kpi-agreed"
                  style={{ left: `${agStart}%`, width: `${agEnd - agStart}%` }}
                />
                <div
                  className="kpi-dream"
                  style={{ left: `${drStart}%`, width: `${100 - drStart}%` }}
                />
                <div className="kpi-prog" style={{ width: `${pct}%` }} />
                <div className="kpi-mk" style={{ left: `${agStart}%` }}>
                  <div className="kpi-mk-l">{k.agreedMin.toLocaleString('en-IN')}</div>
                </div>
                <div className="kpi-mk" style={{ left: `${drStart}%` }}>
                  <div className="kpi-mk-l">{k.dreamMin.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="kpi-legend">
                <div className="kl">
                  <div
                    className="kl-d"
                    style={{ background: 'rgba(16,185,129,.5)' }}
                  />
                  Contracted {k.agreedMin.toLocaleString('en-IN')}&ndash;{k.agreedMax.toLocaleString('en-IN')}
                </div>
                <div className="kl">
                  <div
                    className="kl-d"
                    style={{ background: 'rgba(245,166,35,.45)' }}
                  />
                  Stretch {k.dreamMin.toLocaleString('en-IN')}&ndash;{k.dreamMax.toLocaleString('en-IN')}
                </div>
              </div>

              {hasPermission('view_kpi') && (
                <div
                  style={{
                    marginTop: '12px',
                    display: 'flex',
                    gap: '7px',
                    alignItems: 'center',
                  }}
                >
                  <input
                    className="fi"
                    style={{ flex: 1, padding: '6px 9px' }}
                    type="number"
                    placeholder="Update current value"
                    value={inputs[kId] !== undefined ? inputs[kId] : cur}
                    onChange={(e) =>
                      setInputs({ ...inputs, [kId]: Number(e.target.value) })
                    }
                  />
                  <button
                    className="btn btn-s btn-sm"
                    onClick={() => handleUpdate(kId)}
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
            <div className="card-t">Contract vs Stretch — Full View</div>
            <div className="card-s">What we owe Masters, and what we are chasing</div>
          </div>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Metric</th>
                <th style={{ textAlign: 'center' }}>Current</th>
                <th style={{ textAlign: 'center' }}>Contracted Floor</th>
                <th style={{ textAlign: 'center' }}>Contracted Ceiling</th>
                <th style={{ textAlign: 'center' }}>Stretch Target</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {kpis.map((k: KPIItem) => {
                const kId = k.kpiId || (k as any).id || (k as any)._id;
                const st =
                  k.current >= k.dreamMin ? (
                    <span
                      className="chip"
                      style={{ background: 'rgba(245,166,35,.16)', color: 'var(--gold)' }}
                    >
                      Stretch
                    </span>
                  ) : k.current >= k.agreedMin ? (
                    <span
                      className="chip"
                      style={{ background: 'rgba(16,185,129,.15)', color: 'var(--green)' }}
                    >
                      On contract
                    </span>
                  ) : k.current > 0 ? (
                    <span
                      className="chip"
                      style={{ background: 'rgba(245,158,11,.15)', color: 'var(--amber)' }}
                    >
                      Building
                    </span>
                  ) : (
                    <span
                      className="chip"
                      style={{ background: 'rgba(148,163,184,.13)', color: 'var(--txt3)' }}
                    >
                      Not started
                    </span>
                  );

                return (
                  <tr key={kId}>
                    <td className="strong">{k.name}</td>
                    <td style={{ textAlign: 'center' }} className="mono strong">
                      {k.current.toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'center' }} className="mono">
                      {k.agreedMin.toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'center' }} className="mono">
                      {k.agreedMax.toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--gold)' }} className="mono">
                      {k.dreamMin.toLocaleString('en-IN')}&ndash;{k.dreamMax.toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'center' }}>{st}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
