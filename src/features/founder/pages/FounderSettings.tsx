import { RoleSettingsPage } from "../../../shared/components/profile/RoleSettingsPage";

export function FounderSettings() {
  return (
    <RoleSettingsPage
      includeApprovalNotifications
      profilePath="/founder/profile"
      roleKind="founder"
      roleLabel="Founder"
    />
  );
}
