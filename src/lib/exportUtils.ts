import { api } from './api';

export const formatPhaseLabel = (phase?: string) => {
  if (!phase) return '';
  const knownPhases: Record<string, string> = {
    ph1: 'Phase 1 — IGNITE',
    ph2: 'Phase 2 — AMPLIFY',
    ph3: 'Phase 3 — CONVERT',
    ph4: 'Phase 4 — LAST MILE',
    ph5: 'Phase 5 — LIVE + POST',
  };
  return knownPhases[phase] || (phase.startsWith('ph') ? `Phase ${phase.slice(2)}` : phase);
};

export const formatPriorityLabel = (priority?: string) => {
  if (!priority) return '';
  const knownPriorities: Record<string, string> = {
    p0: 'P0 Critical',
    p1: 'P1 High',
    p2: 'P2 Normal',
    p3: 'P3 Low',
  };
  return knownPriorities[priority] || priority.toUpperCase();
};

export const formatStatusLabel = (status?: string) => {
  if (!status) return '';
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const exportToPDF = async () => {
  try {
    const [tasksRes, deliverablesRes, kpisRes, budgetRes, membersRes] = await Promise.all([
      api.get('/tasks').catch(() => ({ data: { data: [] } })),
      api.get('/deliverables').catch(() => ({ data: { data: [] } })),
      api.get('/kpis').catch(() => ({ data: { data: [] } })),
      api.get('/budget').catch(() => ({ data: { data: [] } })),
      api.get('/users').catch(() => ({ data: { data: [] } })),
    ]);

    const tasks = tasksRes.data.data || [];
    const deliverables = deliverablesRes.data.data || [];
    const kpis = kpisRes.data.data || [];
    const budget = budgetRes.data.data || [];
    const members = membersRes.data.data || [];

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => ['published', 'approved'].includes(t.status)).length;
    const inProgressTasks = tasks.filter((t: any) => ['progress', 'review', 'assigned'].includes(t.status)).length;
    const totalBudget = budget.reduce((a: number, b: any) => a + (b.total || 0), 0);
    const spentBudget = budget.reduce((a: number, b: any) => a + (b.spent || 0), 0);

    const membersMap: Record<string, string> = members.reduce((acc: any, m: any) => {
      acc[m.id || m._id] = m.name;
      acc[m.short] = m.name;
      return acc;
    }, {});

    const printWin = window.open('', '_blank', 'width=1100,height=850');
    if (!printWin) {
      alert('Pop-up blocked. Please allow pop-ups to generate PDF report.');
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Executive Campaign Report — Masters Expo 2026</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Inter', sans-serif; color: #1E293B; background: #fff; margin: 0; padding: 20px; font-size: 11px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 2px solid #0F172A; margin-bottom: 20px; }
          .brand { display: flex; align-items: center; gap: 12px; }
          .logo { width: 36px; height: 36px; background: #09090B; border-radius: 8px; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; }
          .title { font-size: 18px; font-weight: 800; color: #0F172A; margin: 0; }
          .sub { font-size: 10px; color: #09090B; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
          .meta { text-align: right; font-size: 10px; color: #64748B; }
          .tag { display: inline-block; background: #FEF3C7; color: #92400E; font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; margin-top: 4px; }
          
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .stat-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; }
          .stat-lbl { font-size: 9px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; }
          .stat-val { font-size: 20px; font-weight: 800; color: #0F172A; margin-top: 4px; }
          .stat-sub { font-size: 9.5px; color: #10B981; margin-top: 2px; font-weight: 600; }

          .section-title { font-size: 13px; font-weight: 800; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px; margin: 20px 0 10px; border-bottom: 1px solid #CBD5E1; padding-bottom: 4px; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10.5px; }
          th { background: #F1F5F9; color: #334155; text-align: left; padding: 8px 10px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #CBD5E1; }
          td { padding: 8px 10px; border-bottom: 1px solid #E2E8F0; color: #334155; }
          tr:nth-child(even) td { background: #F8FAFC; }
          .mono { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; font-weight: 600; }
          .badge { font-size: 8.5px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; display: inline-block; }
          .b-done { background: #DCFCE7; color: #166534; }
          .b-act { background: #FEF3C7; color: #92400E; }
          .b-p0 { background: #FEE2E2; color: #991B1B; }

          .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #E2E8F0; font-size: 9px; color: #94A3B8; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <div class="logo">☀️</div>
            <div>
              <h1 class="title">Masters Kerala RE Expo 2026</h1>
              <div class="sub">Executive Campaign Status Report</div>
            </div>
          </div>
          <div class="meta">
            <div>Generated: ${todayStr}</div>
            <div>FlumenX Command Center</div>
            <div class="tag">Confidential · Internal Only</div>
          </div>
        </div>

        <div class="stats">
          <div class="stat-card">
            <div class="stat-lbl">Campaign Completion</div>
            <div class="stat-val">${totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}%</div>
            <div class="stat-sub">${completedTasks} / ${totalTasks} Tasks Delivered</div>
          </div>

          <div class="stat-card">
            <div class="stat-lbl">Active Sprint Tasks</div>
            <div class="stat-val">${inProgressTasks}</div>
            <div class="stat-sub" style="color:#F59E0B">In Execution / Review</div>
          </div>

          <div class="stat-card">
            <div class="stat-lbl">Ad Spend Deployed</div>
            <div class="stat-val">₹${spentBudget.toLocaleString('en-IN')}</div>
            <div class="stat-sub" style="color:#3B82F6">of ₹${totalBudget.toLocaleString('en-IN')} Package B Ceiling</div>
          </div>

          <div class="stat-card">
            <div class="stat-lbl">Deliverables Met</div>
            <div class="stat-val">${deliverables.length} Scope Items</div>
            <div class="stat-sub" style="color:#10B981">Tracked On Target</div>
          </div>
        </div>

        <div class="section-title">1. Task Execution & Deliverables Matrix</div>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Task Title</th>
              <th>Type</th>
              <th>Phase</th>
              <th>Priority</th>
              <th>Assignee</th>
              <th>Status</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            ${tasks
              .map(
                (t: any) => `
              <tr>
                <td class="mono"><b>${t.code}</b></td>
                <td><b>${t.title}</b></td>
                <td>${(t.type || '').toUpperCase()}</td>
                <td class="mono">${formatPhaseLabel(t.phase)}</td>
                <td><span class="badge ${t.priority === 'p0' ? 'b-p0' : ''}">${formatPriorityLabel(t.priority)}</span></td>
                <td>${membersMap[t.assignee] || t.assignee}</td>
                <td>
                  <span class="badge ${['published', 'approved'].includes(t.status) ? 'b-done' : 'b-act'}">
                    ${formatStatusLabel(t.status)}
                  </span>
                </td>
                <td class="mono">${t.due}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="section-title">2. Contract Scope & Deliverables Ceiling</div>
        <table>
          <thead>
            <tr>
              <th>Deliverable Name</th>
              <th>Type</th>
              <th>Contracted Ceiling</th>
              <th>Notes / Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${deliverables
              .map(
                (d: any) => `
              <tr>
                <td><b>${d.name}</b></td>
                <td>${(d.type || '').toUpperCase()}</td>
                <td class="mono"><b>${d.contracted} ${d.unit}</b></td>
                <td>${d.note || '—'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="section-title">3. Ad Spend & Budget Breakdown</div>
        <table>
          <thead>
            <tr>
              <th>Platform</th>
              <th>Total Budget</th>
              <th>Spent To Date</th>
              <th>Remaining Budget</th>
              <th>Deployment Pace</th>
            </tr>
          </thead>
          <tbody>
            ${budget
              .map((b: any) => {
                const rem = (b.total || 0) - (b.spent || 0);
                const pct = b.total ? Math.round((b.spent / b.total) * 100) : 0;
                return `
                <tr>
                  <td><b>${b.platform}</b></td>
                  <td class="mono">₹${(b.total || 0).toLocaleString('en-IN')}</td>
                  <td class="mono"><b>₹${(b.spent || 0).toLocaleString('en-IN')}</b></td>
                  <td class="mono">₹${rem.toLocaleString('en-IN')}</td>
                  <td class="mono">${pct}% Deployed</td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>

        <div class="footer">
          <div>Masters Kerala RE Expo 2026 · Campaign Command Center Report</div>
          <div>Page 1 of 1</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(reportHTML);
    printWin.document.close();
  } catch (error) {
    console.error('Failed to generate PDF report:', error);
    alert('Failed to generate PDF report. Falling back to print.');
    window.print();
  }
};

export const exportToExcelCSV = async () => {
  try {
    const [tasksRes, deliverablesRes, kpisRes, budgetRes, membersRes] = await Promise.all([
      api.get('/tasks').catch(() => ({ data: { data: [] } })),
      api.get('/deliverables').catch(() => ({ data: { data: [] } })),
      api.get('/kpis').catch(() => ({ data: { data: [] } })),
      api.get('/budget').catch(() => ({ data: { data: [] } })),
      api.get('/users').catch(() => ({ data: { data: [] } })),
    ]);

    const tasks = tasksRes.data.data || [];
    const deliverables = deliverablesRes.data.data || [];
    const kpis = kpisRes.data.data || [];
    const budget = budgetRes.data.data || [];
    const members = membersRes.data.data || [];

    const membersMap: Record<string, string> = members.reduce((acc: any, m: any) => {
      acc[m.id || m._id] = m.name;
      acc[m.short] = m.name;
      return acc;
    }, {});

    const csvLines: string[] = [];

    // TITLE HEADER
    csvLines.push('MASTERS KERALA RE EXPO 2026 — COMPLETE CAMPAIGN REPORT');
    csvLines.push(`Generated: ${new Date().toLocaleString('en-IN')}`);
    csvLines.push('');

    // SECTION 1: TASKS MATRIX
    csvLines.push('--- SECTION 1: TASK EXECUTION & DELIVERABLES MATRIX ---');
    csvLines.push(['Task Code', 'Task Title', 'Type', 'Campaign Phase', 'Priority', 'Status', 'Assignee Name', 'Reviewer Name', 'Due Date', 'Est Hours'].join(','));
    tasks.forEach((t: any) => {
      csvLines.push([
        t.code || '',
        `"${(t.title || '').replace(/"/g, '""')}"`,
        (t.type || '').toUpperCase(),
        `"${formatPhaseLabel(t.phase)}"`,
        formatPriorityLabel(t.priority),
        formatStatusLabel(t.status),
        `"${membersMap[t.assignee] || t.assignee || ''}"`,
        `"${membersMap[t.reviewer] || t.reviewer || ''}"`,
        t.due || '',
        t.hours || 0,
      ].join(','));
    });

    csvLines.push('');
    csvLines.push('');

    // SECTION 2: CONTRACT DELIVERABLES
    csvLines.push('--- SECTION 2: CONTRACT SCOPE & DELIVERABLES CEILING ---');
    csvLines.push(['Deliverable Name', 'Category Type', 'Contracted Scope Ceiling', 'Unit', 'Notes / Remarks'].join(','));
    deliverables.forEach((d: any) => {
      csvLines.push([
        `"${(d.name || '').replace(/"/g, '""')}"`,
        (d.type || '').toUpperCase(),
        d.contracted || 0,
        d.unit || '',
        `"${(d.note || '').replace(/"/g, '""')}"`,
      ].join(','));
    });

    csvLines.push('');
    csvLines.push('');

    // SECTION 3: AD SPEND & BUDGET
    csvLines.push('--- SECTION 3: AD SPEND & BUDGET BREAKDOWN ---');
    csvLines.push(['Ad Platform', 'Total Approved Budget (INR)', 'Spent To Date (INR)', 'Remaining Budget (INR)', 'Deployment %'].join(','));
    budget.forEach((b: any) => {
      const total = b.total || 0;
      const spent = b.spent || 0;
      const rem = total - spent;
      const pct = total ? Math.round((spent / total) * 100) : 0;
      csvLines.push([
        `"${b.platform}"`,
        total,
        spent,
        rem,
        `${pct}%`,
      ].join(','));
    });

    csvLines.push('');
    csvLines.push('');

    // SECTION 4: KPIS TRACKER
    csvLines.push('--- SECTION 4: KPI TARGETS & FOOTFALL TRACKER ---');
    csvLines.push(['KPI Metric Name', 'Current Value', 'Agreed Floor Min', 'Agreed Target Max', 'Stretch Target Min', 'Stretch Target Max'].join(','));
    kpis.forEach((k: any) => {
      csvLines.push([
        `"${(k.name || '').replace(/"/g, '""')}"`,
        k.current || 0,
        k.agreedMin || 0,
        k.agreedMax || 0,
        k.dreamMin || 0,
        k.dreamMax || 0,
      ].join(','));
    });

    const csvString = csvLines.join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `masters_expo_full_campaign_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to export Excel CSV:', error);
    alert('Failed to export Excel CSV report. Please try again.');
  }
};
