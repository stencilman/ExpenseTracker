import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home } from "lucide-react";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

export default async function NotAuthorized() {
  const session = await auth();
  const isAdmin = session?.user?.role === UserRole.ADMIN;
  const dashboardLink = isAdmin ? "/admin/dashboard" : "/user/dashboard";

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-24 w-24 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-red-600 mb-2">
            Not Authorized
          </h1>
          <div className="h-2 w-24 bg-red-600 mx-auto my-4 rounded-full"></div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Access Denied
          </h2>
          <p className="text-slate-500 mb-6">
            You don't have permission to access this page. Please return to your
            dashboard.
          </p>
        </div>

        <Link
          href={dashboardLink}
          className="flex items-center justify-center gap-2"
        >
          <Button className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
