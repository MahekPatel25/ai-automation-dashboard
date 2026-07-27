import {
  LayoutDashboard,
  Mail,
  BrainCircuit,
  ClipboardList,
  BarChart3,
  Workflow,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Emails",
    href: "/emails",
    icon: Mail,
  },
  {
    title: "AI Analysis",
    href: "/ai-analysis",
    icon: BrainCircuit,
  },
  {
    title: "Email Status",
    href: "/email-status",
    icon: ClipboardList,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Automation",
    href: "/automation",
    icon: Workflow,
  },
];