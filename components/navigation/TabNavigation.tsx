/**
 * TabNavigation.tsx
 *
 * A reusable navigation component that renders tabs with active state indicators.
 * Supports different variants and styles for use across the application.
 *
 * Usage:
 * <TabNavigation
 *   tabs={[
 *     { label: "Tab 1", href: "/path1" },
 *     { label: "Tab 2", href: "/path2" }
 *   ]}
 *   variant="underline"
 *   size="lg"
 * />
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface TabProps {
  label: string;
  href: string;
  icon?: React.ReactNode; // Optional icon to display with the tab
  disabled?: boolean; // Optional disabled state
}

export interface TabNavigationProps {
  tabs: TabProps[];
  variant?: "underline" | "pills" | "buttons" | "minimal";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean; // Whether tabs should take full width
  className?: string; // Additional custom classes
  activeColor?: string; // Custom active color (default is blue-600)
  exactMatch?: boolean; // Whether to match the exact path or include subpaths
}

export const TabNavigation = ({
  tabs,
  variant = "underline",
  size = "md",
  fullWidth = false,
  className = "",
  activeColor = "blue-600",
  exactMatch = true,
}: TabNavigationProps) => {
  const pathname = usePathname();

  // Determine if a tab is active based on the current pathname
  const isTabActive = (tabHref: string) => {
    if (exactMatch) {
      return pathname === tabHref;
    } else {
      return pathname.startsWith(tabHref);
    }
  };

  // Get size-specific classes
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-sm py-1";
      case "lg":
        return "text-lg py-3";
      case "md":
      default:
        return "text-base py-2";
    }
  };

  // Get variant-specific container classes
  const getContainerClasses = () => {
    switch (variant) {
      case "pills":
        return "space-x-2";
      case "buttons":
        return "space-x-1 bg-gray-100 p-1 rounded-lg";
      case "minimal":
        return "space-x-4";
      case "underline":
      default:
        return "space-x-6 border-b border-gray-200";
    }
  };

  // Get variant-specific tab classes
  const getTabClasses = (isActive: boolean) => {
    const baseClasses = `font-medium transition-colors duration-200 ${getSizeClasses()}`;

    switch (variant) {
      case "pills":
        return cn(
          baseClasses,
          "px-4 rounded-full",
          isActive
            ? `bg-${activeColor} text-white`
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        );
      case "buttons":
        return cn(
          baseClasses,
          "px-4 rounded-md",
          isActive
            ? `bg-white shadow text-${activeColor}`
            : "text-gray-600 hover:text-gray-900"
        );
      case "minimal":
        return cn(
          baseClasses,
          isActive
            ? `text-${activeColor} font-semibold`
            : "text-gray-600 hover:text-gray-900"
        );
      case "underline":
      default:
        return cn(
          baseClasses,
          "border-b-2 px-1",
          isActive
            ? `border-${activeColor} text-${activeColor}`
            : "border-transparent text-gray-600 hover:text-gray-900"
        );
    }
  };

  return (
    <div
      className={cn(
        "flex",
        getContainerClasses(),
        fullWidth ? "w-full" : "",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = isTabActive(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              getTabClasses(isActive),
              tab.disabled ? "opacity-50 pointer-events-none" : "",
              fullWidth ? "flex-1 text-center" : ""
            )}
            aria-disabled={tab.disabled}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="flex items-center justify-center gap-2">
              {tab.icon && <span className="inline-block">{tab.icon}</span>}
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};
