import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, BarChart3, Flag, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AdminStats } from "@/components/admin/AdminStats";
import { UserManagement } from "@/components/admin/UserManagement";
import { ContentModeration } from "@/components/admin/ContentModeration";

export default function Admin() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { 
    isAdmin, 
    isCheckingAdmin,
    platformStats,
    isLoadingStats,
    users,
    isLoadingUsers,
    contentFlags,
    isLoadingFlags,
    updateUserRole,
    updateUserTier,
    updateFlagStatus,
  } = useAdmin();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate("/auth");
    }
  }, [user, isAuthLoading, navigate]);

  useEffect(() => {
    if (!isCheckingAdmin && isAdmin === false) {
      navigate("/dashboard");
    }
  }, [isAdmin, isCheckingAdmin, navigate]);

  if (isAuthLoading || isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const pendingFlagsCount = contentFlags?.filter((f) => f.status === "pending").length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold">Admin Panel</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary/20">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary/20">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="moderation" className="data-[state=active]:bg-primary/20 relative">
              <Flag className="h-4 w-4 mr-2" />
              Moderation
              {pendingFlagsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-bold flex items-center justify-center">
                  {pendingFlagsCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Platform Analytics</h2>
              <p className="text-muted-foreground">
                Overview of platform usage and growth metrics
              </p>
            </div>
            <AdminStats stats={platformStats} isLoading={isLoadingStats} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">User Management</h2>
              <p className="text-muted-foreground">
                Manage user roles and subscription tiers
              </p>
            </div>
            <UserManagement 
              users={users} 
              isLoading={isLoadingUsers}
              onUpdateRole={(userId, role) => updateUserRole.mutateAsync({ userId, role })}
              onUpdateTier={(userId, tier) => updateUserTier.mutateAsync({ userId, tier })}
            />
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Content Moderation</h2>
              <p className="text-muted-foreground">
                Review and manage flagged content
              </p>
            </div>
            <ContentModeration 
              flags={contentFlags} 
              isLoading={isLoadingFlags}
              onUpdateStatus={(flagId, status, notes) => 
                updateFlagStatus.mutateAsync({ flagId, status, notes })
              }
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
