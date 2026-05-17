import type { ReactNode } from 'react';
import type { Route } from 'next';
import type { z } from 'zod';
import type {
  createDecisionInputSchema,
  authCredentialsSchema,
  decisionSchema,
  decisionAnalysisSchema,
  decisionWithAnalysisSchema,
  decisionStatusSchema,
  decisionListSortSchema,
} from '@/validations/decision.validation';
import type { dashboardStatsSchema } from '@/validations/dashboard.validation';

export type DecisionStatus = z.infer<typeof decisionStatusSchema>;
export type DecisionListSort = z.infer<typeof decisionListSortSchema>;
export type CreateDecisionInput = z.infer<typeof createDecisionInputSchema>;
export type AuthCredentials = z.infer<typeof authCredentialsSchema>;
export type Decision = z.infer<typeof decisionSchema>;
export type DecisionAnalysis = z.infer<typeof decisionAnalysisSchema>;
export type DecisionWithAnalysis = z.infer<typeof decisionWithAnalysisSchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

export type ListDecisionsParams = {
  status?: DecisionStatus;
  category?: string;
  sort?: DecisionListSort;
  limit?: number;
  cursor?: string;
};

export type StatusBadgeProps = {
  status: DecisionStatus;
  className?: string;
};

export type DecisionCardProps = {
  decision: DecisionWithAnalysis;
};

export type DecisionDetailProps = {
  id: string;
};

export type DecisionSectionProps = {
  labelKey: 'situation' | 'decision' | 'reasoning';
  body: string;
  wide?: boolean;
};

export type DecisionErrorBlockProps = {
  message: string | null;
  onRetry: () => void;
  isRetrying: boolean;
};

export type DecisionFailureBlockProps = {
  title: string;
  message: string;
};

export type AnalysisViewProps = {
  analysis: DecisionAnalysis;
};

export type DecisionFiltersProps = {
  status: string;
  category: string;
  sort: DecisionListSort;
  categories: string[];
  onChange: (value: {
    status?: string;
    category?: string;
    sort?: DecisionListSort;
  }) => void;
  onReset: () => void;
};

export type DecisionsListEmptyStateProps = {
  hasFilters: boolean;
  onReset: () => void;
};

export type HomeHeroProps = {
  isGuest?: boolean;
};

export type HomeHeroLatestLabels = {
  label: string;
  categoryLabel: string;
  empty: string;
  emptySubtitle: string;
  cta: string;
};

export type LatestDecisionCardProps = {
  latest: DecisionWithAnalysis | undefined;
  isLoading: boolean;
  translateCategory: (key: string) => string;
  labels: HomeHeroLatestLabels;
};

export type TotalCardProps = {
  total: number;
  isLoading: boolean;
  label: string;
  subtitle: string;
};

export type NewCtaCardProps = {
  title: string;
  subtitle: string;
  button: string;
};

export type TopBiasCardProps = {
  bias: { bias: string; count: number } | undefined;
  isLoading: boolean;
  label: string;
  empty: string;
};

export type DetailStatLabels = {
  label: string;
  subtitle: string;
  done: string;
  processing: string;
  errored: string;
};

export type DetailStatCardProps = {
  totals:
    | { total: number; processing: number; done: number; errored: number }
    | undefined;
  isLoading: boolean;
  labels: DetailStatLabels;
};

export type StatRowProps = {
  label: string;
  value: number;
  isLoading: boolean;
  dotClassName: string;
};

export type HeroCardProps = {
  className?: string;
  label: string;
  labelClassName?: string;
  action?: ReactNode;
  href?: Route;
  children: ReactNode;
};

export type KpiVariant = 'total' | 'processing' | 'done' | 'error';

export type KpiProps = {
  label: string;
  value: number;
  variant: KpiVariant;
};

export type ChartCardProps = {
  icon: ReactNode;
  title: string;
  empty?: boolean;
  children: ReactNode;
};
