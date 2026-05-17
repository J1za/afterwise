import { z } from 'zod';

export const decisionStatuses = ['processing', 'done', 'error'] as const;
export const decisionStatusSchema = z.enum(decisionStatuses);

export const decisionListSortValues = ['newest', 'oldest'] as const;
export const decisionListSortSchema = z.enum(decisionListSortValues);

export const cognitiveBiasSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

export const missedAlternativeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const decisionAnalysisResultSchema = z.object({
  category: z
    .string()
    .min(2)
    .describe(
      'Short decision category. MUST be one of (English, lowercase): career, relationship, finance, health, lifestyle, education, family, other.',
    ),
  summary: z
    .string()
    .min(20)
    .describe(
      'Concise summary in 2-4 sentences: how the decision looks from the outside and what is worth paying attention to. Written in the requested output language.',
    ),
  cognitiveBiases: z
    .array(cognitiveBiasSchema)
    .max(6)
    .describe(
      'Up to 6 potential cognitive biases with a short explanation grounded in the user’s situation. Explanations in the requested output language.',
    ),
  missedAlternatives: z
    .array(missedAlternativeSchema)
    .max(5)
    .describe(
      'Up to 5 alternatives the user likely did not consider. Each item is a short title and explanation, in the requested output language.',
    ),
});

type Translator = (key: string) => string;

export const createDecisionInputSchema = z.object({
  situation: z.string().trim().min(10).max(4000),
  decision: z.string().trim().min(5).max(2000),
  reasoning: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export function buildDecisionInputSchema(t: Translator) {
  return z.object({
    situation: z
      .string()
      .trim()
      .min(10, t('situationMin'))
      .max(4000, t('situationMax')),
    decision: z
      .string()
      .trim()
      .min(5, t('decisionMin'))
      .max(2000, t('decisionMax')),
    reasoning: z
      .string()
      .trim()
      .max(4000, t('reasoningMax'))
      .optional()
      .or(z.literal('').transform(() => undefined)),
  });
}

export const authCredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(72),
});

export function buildSignupCredentialsSchema(
  t: Translator,
  mode: 'signin' | 'signup',
) {
  const base = z.object({
    email: z.email(t('invalidEmail')),
    password: z
      .string()
      .min(6, t('passwordMin'))
      .max(72, t('passwordMax')),
    passwordConfirm: z.string(),
  });

  if (mode === 'signin') return base;

  return base.refine((data) => data.password === data.passwordConfirm, {
    message: t('passwordMismatch'),
    path: ['passwordConfirm'],
  });
}

const decisionRowSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  situation: z.string(),
  decision: z.string(),
  reasoning: z.string().nullable(),
  status: decisionStatusSchema,
  error_message: z.string().nullable(),
  language: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

const analysisRowSchema = z.object({
  decision_id: z.uuid(),
  category: z.string(),
  cognitive_biases: z.array(cognitiveBiasSchema).catch([]),
  missed_alternatives: z.array(missedAlternativeSchema).catch([]),
  summary: z.string(),
  model_id: z.string(),
  created_at: z.string(),
});

export const decisionSchema = decisionRowSchema.transform((row) => ({
  id: row.id,
  userId: row.user_id,
  situation: row.situation,
  decision: row.decision,
  reasoning: row.reasoning,
  status: row.status,
  errorMessage: row.error_message,
  language: row.language,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
}));

export const decisionAnalysisSchema = analysisRowSchema.transform((row) => ({
  decisionId: row.decision_id,
  category: row.category,
  cognitiveBiases: row.cognitive_biases,
  missedAlternatives: row.missed_alternatives,
  summary: row.summary,
  modelId: row.model_id,
  createdAt: row.created_at,
}));

export const decisionWithAnalysisSchema = decisionRowSchema
  .extend({
    decision_analyses: z
      .union([analysisRowSchema, z.array(analysisRowSchema), z.null()])
      .optional(),
  })
  .transform((row) => {
    const rawAnalysis = Array.isArray(row.decision_analyses)
      ? (row.decision_analyses[0] ?? null)
      : (row.decision_analyses ?? null);
    return {
      id: row.id,
      userId: row.user_id,
      situation: row.situation,
      decision: row.decision,
      reasoning: row.reasoning,
      status: row.status,
      errorMessage: row.error_message,
      language: row.language,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      analysis: rawAnalysis
        ? {
            decisionId: rawAnalysis.decision_id,
            category: rawAnalysis.category,
            cognitiveBiases: rawAnalysis.cognitive_biases,
            missedAlternatives: rawAnalysis.missed_alternatives,
            summary: rawAnalysis.summary,
            modelId: rawAnalysis.model_id,
            createdAt: rawAnalysis.created_at,
          }
        : null,
    };
  });
