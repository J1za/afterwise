import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib';
import type { AuthCredentials, AuthUser } from '@/types';

function mapUser(
  user: { id: string; email?: string | null } | null,
): AuthUser | null {
  if (!user) return null;
  return { id: user.id, email: user.email ?? null };
}

export const Auth = {
  async signUp({ email, password }: AuthCredentials) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return mapUser(data.user);
  },

  async signIn({ email, password }: AuthCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    const mapped = mapUser(data.user);
    if (!mapped) throw new Error('user_not_found');
    return mapped;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return mapUser(user);
  },

  async signInAsGuest() {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    const mapped = mapUser(data.user);
    if (!mapped) throw new Error('user_not_found');
    return mapped;
  },

  async getServerStatus(serverClient: SupabaseClient) {
    const {
      data: { user },
    } = await serverClient.auth.getUser();
    const mapped = mapUser(user);
    if (!mapped) {
      return {
        user: null,
        isGuest: false,
        decisionCount: 0,
        canCreateDecision: false,
        firstDecisionId: null,
      };
    }
    const isGuest =
      (user as { is_anonymous?: boolean } | null)?.is_anonymous === true;
    if (!isGuest) {
      return {
        user: mapped,
        isGuest: false,
        decisionCount: 0,
        canCreateDecision: true,
        firstDecisionId: null,
      };
    }
    const { data, count } = await serverClient
      .from('decisions')
      .select('id', { count: 'exact' })
      .order('created_at', { ascending: true })
      .limit(1);
    const decisionCount = count ?? 0;
    return {
      user: mapped,
      isGuest: true,
      decisionCount,
      canCreateDecision: decisionCount === 0,
      firstDecisionId: data?.[0]?.id ?? null,
    };
  },
};
