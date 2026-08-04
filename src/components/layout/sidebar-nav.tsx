"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
      <ul className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <li key={item.title}>
              <Link
                href={item.href}
                className={cn(
                  "group flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200",
                  isActive
                    ? "border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "border-transparent text-muted-foreground hover:translate-x-0.5 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-200",
                    isActive
                      ? "border-sidebar-primary/25 bg-sidebar-primary text-sidebar-primary-foreground"
                      : "border-sidebar-border bg-sidebar text-muted-foreground group-hover:text-sidebar-primary"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-sm font-semibold",
                    isActive
                      ? "text-sidebar-accent-foreground"
                      : "text-muted-foreground group-hover:text-sidebar-foreground"
                  )}
                >
                  {item.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}