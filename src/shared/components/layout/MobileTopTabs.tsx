import { useStudentNavigation } from "../../../app/providers/StudentNavigationProvider";
import { cn } from "../../utils/cn";

export function MobileTopTabs() {
  const { activePageKey, pages, setActivePage } = useStudentNavigation();
  const navigationPages = pages.filter((page) => page.showInNavigation !== false);

  return (
    <nav
      aria-label="Student pages"
      className="scrollbar-none flex h-12 gap-2 overflow-x-auto border-t border-border bg-surface px-4 md:hidden"
    >
      {navigationPages.map((page) => {
        const Icon = page.icon;
        const isActive = page.key === activePageKey;

        return (
          <button
            key={page.key}
            type="button"
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "my-2 inline-flex h-8 shrink-0 items-center gap-2 rounded-lg px-3 text-[12px] font-bold transition",
              isActive
                ? "bg-primary-soft text-primary-dark"
                : "text-text-secondary hover:bg-surface-soft hover:text-text-primary",
            )}
            onClick={() => setActivePage(page.key)}
          >
            <Icon aria-hidden="true" size={15} strokeWidth={2.5} />
            <span className="whitespace-nowrap">{page.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
