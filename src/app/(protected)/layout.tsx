import { redirect } from 'next/navigation';
import { ProtectedLayout } from '@/components/templates';
import { getServerAuthStatus } from '@/utilities/getServerAuthStatus';

export default async function ProtectedRouteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const status = await getServerAuthStatus();
  if (!status.user) redirect('/login');

  return (
    <ProtectedLayout
      isGuest={status.isGuest}
      canCreateDecision={status.canCreateDecision}
    >
      {children}
    </ProtectedLayout>
  );
}
