import { ProfileSettings } from "@/components/settings/profile-settings";

export default function AdminSettingsPage() {
  return (
    <ProfileSettings
      title="Account Settings"
      roleLabel="Administrator"
      role="admin"
    />
  );
}
