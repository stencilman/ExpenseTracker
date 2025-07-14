"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function ReportsPage() {
  // Redirect to the pending reports page
  useEffect(() => {
    // This will only run on the client side
    redirect("/user/reports/pending");
  }, []);

  return null;
}
