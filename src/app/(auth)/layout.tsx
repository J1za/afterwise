import { GradientBackdrop } from '@/components/atoms';
import { LanguageToggle, ThemeToggle } from '@/components/molecules';

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 sm:p-8">
      <GradientBackdrop />
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-4xl">{children}</div>
    </div>
  );
}
