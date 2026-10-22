import { LayoutDashboard, Wallet, FolderOpen, CreditCard, ArrowLeftRight, Users, Repeat, Landmark, CalendarClock } from "lucide-react";
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
  {
    title: "Préstamos",
    href: "/loans",
    icon: Landmark,
  },
  {
    title: "Planes en cuotas",
    href: "/installment-plans",
    icon: CalendarClock,
  },
  {
    title: "Contactos",
    href: "/contacts",
    icon: Users,
  },
  {
    title: "Transferencias",
    href: "/transfers",
    icon: Repeat,
  },
  // {
  //   title: "Configuración",
  //   href: "/settings",
  //   icon: Settings,
  // },
];
