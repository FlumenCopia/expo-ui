'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CommandCenterDashboard } from '@/components/dashboard/CommandCenterDashboard';

const DEFAULT_MEMBERS = [
  { id: 'u_anoop', name: 'Anoop Krishna', short: 'AK', role: 'super_admin', fn: 'Founder / Strategy', color: '#10E784', cap: 12 },
  { id: 'u_anurag', name: 'Anurag', short: 'AN', role: 'ops_head', fn: 'Operations Head · PCP', color: '#3B82F6', cap: 30 },
  { id: 'u_dishun', name: 'Dishun', short: 'DH', role: 'team_lead', fn: 'Team Lead · Ads & Planning', color: '#22D3EE', cap: 26 },
  { id: 'u_shibin', name: 'Shibin', short: 'SH', role: 'team_lead', fn: 'Team Lead · Digital Marketing', color: '#A78BFA', cap: 24 },
  { id: 'u_goutham', name: 'Goutham', short: 'GT', role: 'member', fn: 'Digital Marketing', color: '#10B981', cap: 28 },
  { id: 'u_nikhil', name: 'Nikhil', short: 'NK', role: 'member', fn: 'Digital Marketing · Creative', color: '#F472B6', cap: 22 },
  { id: 'u_sreejith', name: 'Sreejith', short: 'SJ', role: 'member', fn: 'Lead Graphic Designer', color: '#FB923C', cap: 26 },
  { id: 'u_abi', name: 'Abi', short: 'AB', role: 'member', fn: 'Graphic Designer · Print', color: '#38BDF8', cap: 30 },
  { id: 'u_editor', name: 'Video Editor', short: 'VE', role: 'member', fn: 'Video Editor · VFX', color: '#E879F9', cap: 26 },
  { id: 'u_akhil', name: 'Akhil', short: 'AL', role: 'member', fn: 'IT Support · Website', color: '#34D399', cap: 22 },
  { id: 'u_nithin', name: 'Nithin', short: 'NT', role: 'member', fn: 'IT Support', color: '#2DD4BF', cap: 22 },
  { id: 'u_abison', name: 'Abison', short: 'AS', role: 'qc', fn: 'HR · Quality & Execution', color: '#818CF8', cap: 18 },
  { id: 'u_anandhu', name: 'Anandhu', short: 'AD', role: 'accounts', fn: 'Accounts · Payments', color: '#94A3B8', cap: 10 }
];

const DEFAULT_DELIVERABLES = [
  { deliverableId: 'd_poster', name: 'Static Design Creatives (Posters)', contracted: 45, unit: 'pieces', type: 'design' },
  { deliverableId: 'd_vshoot', name: 'Video — On-location Shoots', contracted: 10, unit: 'videos', type: 'video' },
  { deliverableId: 'd_vmotion', name: 'Video — Motion Graphics + FX', contracted: 10, unit: 'videos', type: 'video' },
  { deliverableId: 'd_social', name: 'FB + IG Managed Posts', contracted: 35, unit: 'posts', type: 'ads' },
  { deliverableId: 'd_wa', name: 'WhatsApp Broadcasts', contracted: 4, unit: 'blasts', type: 'ops' },
  { deliverableId: 'd_prereg', name: 'Pre-Registration + Calendar System', contracted: 1, unit: 'system', type: 'it' },
  { deliverableId: 'd_seo', name: 'SEO Blog Articles', contracted: 2, unit: 'blogs', type: 'content' },
  { deliverableId: 'd_web', name: 'Website Updates + Pixel Setup', contracted: 1, unit: 'setup', type: 'it' },
  { deliverableId: 'd_report', name: 'Performance Reports', contracted: 2, unit: 'reports', type: 'ops' },
  { deliverableId: 'd_cal', name: '73-Day Content Calendar', contracted: 1, unit: 'plan', type: 'ops' }
];

