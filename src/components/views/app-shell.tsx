import type { ReactNode } from "react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Logo } from "@/components/ui/logo";

type Props = {
  basePath: string;
  introCount: number;
  /** Right side of the header: sign out for real users, "exit demo" in demo mode. */
  headerAction: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
};

export function AppShell({ basePath, introCount, headerAction, banner, children }: Props) {
  return (
    <>
      {banner}
      <header className="flex items-center justify-between border-b-[1.5px] border-line bg-bg px-4 py-2">
        <Logo />
        {headerAction}
      </header>

      <div className="flex flex-1 flex-col">{children}</div>

      <BottomNav introCount={introCount} basePath={basePath} />
    </>
  );
}
