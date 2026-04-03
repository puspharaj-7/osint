import { supabase } from '@/lib/supabaseClient';
import type { Evidence } from '@/lib/database.types';

const BUCKET = 'evidence';

export async function getEvidence(caseId: string): Promise<Evidence[]> {
  const { data, error } = await supabase
    .from('evidence')
    .select(`*, uploader:profiles(id, full_name, role)`)
    .eq('case_id', caseId)
    .order('uploaded_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as unknown as Evidence[];
}

/**
 * Upload a file to Supabase Storage and create a DB record.
 */
export async function uploadEvidence(
  file: File,
  caseId: string,
  uploadedBy: string,
  options?: { findingId?: string; description?: string }
): Promise<Evidence> {
  const ext = file.name.split('.').pop();
  const path = `${caseId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false });
  if (storageError) throw new Error(storageError.message);

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from('evidence')
    .insert({
      case_id: caseId,
      finding_id: options?.findingId ?? null,
      file_name: file.name,
      file_url: urlData.publicUrl,
      file_type: file.type,
      description: options?.description ?? null,
      uploaded_by: uploadedBy,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Evidence;
}

export async function deleteEvidence(id: string, fileUrl: string): Promise<void> {
  // Extract storage path from URL
  const urlParts = fileUrl.split(`/${BUCKET}/`);
  if (urlParts[1]) {
    await supabase.storage.from(BUCKET).remove([urlParts[1]]);
  }
  const { error } = await supabase.from('evidence').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
