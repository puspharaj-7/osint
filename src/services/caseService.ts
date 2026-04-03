import { supabase } from '@/lib/supabaseClient';
import type { Case, CaseStatus, CasePriority } from '@/lib/database.types';

/**
 * Fetch cases — RLS handles role filtering automatically.
 * Admin/manager get all, investigator gets assigned only, client gets own.
 */
export async function getCases(filters?: {
  status?: CaseStatus;
  priority?: CasePriority;
  assigned_to?: string;
}): Promise<Case[]> {
  let query = supabase
    .from('cases')
    .select(`
      *,
      client:clients(id, full_name, email, company_name),
      investigator:investigators(id, full_name, email, specialization),
      manager:profiles!cases_managed_by_fkey(id, full_name, email, role)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.priority) query = query.eq('priority', filters.priority);
  if (filters?.assigned_to) query = query.eq('assigned_to', filters.assigned_to);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as unknown as Case[];
}

/**
 * Fetch a single case by ID (with all joins).
 */
export async function getCase(id: string): Promise<Case> {
  const { data, error } = await supabase
    .from('cases')
    .select(`
      *,
      client:clients(id, full_name, email, phone, company_name, address),
      investigator:investigators(id, full_name, email, phone, specialization),
      manager:profiles!cases_managed_by_fkey(id, full_name, email, role)
    `)
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as Case;
}

export interface CreateCaseInput {
  case_number: string;
  title: string;
  description?: string;
  client_id?: string;
  assigned_to?: string;
  managed_by?: string;
  priority?: CasePriority;
  due_date?: string;
}

/**
 * Create a new case (admin / manager only — enforced by RLS).
 */
export async function createCase(input: CreateCaseInput): Promise<Case> {
  const { data, error } = await supabase
    .from('cases')
    .insert({ ...input, status: 'open' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Case;
}

/**
 * Update case fields.
 */
export async function updateCase(
  id: string,
  updates: Partial<Pick<Case, 'title' | 'description' | 'status' | 'priority' | 'assigned_to' | 'managed_by' | 'due_date'>>
): Promise<Case> {
  const { data, error } = await supabase
    .from('cases')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Case;
}

/**
 * Archive a case (manager: change status to 'cancelled'; admin can set any status).
 */
export async function archiveCase(id: string): Promise<void> {
  const { error } = await supabase
    .from('cases')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

/**
 * Admin-only: permanently delete a case.
 */
export async function deleteCase(id: string): Promise<void> {
  const { error } = await supabase.from('cases').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/**
 * Generate a sequential case number like CASE-2026-042.
 */
export async function generateCaseNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true });
  const seq = String((count ?? 0) + 1).padStart(3, '0');
  return `CASE-${year}-${seq}`;
}
