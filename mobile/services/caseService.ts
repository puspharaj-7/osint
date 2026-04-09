import { supabase } from '../lib/supabase';
import type { Case } from '../lib/types';

export async function getCases(): Promise<Case[]> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Case[];
}
