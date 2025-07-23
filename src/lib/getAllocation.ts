import { supabase } from './supabase';

export interface AllocationRow {
  wallet_address: string;
  allocation_amount: number;
  tokens_qualified_for: string;
  claimed: boolean;
  claimed_at: string | null;
}

export async function getAllocation(walletAddress: string) {
  const { data, error } = await supabase
    .from<AllocationRow>('flur_claims')
    .select('*')
    .eq('wallet_address', walletAddress)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function markClaimed(walletAddress: string) {
  const { error } = await supabase
    .from('flur_claims')
    .update({ claimed: true, claimed_at: new Date().toISOString() })
    .eq('wallet_address', walletAddress);

  if (error) throw error;
}
