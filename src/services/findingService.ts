import { supabase } from '@/lib/supabaseClient';
import type { OsintFinding, RiskLevel } from '@/lib/database.types';

export async function getFindings(caseId: string): Promise<OsintFinding[]> {
  const { data, error } = await supabase
    .from('osint_findings')
    .select(`*, investigator:profiles(id, full_name, role)`)
    .eq('case_id', caseId)
    .order('found_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as unknown as OsintFinding[];
}

export interface CreateFindingInput {
  case_id: string;
  subject_id?: string;
  investigator_id: string;
  source_type: OsintFinding['source_type'];
  source_name?: string;
  source_url?: string;
  finding_summary: string;
  risk_level?: RiskLevel;
  verified?: boolean;
  is_visible_to_client?: boolean;
}

export async function createFinding(input: CreateFindingInput): Promise<OsintFinding> {
  const { data, error } = await supabase
    .from('osint_findings')
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as OsintFinding;
}

export async function updateFinding(
  id: string,
  updates: Partial<Pick<OsintFinding, 'finding_summary' | 'risk_level' | 'verified' | 'is_visible_to_client' | 'source_url'>>
): Promise<OsintFinding> {
  const { data, error } = await supabase
    .from('osint_findings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as OsintFinding;
}

export async function deleteFinding(id: string): Promise<void> {
  const { error } = await supabase.from('osint_findings').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
