import type { ReactNode } from "react";
import { ScholarLearnHeader } from "./ScholarLearnHeader";

type ScholarLearnNotificationDialogRenderer = ReactNode | ((onClose: () => void) => ReactNode);

export function ScholarLearnShell({
  activePath,
  children,
  hasPendingApprovalNotifications,
  notificationDialog,
}: {
  activePath?: string;
  children: ReactNode;
  hasPendingApprovalNotifications?: boolean;
  notificationDialog?: ScholarLearnNotificationDialogRenderer;
}) {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <ScholarLearnHeader
        activePath={activePath}
        hasPendingApprovalNotifications={hasPendingApprovalNotifications}
        notificationDialog={notificationDialog}
      />
      <main className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
