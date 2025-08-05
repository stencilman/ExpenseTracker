import Link from "next/link";
import { ExternalLink, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsSectionProps = {
  header: string;
  icon?: LucideIcon;
  items: {
    label: string;
    href?: string;
    external?: boolean;
  }[];
  className?: string;
};

const SettingsSection = ({
  header,
  icon: HeaderIcon,
  items,
  className,
}: SettingsSectionProps) => (
  <div className={cn("space-y-1", className)}>
    <div className="flex items-center gap-2 px-2 py-1.5">
      {HeaderIcon && <HeaderIcon className="h-4 w-4 text-blue-600" />}
      <h3 className="text-sm font-medium text-blue-600">{header}</h3>
    </div>
    <ul className="space-y-1 pl-2">
      {items.map((item, idx) => {
        const linkContent = (
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100">
            <span>{item.label}</span>
            {item.external && <ExternalLink />}
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

export default SettingsSection;
