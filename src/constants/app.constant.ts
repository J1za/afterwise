export const queryKeys = {
  decisions: {
    all: () => ['decisions'] as const,
    list: (params?: {
      status?: string;
      category?: string;
      sort?: string;
      limit?: number;
      cursor?: string;
    }) => ['decisions', 'list', params ?? {}] as const,
    usedCategories: () => ['decisions', 'usedCategories'] as const,
    detail: (id: string) => ['decisions', 'detail', id] as const,
  },
  dashboard: {
    all: () => ['dashboard'] as const,
    stats: () => ['dashboard', 'stats'] as const,
  },
} as const;

export const sidebarCookieName = 'sidebar_state';
export const sidebarCookieMaxAge = 60 * 60 * 24 * 7;
export const sidebarWidth = '16rem';
export const sidebarWidthIcon = '3rem';
export const sidebarKeyboardShortcut = 'b';
