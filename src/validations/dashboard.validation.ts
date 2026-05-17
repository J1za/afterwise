import { z } from 'zod';

export const dashboardStatsSchema = z.object({
  totals: z.object({
    total: z.number().int().nonnegative(),
    processing: z.number().int().nonnegative(),
    done: z.number().int().nonnegative(),
    errored: z.number().int().nonnegative(),
  }),
  byCategory: z.array(
    z.object({ category: z.string(), count: z.number().int().nonnegative() }),
  ),
  byBias: z.array(
    z.object({ bias: z.string(), count: z.number().int().nonnegative() }),
  ),
  byMonth: z.array(
    z.object({ month: z.string(), count: z.number().int().nonnegative() }),
  ),
});
