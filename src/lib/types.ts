export type Role =
  | "super_admin"
  | "security_analyst"
  | "maintenance_engineer"
  | "operations_manager"
  | "viewer";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  title?: string;
  avatarColor?: string;
  phone?: string;
  status: "active" | "suspended" | "invited";
  mfaEnabled?: boolean;
  lastLoginAt?: string;
  lastActiveAt?: string;
  createdAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiList<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface Asset {
  _id: string;
  assetTag: string;
  name: string;
  category: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  status: "operational" | "degraded" | "maintenance" | "offline" | "retired";
  criticality: "critical" | "high" | "medium" | "low";
  environment: string;
  location: string;
  region: string;
  ipAddress: string;
  os: string;
  owner: string;
  healthScore: number;
  purchaseDate?: string;
  warrantyExpiry?: string;
  lifecycleStage: string;
  costMonthly: number;
  tags: string[];
  lastSeenAt?: string;
  createdAt?: string;
}

export interface SecurityEvent {
  _id: string;
  eventId: string;
  type: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  status: string;
  riskScore: number;
  sourceIp: string;
  destinationIp: string;
  geoLocation: string;
  targetUser: string;
  mitreTactic: string;
  detectionSource: string;
  cveId?: string;
  occurredAt: string;
}

export interface Incident {
  _id: string;
  incidentId: string;
  title: string;
  summary: string;
  severity: "sev1" | "sev2" | "sev3" | "sev4";
  priority: "critical" | "high" | "medium" | "low";
  status: string;
  impact: string;
  category: string;
  affectedServices: string[];
  commanderName?: string;
  detectedAt: string;
  resolvedAt?: string;
  rootCause?: string;
  escalationLevel: number;
  timeline?: { at: string; status: string; note: string; actorName: string }[];
  createdAt?: string;
}

export interface Ticket {
  _id: string;
  ticketId: string;
  subject: string;
  description: string;
  category: string;
  priority: "critical" | "high" | "medium" | "low";
  status: string;
  requesterName?: string;
  assigneeName?: string;
  slaDueAt?: string;
  slaBreached: boolean;
  createdAt?: string;
}

export interface MaintenanceTask {
  _id: string;
  workOrderId: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: "critical" | "high" | "medium" | "low";
  assetName?: string;
  assignedTeam: string;
  assigneeName?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  progress: number;
  estimatedHours: number;
  recurrence: string;
  checklist: { _id: string; label: string; done: boolean }[];
  createdAt?: string;
}

export interface Report {
  _id: string;
  reportId: string;
  name: string;
  type: string;
  description: string;
  framework?: string;
  period: string;
  format: string;
  status: string;
  score?: number;
  generatedByName?: string;
  fileSize: string;
  createdAt?: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  severity: "critical" | "warning" | "info" | "success";
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface DashboardData {
  kpis: {
    totalAssets: number;
    activeSystems: number;
    criticalIncidents: number;
    openTickets: number;
    securityScore: number;
    infrastructureHealth: number;
    slaCompliance: number;
    uptime: number;
  };
  trends: {
    uptime: number[];
    incidents: number[];
    requestsPerSec: number[];
    latencyMs: number[];
  };
  distribution: {
    assetsByCategory: { key: string; value: number }[];
    assetsByStatus: { key: string; value: number }[];
    incidentsBySeverity: { key: string; value: number }[];
  };
  recentIncidents: Incident[];
  recentSecurity: SecurityEvent[];
}