const DEFAULT_KPIS = [
  { kpiId: 'k_foot', name: 'Event Walk-in Footfall', agreedMin: 10000, agreedMax: 15000, dreamMin: 15000, dreamMax: 20000, current: 0 },
  { kpiId: 'k_lead', name: 'Vendor Stall Leads', agreedMin: 50, agreedMax: 75, dreamMin: 80, dreamMax: 120, current: 0 },
  { kpiId: 'k_prereg', name: 'Pre-Registrations', agreedMin: 800, agreedMax: 1200, dreamMin: 1500, dreamMax: 2500, current: 0 },
  { kpiId: 'k_reach', name: 'Total Paid Ad Impressions', agreedMin: 100000, agreedMax: 150000, dreamMin: 200000, dreamMax: 300000, current: 0 },
  { kpiId: 'k_web', name: 'Website Sessions', agreedMin: 4000, agreedMax: 7000, dreamMin: 8000, dreamMax: 12000, current: 0 },
  { kpiId: 'k_spon', name: 'Sponsor Conversations', agreedMin: 2, agreedMax: 4, dreamMin: 5, dreamMax: 8, current: 0 }
];

const DEFAULT_BUDGET = [
  { budgetId: 'b_meta', platform: 'Meta Ads (FB + IG)', total: 180000, spent: 0 },
  { budgetId: 'b_google', platform: 'Google Ads (Search + Display)', total: 70000, spent: 0 }
];

const DEFAULT_TASKS = [
  { id: 'T001', code: 'EXP-001', title: 'Expo logo design + brand lockup', type: 'design', phase: 'ph1', assignee: 'u_sreejith', reviewer: 'u_anoop', status: 'published', priority: 'p0', due: '2026-07-22', hours: 8, deliverable: null, desc: 'Primary expo logo, variants, and lockup with Masters identity.' },
  { id: 'T002', code: 'EXP-002', title: 'Brand kit + social templates (FB/IG)', type: 'design', phase: 'ph1', assignee: 'u_sreejith', reviewer: 'u_anurag', status: 'progress', priority: 'p0', due: '2026-07-26', hours: 10, deliverable: null, desc: 'Master template set so all 45 creatives stay visually consistent.' },
  { id: 'T003', code: 'EXP-003', title: 'Meta Business Suite setup + pixel verification', type: 'ads', phase: 'ph1', assignee: 'u_dishun', reviewer: 'u_anoop', status: 'approved', priority: 'p0', due: '2026-07-23', hours: 4, deliverable: 'd_web', desc: 'Ad account, pixel fire test, custom conversions.' },
  { id: 'T004', code: 'EXP-004', title: 'Google Analytics 4 + conversion events', type: 'it', phase: 'ph1', assignee: 'u_akhil', reviewer: 'u_dishun', status: 'review', priority: 'p0', due: '2026-07-24', hours: 5, deliverable: 'd_web', desc: 'GA4 property, registration event, pre-reg click event.' },
  { id: 'T005', code: 'EXP-005', title: 'Website update — dates, venue, CTAs above fold', type: 'it', phase: 'ph1', assignee: 'u_akhil', reviewer: 'u_anurag', status: 'progress', priority: 'p0', due: '2026-07-27', hours: 6, deliverable: 'd_web', desc: 'expokerala.com currently shows old dates.' }
];

import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function Home() {
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then((res) => res.data.data),
  });

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['members'],
    queryFn: () => api.get('/users').then((res) => res.data.data),
  });

  const { data: deliverablesData, isLoading: deliverablesLoading } = useQuery({
    queryKey: ['deliverables'],
    queryFn: () => api.get('/deliverables').then((res) => res.data.data),
  });

  const { data: kpisData, isLoading: kpisLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: () => api.get('/kpis').then((res) => res.data.data),
  });

  const { data: budgetData, isLoading: budgetLoading } = useQuery({
    queryKey: ['budget'],
    queryFn: () => api.get('/budget').then((res) => res.data.data),
  });

  const isLoading = tasksLoading || membersLoading || deliverablesLoading || kpisLoading || budgetLoading;

  if (isLoading) {
    return <LoadingSpinner message="Loading Command Center Dashboard..." minHeight="500px" />;
  }

  return (
    <CommandCenterDashboard
      tasks={tasksData || (DEFAULT_TASKS as any)}
      members={membersData || DEFAULT_MEMBERS}
      deliverables={deliverablesData || DEFAULT_DELIVERABLES}
      kpis={kpisData || DEFAULT_KPIS}
      budget={budgetData || DEFAULT_BUDGET}
    />
  );
}
