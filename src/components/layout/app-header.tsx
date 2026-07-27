"use client";

import { Bell, Search, Sparkles } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="flex min-h-20 items-center justify-between gap-4 px-6 lg:px-8">
        {/* Left section */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-bold tracking-tight">
              Dashboard
            </h1>

            <div className="hidden items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary sm:flex">
              <Sparkles className="h-3 w-3" />
              AI Powered
            </div>
          </div>

          <p className="mt-1 truncate text-sm text-muted-foreground">
            Monitor and manage your AI email automation
          </p>
        </div>

        {/* Right section */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="search"
              placeholder="Search emails..."
              aria-label="Search emails"
              className="h-11 w-72 rounded-xl border border-border/80 bg-muted/30 pl-10 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground hover:border-border focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10 xl:w-80"
            />

            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground xl:block">
              Ctrl K
            </kbd>
          </div>

          {/* Mobile search button */}
          <button
            type="button"
            aria-label="Search emails"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-background text-muted-foreground transition-all hover:bg-accent hover:text-foreground lg:hidden"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Notification button */}
          <button
            type="button"
            aria-label="Open notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-background text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
          >
            <Bell className="h-5 w-5" />

            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </button>
        </div>
      </div>
    </header>
  );
}