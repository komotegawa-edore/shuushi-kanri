"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  BarChart3,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/expenses", label: "経費記録", icon: Receipt },
  { href: "/transactions", label: "取引一覧", icon: ArrowLeftRight },
  { href: "/reports", label: "レポート", icon: BarChart3 },
  { href: "/invoices", label: "請求書", icon: FileText },
  { href: "/clients", label: "取引先", icon: Users },
  { href: "/settings", label: "設定", icon: Settings },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex bg-slate-50/50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-64 bg-white border-r border-blue-100/60 transform transition-transform duration-200 ease-in-out shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-blue-100/60">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <Image src="/icon.png" alt="スット" width={28} height={28} className="rounded-lg" />
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                スット
              </span>
            </Link>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 p-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-blue-500 text-white shadow-sm shadow-blue-200"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-blue-100/60">
            <div className="text-xs text-muted-foreground mb-2 truncate">
              {user.email}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-blue-200 text-gray-600 hover:bg-blue-50 hover:text-blue-700"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <header className="lg:hidden border-b border-blue-100/60 bg-white p-4 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/icon.png" alt="スット" width={24} height={24} className="rounded-lg" />
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              スット
            </span>
          </Link>
        </header>
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
