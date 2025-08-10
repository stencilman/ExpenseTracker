import NavBar from "@/components/navigation/NavBar";
import SideNavAdmin from "@/components/navigation/SideNavAdmin";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen">
      <NavBar isAdmin />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <SideNavAdmin />
        </div>
        <main className="flex-1  p-2 sm:p-4">{children}</main>
      </div>
    </div>
  );
}
