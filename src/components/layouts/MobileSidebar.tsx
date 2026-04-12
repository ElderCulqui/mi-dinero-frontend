import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { menuItems } from "@/config/navigation";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="p-6">
          <SheetTitle className="text-2xl font-bold text-primary">
            Mi Dinero
          </SheetTitle>
        </SheetHeader>

        <Separator />

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link key={item.href} to={item.href} onClick={onClose}>
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

        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
