"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";
import { cn } from "@/lib/utils";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4">
      <ul className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.title}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </div>

                {item.badge && (
                  <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}