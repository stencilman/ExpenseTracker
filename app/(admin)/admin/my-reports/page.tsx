"use client";

import { useEffect } from "react";
import { Loader } from "@/components/ui/loader";
import { useRouter } from "next/navigation";

export default function AdminReportsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/my-reports/pending");
  }, [router]);

  return <Loader size="lg" text="Loading reports..." />;
}
