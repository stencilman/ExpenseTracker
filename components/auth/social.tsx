"use client";
import { FaGoogle } from "react-icons/fa";
// import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const Social = () => {
  const conClick = (provider: "google") => {
    console.log("clicked");
    signIn(provider);
  };

  return (
    <div className="flex items-center w-full gap-x-2">
      <Button
        className="w-full cursor-pointer"
        variant="outline"
        size="lg"
        onClick={() => {
          conClick("google");
        }}
      >
        <FaGoogle className="w-5 h-5" />
      </Button>
    </div>
  );
};
