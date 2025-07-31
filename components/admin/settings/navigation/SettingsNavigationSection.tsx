"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsNavigationSectionProps = {
  header: string;
  icon?: LucideIcon;
  items: {
    label: string;
    href?: string;
    icon?: LucideIcon;
    external?: boolean;
  }[];
  className?: string;
};

export default function SettingsNavigationSection({
  header,
  icon: HeaderIcon,
  items,
  className,
}: SettingsNavigationSectionProps) {
  const pathname = usePathname();

  return (
    <div className={cn("space-y-1 border-b pb-4 mb-4", className)}>
      <div className="flex items-center gap-2 px-2 py-1.5">
        {HeaderIcon && <HeaderIcon className="h-5 w-5 text-blue-600" />}
        <h3 className="text-sm font-medium text-blue-600">{header}</h3>
      </div>
      <ul className="space-y-1 pl-2">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          const linkContent = (
            <div
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-blue-600" : "text-gray-500"
                  )}
                />
              )}
              <span>{item.label}</span>
              {item.external && (
                <ExternalLink className="h-3 w-3 text-gray-500" />
              )}
            </div>
          );

          return (
            <li key={idx}>
              {item.external ? (
                <a
                  href={item.href || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {linkContent}
                </a>
              ) : (
                <Link href={item.href || "#"} className="block">
                  {linkContent}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
