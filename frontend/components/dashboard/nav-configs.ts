import {
  Activity,
  ArrowLeftRight,
  BarChart3,
  Building2,
  Heart,
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  ShieldCheck,
  ShoppingBag,
  UserCircle,
  UserCog,
  Users,
} from "lucide-react";
import type { NavItem } from "@/components/dashboard/dashboard-shell";

export const OWNER_NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/owner" },
  { label: "My Properties", icon: Building2, href: "/dashboard/owner/properties" },
  { label: "Create Property", icon: PlusCircle, href: "/dashboard/owner/properties/new" },
  { label: "Assign Agents", icon: UserCog, href: "/dashboard/owner/agents" },
  { label: "Verification", icon: ShieldCheck, href: "/dashboard/owner/verification" },
  { label: "Ownership Transfer", icon: ArrowLeftRight, href: "/dashboard/owner/transfers" },
  { label: "Buyer Inquiries", icon: MessageSquare, href: "/dashboard/owner/inquiries" },
  { label: "Web3 Sandbox", icon: Activity, href: "/dashboard/sandbox" },
];

export const AGENT_NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/agent" },
  { label: "Assigned Properties", icon: Building2, href: "/dashboard/agent/properties" },
  { label: "Buyer Requests", icon: MessageSquare, href: "/dashboard/agent/requests" },
  { label: "Verification Center", icon: ShieldCheck, href: "/dashboard/agent/verification" },
  { label: "Web3 Sandbox", icon: Activity, href: "/dashboard/sandbox" },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/admin" },
  { label: "Users", icon: Users, href: "/dashboard/admin/users" },
  { label: "Properties", icon: Building2, href: "/dashboard/admin/properties" },
  { label: "Ownership Records", icon: ShieldCheck, href: "/dashboard/admin/records" },
  { label: "Reports", icon: BarChart3, href: "/dashboard/admin/reports" },
  { label: "Web3 Sandbox", icon: Activity, href: "/dashboard/sandbox" },
];

export const BUYER_NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/buyer" },
  { label: "Browse Properties", icon: ShoppingBag, href: "/dashboard/buyer/marketplace" },
  { label: "Saved Properties", icon: Heart, href: "/dashboard/buyer/saved" },
  { label: "My Requests", icon: MessageSquare, href: "/dashboard/buyer/requests" },
  { label: "Verification", icon: ShieldCheck, href: "/dashboard/buyer/verification" },
  { label: "Profile", icon: UserCircle, href: "/dashboard/buyer/profile" },
  { label: "Web3 Sandbox", icon: Activity, href: "/dashboard/sandbox" },
];
