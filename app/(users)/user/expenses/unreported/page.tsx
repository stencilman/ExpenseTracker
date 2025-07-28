"use client";

import UnreportedExpensesView from "@/components/expenses/UnreportedExpensesView";
import { Loader } from "@/components/ui/loader";
import { useEffect } from "react";
import { useState } from "react";

export default function UnreportedExpensesPage() {
  const [isLoading, setIsLoading] = useState(false);

  // Simulate loading until api is implemented
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <UnreportedExpensesView />;
}
