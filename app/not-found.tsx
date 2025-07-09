import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center ">
      <div className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-blue-600">404</h1>
          <div className="h-2 w-24 bg-blue-600 mx-auto my-4 rounded-full"></div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-slate-500 mb-6">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link
          href="/user/dashboard"
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
