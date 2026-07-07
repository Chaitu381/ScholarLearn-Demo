import { RoleSettingsPage } from "../../../shared/components/profile/RoleSettingsPage";

export function LecturerSettings() {
  return (
    <RoleSettingsPage
      profilePath="/lecturer/profile"
      roleKind="lecturer"
      roleLabel="Lecturer"
    />
  );
}
