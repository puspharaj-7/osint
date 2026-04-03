import { supabase } from '@/lib/supabaseClient';
import type { Report, RiskLevel } from '@/lib/database.types';

export async function getReports(caseId?: string): Promise<Report[]> {
  let query = supabase
    .from('reports')
    .select(`
      *,
      case:cases(id, case_number, title, status),
      generator:profiles!reports_generated_by_fkey(id, full_name, role),
      approver:profiles!reports_approved_by_fkey(id, full_name, role)
    `)
    .order('created_at', { ascending: false });

  if (caseId) query = query.eq('case_id', caseId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as unknown as Report[];
}

export async function getReport(id: string): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      case:cases(id, case_number, title),
      generator:profiles!reports_generated_by_fkey(id, full_name),
      approver:profiles!reports_approved_by_fkey(id, full_name)
    `)
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as Report;
}

export interface CreateReportInput {
  case_id: string;
  generated_by: string;
  report_title: string;
  executive_summary?: string;
  overall_risk?: RiskLevel;
  conclusion?: string;
}

export async function createReport(input: CreateReportInput): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .insert({ ...input, status: 'draft' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Report;
}

export async function updateReport(
  id: string,
  updates: Partial<Pick<Report, 'report_title' | 'executive_summary' | 'overall_risk' | 'conclusion' | 'status'>>
): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Report;
}

/** Manager/Admin: approve a report (moves to 'final') */
export async function approveReport(id: string, approverId: string): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .update({
      status: 'final',
      approved_by: approverId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Report;
}

/** Manager/Admin: deliver report to client */
export async function deliverReport(id: string): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .update({
      status: 'delivered',
      is_visible_to_client: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Report;
}

/** Client portal: get only delivered reports for their case */
export async function getClientReports(caseId: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('case_id', caseId)
    .eq('status', 'delivered')
    .eq('is_visible_to_client', true)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as Report[];
}
