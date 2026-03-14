import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import {
  Calendar,
  Microscope,
  CreditCard,
  Zap,
  TrendingUp,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { id: "daily-feed", title: "Daily Feed", icon: Zap },
  { id: "content-lab", title: "Content Lab", icon: Calendar },
  { id: "growth", title: "Growth", icon: TrendingUp },
  { id: "analyses", title: "Analyses", icon: Microscope },
  { id: "plans", title: "Plans", icon: CreditCard },
  { id: "settings", title: "Settings", icon: Settings },
] as const;

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  memoryCounts?: {
    analyses: number;
    patterns: number;
    ideas: number;
  };
}

export function DashboardSidebar({ activeTab, onTabChange, memoryCounts }: DashboardSidebarProps) {
  const getBadge = (id: string) => {
    if (id === "daily-feed") return "NEW";
    if (id === "analyses") {
      const total = (memoryCounts?.analyses ?? 0) + (memoryCounts?.patterns ?? 0) + (memoryCounts?.ideas ?? 0);
      return total > 0 ? String(total) : null;
    }
    return null;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="sm" showText={false} />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const badge = getBadge(item.id);
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={activeTab === item.id}
                      onClick={() => onTabChange(item.id)}
                      tooltip={item.title}
                      className="relative"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {badge && (
                        <Badge className="ml-auto text-[9px] h-4 px-1.5 bg-primary/20 text-primary border-primary/30 font-bold">
                          {badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
