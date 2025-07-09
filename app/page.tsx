"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoading } from "@/components/providers/loading-provider";

export default function Home() {
  const router = useRouter();
  const { startLoading } = useLoading();

  useEffect(() => {
    startLoading("Loading Dashboard");
    router.push("/user/dashboard");
  }, [router, startLoading]);

  return <div className="min-h-screen" />;
}
