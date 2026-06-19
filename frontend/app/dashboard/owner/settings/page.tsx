import { ProfileSettings } from "@/components/settings/profile-settings";

export default function OwnerSettingsPage() {
  return (
    <ProfileSettings
      title="Account Settings"
      roleLabel="Property Owner"
      role="owner"
    />
  );
}
