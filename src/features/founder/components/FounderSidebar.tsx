import { LayoutDashboard, UsersRound } from "lucide-react";
import type { FounderNavItem } from "../types/founder.types";

export const founderNavItems: FounderNavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/founder/dashboard" },
  { icon: UsersRound, label: "Batches", path: "/founder/batches" },
];

export function FounderSidebar() {
  return null;
}
