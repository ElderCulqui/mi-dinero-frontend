import { LayoutDashboard, Wallet, FolderOpen, CreditCard, ArrowLeftRight } from "lucide-react";
// import { CreditCard, TrendingUp, Settings } from "lucide-react";

export const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Transacciones",
    href: "/transactions",
    icon: ArrowLeftRight,
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
  {
    title: "Tarjetas",
    href: "/cards",
    icon: CreditCard,
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
