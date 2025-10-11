"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLoading } from "@/components/providers/LoadingProvider";
import { Loader } from "@/components/ui/loader";

export default function AdminExpensesPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push("/admin/my-expenses/unreported");
  }, [router]);

  return (
    <div className="">
      <Loader size="lg" text="Loading expenses..." />
    </div>
  );
}
