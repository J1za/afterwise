import { supabase } from '@/lib';
import {
  decisionSchema,
  decisionWithAnalysisSchema,
} from '@/validations';
import type {
  CreateDecisionInput,
  DecisionListSort,
  ListDecisionsParams,
} from '@/types';

export const Decisions = {
  async list(params: ListDecisionsParams = {}) {
    const sort: DecisionListSort = params.sort ?? 'newest';
    const ascending = sort === 'oldest';

    const relation = params.category
      ? 'decision_analyses!inner(*)'
      : 'decision_analyses(*)';

    let query = supabase
      .from('decisions')
      .select(`*, ${relation}`)
      .order('created_at', { ascending });

    if (params.status) query = query.eq('status', params.status);
    if (params.category) {
      query = query.eq('decision_analyses.category', params.category);
    }
    if (params.cursor) {
      query = ascending
        ? query.gt('created_at', params.cursor)
        : query.lt('created_at', params.cursor);
    }
    if (params.limit) query = query.limit(params.limit);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => decisionWithAnalysisSchema.parse(row));
  },

  async getOne(id: string) {
    const { data, error } = await supabase
      .from('decisions')
      .select('*, decision_analyses(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return decisionWithAnalysisSchema.parse(data);
  },

  async create(userId: string, input: CreateDecisionInput) {
    const { data, error } = await supabase
      .from('decisions')
      .insert({
        user_id: userId,
        situation: input.situation,
        decision: input.decision,
        reasoning: input.reasoning ?? null,
        status: 'processing',
      })
      .select('*')
      .single();
    if (error) throw error;
    return decisionSchema.parse(data);
  },

  async usedCategories() {
    const { data, error } = await supabase
      .from('decision_analyses')
      .select('category');
    if (error) throw error;
    const set = new Set<string>();
    (data ?? []).forEach((row: { category: string | null }) => {
      if (row.category) set.add(row.category);
    });
    return Array.from(set).sort();
  },

  async retry(id: string) {
    const { data, error } = await supabase
      .from('decisions')
      .update({ status: 'processing', error_message: null })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return decisionSchema.parse(data);
  },
};
