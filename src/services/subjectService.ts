import { supabase } from '@/lib/supabaseClient';
import type { Subject } from '@/lib/database.types';

export async function getSubjects(caseId: string): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Subject[];
}

export interface CreateSubjectInput {
  case_id: string;
  full_name: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  national_id?: string;
  passport_number?: string;
  phone?: string;
  email?: string;
  current_address?: string;
  permanent_address?: string;
  occupation?: string;
  employer?: string;
}

export async function createSubject(input: CreateSubjectInput): Promise<Subject> {
  const { data, error } = await supabase
    .from('subjects')
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Subject;
}

export async function updateSubject(
  id: string,
  updates: Partial<Omit<Subject, 'id' | 'case_id' | 'created_at'>>
): Promise<Subject> {
  const { data, error } = await supabase
    .from('subjects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Subject;
}

export async function deleteSubject(id: string): Promise<void> {
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
