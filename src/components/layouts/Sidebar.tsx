import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { menuItems } from "@/config/navigation";

export default function Sidebar() {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-gray-50/40">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Mi Dinero</h1>
      </div>

      <Separator />

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link key={item.href} to={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-gray-100 text-gray-700",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Logout Button */}
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
