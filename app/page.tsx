"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoading } from "@/components/providers/LoadingProvider";
import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const { startLoading } = useLoading();

  // useEffect(() => {
  //   router.push("/user/dashboard");
  // }, [router]);

  return (
    // <div className="flex items-center justify-center min-h-screen">
    //   <div className="text-center">
    //     <h2 className="text-2xl font-semibold">Redirecting...</h2>
    //     <p className="text-muted-foreground mt-2">Please wait while we redirect you to the dashboard.</p>
    //   </div>
    // </div>
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center">
        <Image src="/brain.png" alt="FastcodeAI" width={50} height={50} />
        <h1 className="text-2xl font-bold">Expense Tracker</h1>
      </div>
      <Button className="mt-4" onClick={() => router.push("/auth/login")}>
        Login
      </Button>
    </div>
  );
}
