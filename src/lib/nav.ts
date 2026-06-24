import {
  LayoutDashboard,
  Boxes,
  ShieldAlert,
  Activity,
  Wrench,
  Siren,
  FileBarChart,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: string;
  group: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard:read", group: "Overview" },
  { label: "Asset Management", href: "/assets", icon: Boxes, permission: "assets:read", group: "Operations" },
  { label: "Performance", href: "/performance", icon: Activity, permission: "performance:read", group: "Operations" },
  { label: "Maintenance", href: "/maintenance", icon: Wrench, permission: "maintenance:read", group: "Operations" },
  { label: "Incidents", href: "/incidents", icon: Siren, permission: "incidents:read", group: "Operations" },
  { label: "Security Center", href: "/security", icon: ShieldAlert, permission: "security:read", group: "Security" },
  { label: "Reports", href: "/reports", icon: FileBarChart, permission: "reports:read", group: "Insights" },
  { label: "User Management", href: "/users", icon: Users, permission: "users:read", group: "Administration" },
];

export const NAV_GROUPS = ["Overview", "Operations", "Security", "Insights", "Administration"];
