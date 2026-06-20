import {
  Activity,
  ArrowLeftRight,
  BarChart3,
  Building2,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldCheck,
  ShoppingBag,
  UserCog,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import type { NavItem } from "@/components/dashboard/dashboard-shell";

export const OWNER_NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/owner" },
  { label: "My Properties", icon: Building2, href: "/dashboard/owner/properties" },
  { label: "Tenant Management", icon: UsersRound, href: "/dashboard/owner/tenants" },
  { label: "Assign Agents", icon: UserCog, href: "/dashboard/owner/agents" },
  { label: "Verification", icon: ShieldCheck, href: "/dashboard/owner/verification" },
  { label: "Ownership Transfer", icon: ArrowLeftRight, href: "/dashboard/owner/transfers" },
  { label: "Buyer Inquiries", icon: MessageSquare, href: "/dashboard/owner/inquiries" },
  { label: "Escrow & Sales", icon: Wallet, href: "/dashboard/owner/escrow" },
  { label: "Settings", icon: Settings, href: "/dashboard/owner/settings" },
  { label: "Web3 Sandbox", icon: Activity, href: "/dashboard/sandbox" },
];

export const AGENT_NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/agent" },
  { label: "Assigned Properties", icon: Building2, href: "/dashboard/agent/properties" },
  { label: "Buyer Requests", icon: MessageSquare, href: "/dashboard/agent/requests" },
  { label: "Verification Center", icon: ShieldCheck, href: "/dashboard/agent/verification" },
  { label: "Settings", icon: Settings, href: "/dashboard/agent/settings" },
  { label: "Web3 Sandbox", icon: Activity, href: "/dashboard/sandbox" },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/admin" },
  { label: "Users", icon: Users, href: "/dashboard/admin/users" },
  { label: "Properties", icon: Building2, href: "/dashboard/admin/properties" },
  { label: "Transaction Audit", icon: ArrowLeftRight, href: "/dashboard/admin/audit" },
  { label: "Reports & Analytics", icon: BarChart3, href: "/dashboard/admin/reports" },
  { label: "KYC & Verification", icon: ShieldCheck, href: "/dashboard/admin/records" },
  { label: "Settings", icon: Settings, href: "/dashboard/admin/settings" },
  { label: "System Logs", icon: Activity, href: "/dashboard/sandbox" },
];

export const BUYER_NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/buyer" },
  { label: "Market Place", icon: ShoppingBag, href: "/dashboard/buyer/marketplace" },
  // { label: "Property Detail", icon: Building2, href: "/dashboard/buyer/marketplace/property/:id" },
  { label: "Saved Properties", icon: Heart, href: "/dashboard/buyer/saved" },
  { label: "My Requests", icon: MessageSquare, href: "/dashboard/buyer/requests" },
  { label: "Verification", icon: ShieldCheck, href: "/dashboard/buyer/verification" },
  { label: "Settings", icon: Settings, href: "/dashboard/buyer/settings" },
  { label: "Web3 Sandbox", icon: Activity, href: "/dashboard/sandbox" },

];
