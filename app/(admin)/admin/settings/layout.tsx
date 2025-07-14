import SettingsSideNav from "@/components/admin/settings/navigation/SettingsSideNav";

export default function AdminSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <SettingsSideNav />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
