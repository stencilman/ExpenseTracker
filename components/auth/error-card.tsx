import { Header } from "@/components/auth/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardWrapper } from "./card-wrapper";
import { TriangleAlert } from "lucide-react";

export const ErrorCard = () => {
  return (
    <>
      <CardWrapper
        headerLabel="Oops! Something went wrong"
        backButtonHref="/auth/login"
        backButtonLabel="Go to Login"
      >
        <div className="flex items-center gap-2 ">
          <TriangleAlert className="w-10 h-10 text-red-500" />
          <p className="text-sm">
            We are unable to process your request at the moment. Please try
            again later.
          </p>
        </div>
      </CardWrapper>
    </>
  );
};
