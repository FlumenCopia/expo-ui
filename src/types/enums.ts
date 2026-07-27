/* ENUMS FOR FRONTEND CAMPAIGN COMMAND CENTER */

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  OPS_HEAD = 'ops_head',
  TEAM_LEAD = 'team_lead',
  MEMBER = 'member',
  QC = 'qc',
  ACCOUNTS = 'accounts',
  CLIENT = 'client',
}

export enum TaskPhase {
  PH1_IGNITE = 'ph1',
  PH2_AMPLIFY = 'ph2',
  PH3_CONVERT = 'ph3',
  PH4_LAST_MILE = 'ph4',
  PH5_LIVE_POST = 'ph5',
}

export enum TaskType {
  DESIGN = 'design',
  VIDEO = 'video',
  ADS = 'ads',
  IT_WEB = 'it',
  CONTENT = 'content',
  OPS = 'ops',
  CLIENT = 'client',
}

export enum TaskPriority {
  P0_CRITICAL = 'p0',
  P1_HIGH = 'p1',
  P2_NORMAL = 'p2',
  P3_LOW = 'p3',
}

export enum TaskStatus {
  BACKLOG = 'backlog',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'progress',
  IN_REVIEW = 'review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
}

export enum DeliverableType {
  DESIGN = 'design',
  VIDEO = 'video',
  ADS = 'ads',
  OPS = 'ops',
  IT = 'it',
  CONTENT = 'content',
}

export const TaskPhaseLabels: Record<TaskPhase, string> = {
  [TaskPhase.PH1_IGNITE]: 'Phase 1 — IGNITE (Jul 18 – Aug 05)',
  [TaskPhase.PH2_AMPLIFY]: 'Phase 2 — AMPLIFY (Aug 06 – Aug 25)',
  [TaskPhase.PH3_CONVERT]: 'Phase 3 — CONVERT (Aug 26 – Sep 15)',
  [TaskPhase.PH4_LAST_MILE]: 'Phase 4 — LAST MILE (Sep 16 – Sep 24)',
  [TaskPhase.PH5_LIVE_POST]: 'Phase 5 — LIVE + POST (Sep 25 – Sep 29)',
};

export const TaskPriorityLabels: Record<TaskPriority, string> = {
  [TaskPriority.P0_CRITICAL]: 'P0 Critical',
  [TaskPriority.P1_HIGH]: 'P1 High',
  [TaskPriority.P2_NORMAL]: 'P2 Normal',
  [TaskPriority.P3_LOW]: 'P3 Low',
};

export const TaskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: 'Backlog',
  [TaskStatus.ASSIGNED]: 'Assigned',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.IN_REVIEW]: 'In Review',
  [TaskStatus.APPROVED]: 'Approved',
  [TaskStatus.PUBLISHED]: 'Published',
};
