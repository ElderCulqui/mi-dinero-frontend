import { LayoutDashboard, Wallet, FolderOpen } from "lucide-react";
// import { CreditCard, TrendingUp, Settings } from "lucide-react";

export const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Cuentas",
    href: "/accounts",
    icon: Wallet,
  },
  {
    title: "Categorías",
    href: "/categories",
    icon: FolderOpen,
  },
  // {
  //   title: "Transacciones",
  //   href: "/transactions",
  //   icon: CreditCard,
  // },
  // {
  //   title: "Reportes",
  //   href: "/reports",
  //   icon: TrendingUp,
  // },
  // {
  //   title: "Configuración",
  //   href: "/settings",
  //   icon: Settings,
  // },
];
