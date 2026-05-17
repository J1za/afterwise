import 'server-only';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { createAdminClient } from '@/lib';
import { buildDecisionAnalysisSystemPrompt } from '@/constants';
import { decisionAnalysisResultSchema } from '@/validations';

const defaultModel = 'claude-haiku-4-5-20251001';

export const Llm = {
  async runAnalysis(decisionId: string) {
    const admin = createAdminClient();
    const modelId = process.env.ANTHROPIC_MODEL ?? defaultModel;

    const { data: row, error: fetchError } = await admin
      .from('decisions')
      .select('id, situation, decision, reasoning, language')
      .eq('id', decisionId)
      .single();

    if (fetchError || !row) {
      console.error('[llm] cannot load decision', decisionId, fetchError);
      return;
    }

    try {
      const userPrompt = [
        `Situation:\n${row.situation}`,
        `Decision made:\n${row.decision}`,
        row.reasoning ? `User reasoning:\n${row.reasoning}` : null,
      ]
        .filter(Boolean)
        .join('\n\n');

      const { object } = await generateObject({
        model: anthropic(modelId),
        schema: decisionAnalysisResultSchema,
        system: buildDecisionAnalysisSystemPrompt(row.language ?? 'uk'),
        prompt: userPrompt,
        temperature: 0.5,
      });

      const { error: insertError } = await admin
        .from('decision_analyses')
        .upsert(
          {
            decision_id: decisionId,
            category: object.category,
            cognitive_biases: object.cognitiveBiases,
            missed_alternatives: object.missedAlternatives,
            summary: object.summary,
            model_id: modelId,
          },
          { onConflict: 'decision_id' },
        );

      if (insertError) throw insertError;

      await admin
        .from('decisions')
        .update({ status: 'done', error_message: null })
        .eq('id', decisionId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown LLM error';
      console.error('[llm] analysis failed', decisionId, error);
      await admin
        .from('decisions')
        .update({ status: 'error', error_message: message })
        .eq('id', decisionId);
    }
  },
};
