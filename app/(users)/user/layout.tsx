"use client";

import NavBar from "@/components/navigation/NavBar";
import SideNav from "@/components/navigation/SideNav";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <SideNav />
        </div>
        <main className="flex-1  p-2 sm:p-4">{children}</main>
      </div>
    </div>
  );
}
