"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Building2,
  Clock,
  Users,
  UserCog,
  BarChart3,
  ArrowLeft,
} from "lucide-react";

const navItems = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutGrid,
    exact: true,
  },
  {
    label: "Organizations",
    href: "/admin/organizations",
    icon: Building2,
  },
  {
    label: "Pending Requests",
    href: "/admin/pending",
    icon: Clock,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Org Admins",
    href: "/admin/org-admins",
    icon: UserCog,
  },
  {
    label: "Stats",
    href: "/admin/stats",
    icon: BarChart3,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-navy flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6 flex flex-col items-center gap-1">
        <Link href="/admin" className="text-white text-xl text-center">
          <span className="font-bold">AIDOI</span>{" "}
          <span className="font-light">Portal</span>
        </Link>
        <span className="text-xs text-red-400 font-semibold tracking-wider uppercase">
          Admin Panel
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href ||
                pathname.startsWith(item.href + "/");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-navy-light text-white"
                      : "text-white/70 hover:text-white hover:bg-navy-light/50"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Back to Portal */}
      <div className="px-3 pb-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-navy-light/50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 shrink-0" />
          Back to Portal
        </Link>
      </div>
    </aside>
  );
}
