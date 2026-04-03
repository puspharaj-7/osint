import { supabase } from '@/lib/supabaseClient';
import type { Client } from '@/lib/database.types';

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as Client[];
}

export async function getClient(id: string): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as Client;
}

export async function getClientByProfileId(profileId: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Client | null;
}

export interface CreateClientInput {
  profile_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  address?: string;
}

export async function createClient(input: CreateClientInput): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Client;
}

export async function updateClient(
  id: string,
  updates: Partial<Omit<Client, 'id' | 'created_at'>>
): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Client;
}
