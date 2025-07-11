"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLoading } from "@/components/providers/loading-provider";

export default function ExpensesPage() {
  const router = useRouter();
  const { startLoading } = useLoading();

  useEffect(() => {
    startLoading("Loading Expenses");
    router.push("/user/expenses/unreported");
  }, [router, startLoading]);

  return <div className=""></div>;
}
