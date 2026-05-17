'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';
import {
  BarChart3,
  Home,
  Languages,
  LogOut,
  Moon,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Scroll,
  Sun,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Brand } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { setLocaleAction } from '@/app/actions/setLocale';
import { LogoutConfirmDialog } from '@/components/molecules/auth';
import { useDecisionsRealtime } from '@/hooks';
import { locales, type Locale } from '@/i18n';
import { cn } from '@/lib';
import type { AppSidebarProps } from '@/types';

export function AppSidebar({ isGuest }: AppSidebarProps) {
  const pathname = usePathname();
  const tNav = useTranslations('nav');
  const tLang = useTranslations('nav.language');
  const tTheme = useTranslations('nav.theme');
  const { toggleSidebar } = useSidebar();

  useDecisionsRealtime();

  const allLinks = [
    { href: '/' as const, label: tNav('home'), icon: Home, match: 'exact' as const },
    {
      href: '/decisions/new' as const,
      label: tNav('new'),
      icon: Plus,
      match: 'startsWith' as const,
    },
    {
      href: '/decisions' as const,
      label: tNav('history'),
      icon: Scroll,
      match: 'exact' as const,
    },
    {
      href: '/dashboard' as const,
      label: tNav('dashboard'),
      icon: BarChart3,
      match: 'exact' as const,
    },
  ];

  const links = isGuest
    ? allLinks.filter((link) => link.href !== '/dashboard')
    : allLinks;

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="p-2">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <Link
            href="/"
            className="flex items-center px-1 group-data-[collapsible=icon]:hidden"
          >
            <Brand labelClassName="text-sidebar-foreground" />
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            aria-label={tNav('toggleSidebar')}
          >
            <PanelLeftClose
              strokeWidth={1.75}
              className="group-data-[collapsible=icon]:hidden"
            />
            <PanelLeft
              strokeWidth={1.75}
              className="hidden group-data-[collapsible=icon]:block"
            />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-8">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {links.map(({ href, label, icon: Icon, match }) => {
                const isActive =
                  match === 'exact' ? pathname === href : pathname.startsWith(href);
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={label}
                      size="lg"
                    >
                      <Link href={href}>
                        <Icon strokeWidth={1.75} className="size-5" />
                        <span className="text-sm">{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarLanguageMenuItem tLang={tLang} />
          <SidebarThemeMenuItem tTheme={tTheme} />
          <SidebarMenuItem>
            <LogoutConfirmDialog
              trigger={
                <SidebarMenuButton
                  tooltip={tNav('logout')}
                  className="text-rose-400/80 hover:bg-rose-400/10 hover:text-rose-400"
                >
                  <LogOut strokeWidth={1.75} />
                  <span className="text-sm">{tNav('logout')}</span>
                </SidebarMenuButton>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarLanguageMenuItem({
  tLang,
}: {
  tLang: ReturnType<typeof useTranslations>;
}) {
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();

  function change(locale: Locale) {
    startTransition(async () => {
      await setLocaleAction(locale);
    });
  }

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton tooltip={tLang('label')} disabled={isPending}>
            <Languages strokeWidth={1.75} />
            <span className="text-sm">{tLang(currentLocale as Locale)}</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          {locales.map((locale) => (
            <DropdownMenuItem
              key={locale}
              onClick={() => change(locale)}
              className={cn({ 'font-semibold': currentLocale === locale })}
            >
              {tLang(locale)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

function SidebarThemeMenuItem({
  tTheme,
}: {
  tTheme: ReturnType<typeof useTranslations>;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const Icon = isDark ? Sun : Moon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        tooltip={tTheme('label')}
        aria-label={tTheme('label')}
        aria-pressed={isDark}
      >
        <Icon strokeWidth={1.75} />
        <span className="text-sm">
          {isDark ? tTheme('light') : tTheme('dark')}
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
