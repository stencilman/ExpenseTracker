// Raps the Auth Form with a Card

"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Header } from "@/components/auth/header";
import { Social } from "@/components/auth/social";
import { Button } from "../ui/button";
import Link from "next/link";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel?: string;
  backButtonHref?: string;
  showSocial?: boolean;
  headerMessage?: string;
}

export const CardWrapper = ({
  children,
  headerLabel,
  showSocial,
  headerMessage,
  backButtonHref,
  backButtonLabel,
}: CardWrapperProps) => {
  return (
    <Card className="w-[80%] sm:w-[70%] md:w-[50%] max-w-[430px]">
      <CardHeader>
        <Header label={headerLabel} message={headerMessage} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && (
        <CardFooter>
          <Social />
        </CardFooter>
      )}
      {backButtonHref && backButtonLabel && (
        <CardFooter>
          <Button variant="outline" className="w-full">
            <Link href={backButtonHref}>{backButtonLabel}</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
