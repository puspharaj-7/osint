export type UserRole = 'admin' | 'manager' | 'investigator' | 'client';
export type CaseStatus = 'open' | 'in_progress' | 'on_hold' | 'closed' | 'cancelled';
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';
export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus = 'draft' | 'review' | 'final' | 'delivered';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  case_number: string;
  title: string;
  description: string | null;
  client_id: string | null;
  assigned_to: string | null;
  managed_by: string | null;
  priority: CasePriority;
  status: CaseStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  case_id: string;
  report_title: string;
  overall_risk: RiskLevel;
  status: ReportStatus;
  is_visible_to_client: boolean;
  created_at: string;
  updated_at: string;
}
