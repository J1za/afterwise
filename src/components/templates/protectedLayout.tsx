import { cookies } from 'next/headers';
import { GradientBackdrop } from '@/components/atoms';
import { AppSidebar, GuestBanner } from '@/components/molecules';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { sidebarCookieName } from '@/constants';
import type { ProtectedLayoutProps } from '@/types';

export async function ProtectedLayout({
  children,
  isGuest,
  canCreateDecision,
}: ProtectedLayoutProps) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get(sidebarCookieName)?.value === 'true';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <GradientBackdrop />
      <AppSidebar isGuest={isGuest} />
      <SidebarInset className="rounded-xl py-8 pl-4 pr-4 sm:py-10 sm:pl-10 sm:pr-6">
        {isGuest && (
          <div className="mb-6">
            <GuestBanner limitReached={!canCreateDecision} />
          </div>
        )}
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
