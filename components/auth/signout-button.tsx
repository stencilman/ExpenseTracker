"use client";

import { Button } from "@/components/ui/button";
import { handleSignOut } from "@/actions/signout";

interface SignoutButtonProps {
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
  children?: React.ReactNode;
}

const SignoutButton = ({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}: SignoutButtonProps & React.ComponentPropsWithoutRef<"button">) => {
  return (
    <form action={handleSignOut}>
      <Button
        type="submit"
        variant={variant}
        size={size}
        className={className}
        asChild={asChild}
        {...props}
      >
        {children || "Sign Out"}
      </Button>
    </form>
  );
};

export default SignoutButton;
