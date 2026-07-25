"use client";
import { User, Lock, Save, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updatePassword } from "@/store/auth/authThunk";
import { useToast } from "@/components/ui/use-toast";

export default function CoordinatorSettings() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirm password must be the same.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await dispatch(
        updatePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        })
      ).unwrap();
      
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your coordinator profile and account security.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="h-11 p-1 bg-muted/50 w-full sm:w-auto overflow-x-auto flex whitespace-nowrap justify-start">
          <TabsTrigger value="profile" className="gap-2 px-4 h-full">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile Details</span>
            <span className="sm:hidden">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 px-4 h-full">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Security & Password</span>
            <span className="sm:hidden">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="border border-border/60 rounded-xl bg-card/40 backdrop-blur-sm overflow-hidden">
            <div className="p-6 md:p-8 flex items-center gap-6 border-b border-border/40 bg-muted/20">
              <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {user?.fullName?.charAt(0) || "C"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{user?.fullName}</h2>
                <p className="text-muted-foreground font-medium">Coordinator</p>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Full Name</p>
                  <Input value={user?.fullName || ""} disabled className="bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Email Address</p>
                  <Input value={user?.email || ""} disabled className="bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Department</p>
                  <Input value={user?.department || "N/A"} disabled className="bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Role</p>
                  <Input value={user?.role || "Coordinator"} disabled className="bg-muted/30 capitalize" />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="border border-border/60 rounded-xl bg-card/40 backdrop-blur-sm p-6 md:p-8">
            <div>
              <h3 className="text-lg font-medium">Change Password</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                Update your password to keep your account secure.
              </p>
            </div>

            <Separator className="mb-6" />

            <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
              <div className="space-y-2 relative">
                <p className="text-sm font-medium">Current Password</p>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className="pr-10"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 relative">
                <p className="text-sm font-medium">New Password</p>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="pr-10"
                    placeholder="Create a new password"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 relative">
                <p className="text-sm font-medium">Confirm New Password</p>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="pr-10"
                    placeholder="Confirm your new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={isLoading} className="gap-2">
                  {isLoading ? (
                    <Spinner className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
