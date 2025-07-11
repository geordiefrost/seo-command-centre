import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper function to handle errors
export function handleSupabaseError(error: any) {
  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message || 'Database error occurred');
  }
}

// Helper function to check if user is authenticated
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    handleSupabaseError(error);
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Helper function to sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    handleSupabaseError(error);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}