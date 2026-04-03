// Auto-generated types matching the Supabase DB schema
// Update if the schema changes

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

export interface Client {
  id: string;
  profile_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  address: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Investigator {
  id: string;
  profile_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  specialization: string | null;
  status: string;
  created_at: string;
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
  // Joined fields
  client?: Client;
  investigator?: Investigator;
  manager?: Profile;
}

export interface Subject {
  id: string;
  case_id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  national_id: string | null;
  passport_number: string | null;
  phone: string | null;
  email: string | null;
  current_address: string | null;
  permanent_address: string | null;
  occupation: string | null;
  employer: string | null;
  created_at: string;
}

export interface OsintFinding {
  id: string;
  case_id: string;
  subject_id: string | null;
  investigator_id: string | null;
  source_type: 'social_media' | 'public_record' | 'news' | 'court_record' | 'employment' | 'financial' | 'criminal' | 'address' | 'other';
  source_name: string | null;
  source_url: string | null;
  finding_summary: string;
  risk_level: RiskLevel;
  verified: boolean;
  is_visible_to_client: boolean;
  found_at: string;
  // Joined
  investigator?: Profile;
}

export interface Evidence {
  id: string;
  case_id: string;
  finding_id: string | null;
  file_name: string;
  file_url: string;
  file_type: string | null;
  description: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
  // Joined
  uploader?: Profile;
}

export interface Report {
  id: string;
  case_id: string;
  generated_by: string | null;
  approved_by: string | null;
  report_title: string;
  executive_summary: string | null;
  overall_risk: RiskLevel;
  conclusion: string | null;
  status: ReportStatus;
  is_visible_to_client: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  case?: Case;
  generator?: Profile;
  approver?: Profile;
}

export interface CaseActivity {
  id: string;
  case_id: string;
  performed_by: string | null;
  action: string;
  note: string | null;
  created_at: string;
  // Joined
  performer?: Profile;
}

export interface AuditLog {
  id: string;
  performed_by: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  performer?: Profile;
}
