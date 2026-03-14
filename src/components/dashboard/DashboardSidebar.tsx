import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import {
  Calendar,
  Microscope,
  Dna,
  Lightbulb,
  CreditCard,
  LogOut,
  Moon,
  Sun,
  Brain,
  Zap,
  TrendingUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/useTheme";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { id: "daily-feed", title: "Daily Feed", icon: Zap },
  { id: "content-lab", title: "Content Lab", icon: Calendar },
  { id: "growth", title: "Growth", icon: TrendingUp },
  { id: "analyses", title: "Analyses", icon: Microscope },
  { id: "patterns", title: "Patterns", icon: Dna },
  { id: "ideas", title: "Ideas", icon: Lightbulb },
  { id: "memory", title: "Memory", icon: Brain },
  { id: "plans", title: "Plans", icon: CreditCard },
] as const;

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
  memoryCounts?: {
    analyses: number;
    patterns: number;
    ideas: number;
  };
}

export function DashboardSidebar({ activeTab, onTabChange, onSignOut }: DashboardSidebarProps) {
  const { theme, toggleTheme } = useTheme();

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
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    onClick={() => onTabChange(item.id)}
                    tooltip={item.title}
                    className="relative"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge className="ml-auto text-[9px] h-4 px-1.5 bg-primary/20 text-primary border-primary/30 font-bold">
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleTheme} tooltip={theme === "dark" ? "Light mode" : "Dark mode"}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onSignOut} tooltip="Sign out" className="text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
