"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

interface HeaderProps {
  label: string;
  message?: string;
}

export const Header = ({ label, message }: HeaderProps) => {
  const pathName = usePathname();
  const resetPath = pathName.startsWith("/auth/reset");
  const forgetPassPath = pathName.startsWith("auth/new-password");

  return (
    <>
      {resetPath || forgetPassPath ? (
        <div className="flex gap-4">
          <Image src="/auth/lock.svg" height="38" width="46" alt="lock_icon" />
          <div className="w-full flex flex-col gap-y-1 ">
            <p className="text-2xl font-semibold text-primary">{label}</p>
            <p className="text-sm">{message}</p>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-y-1 ">
          <p className="text-sm ">{message}</p>
          <p className="text-primary text-2xl font-semibold ">{label}</p>
        </div>
      )}
    </>
  );
};
