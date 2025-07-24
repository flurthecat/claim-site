import { supabase, isSupabaseConfigured } from './supabase.js';

export interface AllocationRow {
  wallet_address: string;
  allocation_amount: number;
  tokens_qualified_for: string;
  claimed: boolean;
  claimed_at: string | null;
}

export async function getAllocation(walletAddress: string): Promise<AllocationRow | null> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase configuration is missing. Please check your environment variables.');
  }

  try {
    const { data, error } = await supabase
      .from('flur_claims')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    if (error) {
      console.error('Error fetching allocation:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('getAllocation error:', error);
    throw error;
  }
}

export async function markClaimed(walletAddress: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase configuration is missing. Please check your environment variables.');
  }

  try {
    const { error } = await supabase
      .from('flur_claims')
      .update({ 
        claimed: true, 
        claimed_at: new Date().toISOString() 
      })
      .eq('wallet_address', walletAddress);

    if (error) {
      console.error('Error marking as claimed:', error);
      throw error;
    }
  } catch (error) {
    console.error('markClaimed error:', error);
    throw error;
  }
}