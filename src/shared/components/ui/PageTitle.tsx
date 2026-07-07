import type { ReactNode } from "react";

type PageTitleProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageTitle({ title, description, action }: PageTitleProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[30px] font-extrabold leading-tight text-text-primary sm:text-[34px]">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-[15px] leading-6 text-text-secondary">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
