"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminReportsLayout from "./layout";

export default function AdminReportsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/reports/all");
  }, [router]);

  return <div className=""></div>;
}
