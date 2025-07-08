import { Building } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

export default function Header() {
  return (
    <div className="flex items-center w-full">
      <div className="flex items-center gap-4">
        <div className="p-3 border rounded-md">
          <Building />
        </div>
        <div>
          <div className="font-medium text-lg">Hello, Sarvochcha</div>
          <div className="text-xs text-muted-foreground">FastCode AI</div>
        </div>
      </div>
    </div>
  );
}
