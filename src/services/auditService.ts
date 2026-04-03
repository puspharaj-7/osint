import { supabase } from '@/lib/supabaseClient';
import type { AuditLog } from '@/lib/database.types';

export interface LogActionInput {
  performed_by: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
}

export async function logAction(input: LogActionInput): Promise<void> {
  await supabase.from('audit_log').insert(input);
  // Fire-and-forget — don't throw on audit failure
}

export async function getAuditLog(limit = 50): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_log')
    .select(`*, performer:profiles(id, full_name, role)`)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data as unknown as AuditLog[];
}

export async function getAuditLogForRecord(
  tableName: string,
  recordId: string
): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_log')
    .select(`*, performer:profiles(id, full_name, role)`)
    .eq('table_name', tableName)
    .eq('record_id', recordId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as unknown as AuditLog[];
}
