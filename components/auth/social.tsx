"use client";
// import { Google } from "lucide-react";
// import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Social = () => {
  return (
    <div className="flex items-center w-full gap-x-2">
      <Button className="w-full" variant="outline" size="lg" onClick={() => {}}>
        {/* <Google className="w-5 h-5" /> */}
      </Button>
      <Button className="w-full" variant="outline" size="lg" onClick={() => {}}>
        {/* <Github className="w-5 h-5" /> */}
      </Button>
    </div>
  );
};
