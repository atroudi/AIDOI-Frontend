"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Building2,
  Link2,
  Settings,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
  },
  {
    label: "My Institutions",
    href: "/institutions",
    icon: Building2,
  },
  {
    label: "Manage AIDOIs",
    href: "/aidois",
    icon: Link2,
  },
  {
    label: "Profile Settings",
    href: "/profile",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-navy flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6">
        <Link href="/dashboard" className="text-white text-xl">
          <span className="font-bold">AIDOI</span>{" "}
          <span className="font-light">Portal</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(item.href));

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
    </aside>
  );
}
