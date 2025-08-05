"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { useRouter } from "next/navigation";

export default function ReportsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/user/reports/pending");
  }, []);

  return <Loader size="lg" text="Loading reports..." />;
}
