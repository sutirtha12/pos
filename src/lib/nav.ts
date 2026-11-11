import {
  LayoutDashboard,
  ClipboardList,
  ShoppingCart,
  Receipt,
  Grid3X3,
  UtensilsCrossed,
  ChefHat,
  Package,
  Users,
  UserCog,
  BarChart3,
  Settings,
} from "lucide-react";

export const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/billing", label: "Billing / POS", icon: ShoppingCart },
  { href: "/bills", label: "Bills & Invoices", icon: Receipt },
  { href: "/tables", label: "Tables", icon: Grid3X3 },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/kitchen", label: "Kitchen (KDS)", icon: ChefHat },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/staff", label: "Staff", icon: UserCog },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function getRouteLabel(pathname: string): string {
  return navItems.find((item) => item.href === pathname)?.label ?? "RestroDesk";
}

