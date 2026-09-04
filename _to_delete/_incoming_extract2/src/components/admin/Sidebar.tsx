"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  Home,
  Info,
  Wrench,
  Images,
  MessageSquareQuote,
  Users,
  Mail,
  Menu as MenuIcon,
  X,
  LogOut,
  Settings,
  Navigation as NavigationIcon,
  ExternalLink,
  DollarSign,
  FolderKanban,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Leads", href: "/admin/leads", icon: Inbox },
  { label: "Homepage", href: "/admin/homepage", icon: Home },
  { label: "About Page", href: "/admin/about", icon: Info },
  { label: "Services", href: "/admin/services", icon: Wrench },
  { label: "Service Plans", href: "/admin/service-plans", icon: DollarSign },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Gallery", href: "/admin/gallery", icon: Images },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "Contact Page", href: "/admin/contact-page", icon: Mail },
  { label: "Navigation", href: "/admin/navigation", icon: NavigationIcon },
  { label: "Site Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const content = (
    <>
      <div className="flex items-center justify-between px-5 py-6">
        <span className="font-heading text-lg font-bold text-white">
          LR <span className="text-brand-red-light">Admin</span>
        </span>
        <button
          className="lg:hidden text-white"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-brand-red text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <ItemIcon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          View Site
        </a>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between bg-brand-black px-4 py-3 lg:hidden">
        <span className="font-heading text-base font-bold text-white">
          LR <span className="text-brand-red-light">Admin</span>
        </span>
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-white">
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>

      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-brand-black">
        {content}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-brand-black">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
