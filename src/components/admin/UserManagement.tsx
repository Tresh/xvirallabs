import { useState } from "react";
import { Shield, Crown, User, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { UserWithRole, AppRole } from "@/hooks/useAdmin";

interface UserManagementProps {
  users: UserWithRole[] | undefined;
  isLoading: boolean;
  onUpdateRole: (userId: string, role: AppRole) => Promise<void>;
  onUpdateTier: (userId: string, tier: string) => Promise<void>;
}

const RoleBadge = ({ role }: { role: AppRole }) => {
  const styles = {
    admin: "bg-primary/20 text-primary border-primary/30",
    moderator: "bg-muted text-foreground border-border",
    user: "bg-muted text-muted-foreground border-border",
  };

  const icons = {
    admin: Shield,
    moderator: Shield,
    user: User,
  };

  const Icon = icons[role];

  return (
    <Badge variant="outline" className={styles[role]}>
      <Icon className="h-3 w-3 mr-1" />
      {role}
    </Badge>
  );
};

const TierBadge = ({ tier }: { tier: string | null }) => {
  const tierValue = tier || "free";
  const styles: Record<string, string> = {
    free: "bg-muted text-muted-foreground border-border",
    pro: "bg-primary/20 text-primary border-primary/30",
    elite: "bg-foreground/10 text-foreground border-foreground/20",
  };

  return (
    <Badge variant="outline" className={styles[tierValue] || styles.free}>
      {tierValue === "elite" && <Crown className="h-3 w-3 mr-1" />}
      {tierValue}
    </Badge>
  );
};

export function UserManagement({ 
  users, 
  isLoading, 
  onUpdateRole,
  onUpdateTier 
}: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredUsers = users?.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.twitter_handle?.toLowerCase().includes(searchLower)
    );
  });

  const handleRoleChange = async (userId: string, role: AppRole) => {
    try {
      await onUpdateRole(userId, role);
      toast({
        title: "Role updated",
        description: `User role changed to ${role}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleTierChange = async (userId: string, tier: string) => {
    try {
      await onUpdateTier(userId, tier);
      toast({
        title: "Tier updated",
        description: `User tier changed to ${tier}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user tier",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 bg-muted rounded animate-pulse" />
        <div className="border rounded-lg">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b last:border-b-0 animate-pulse bg-muted/30" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search users by email or Twitter handle..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Twitter</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.twitter_handle ? `@${user.twitter_handle}` : "—"}
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <TierBadge tier={user.tier} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.created_at 
                      ? new Date(user.created_at).toLocaleDateString()
                      : "—"
                    }
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => handleRoleChange(user.user_id, "user")}
                        >
                          <User className="h-4 w-4 mr-2" />
                          User
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRoleChange(user.user_id, "moderator")}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Moderator
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRoleChange(user.user_id, "admin")}
                        >
                          <Shield className="h-4 w-4 mr-2 text-viral-hot" />
                          Admin
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Change Tier</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => handleTierChange(user.user_id, "free")}
                        >
                          Free
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleTierChange(user.user_id, "pro")}
                        >
                          <Crown className="h-4 w-4 mr-2 text-viral-success" />
                          Pro
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleTierChange(user.user_id, "elite")}
                        >
                          <Crown className="h-4 w-4 mr-2 text-viral-warning" />
                          Elite
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
