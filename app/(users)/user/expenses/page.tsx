"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLoading } from "@/components/providers/LoadingProvider";

export default function ExpensesPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/user/expenses/unreported");
  }, [router]);

  return <div className=""></div>;
}
