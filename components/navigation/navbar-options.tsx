import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useCurrentUser, useIsAdmin } from "@/hooks/use-current-user";
import Link from "next/link";
import { handleSignOut } from "@/actions/signout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

const NavbarOptions = () => {
  const isAdmin = useIsAdmin();
  const session = useSession();
  const user = session.data?.user;
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-slate-200"
          >
            {/* <User className="h-5 w-5 text-slate-600" /> */}
            <Avatar>
              <AvatarImage src={user?.image || ""} />
              <AvatarFallback className="capitalize">
                {user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!isAdmin && (
            <Link href="/user/settings" passHref>
              <DropdownMenuItem className="cursor-pointer">
                Profile
              </DropdownMenuItem>
            </Link>
          )}

          <form action={handleSignOut}>
            <DropdownMenuItem
              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
              asChild
            >
              <button type="submit" className="w-full text-left">
                Sign Out
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default NavbarOptions;
