import type { PropsWithChildren } from "react";
import { TopHeader } from "./TopHeader";

type PageShellProps = PropsWithChildren<{
  fullPage?: boolean;
}>;

export function PageShell({ children, fullPage = false }: PageShellProps) {
  if (fullPage) {
    return <div className="min-h-screen bg-background text-text-primary">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <TopHeader />
      <main className="mx-auto min-h-[calc(100vh-8rem)] max-w-[1440px] px-4 py-5 sm:px-6 md:min-h-[calc(100vh-76px)] md:py-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
