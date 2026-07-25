"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  LockIcon,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppDispatch } from "@/store/hooks";
import { resetPassword } from "@/store/auth/authThunk";

function ResetPasswordForm() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInvalidLink, setIsInvalidLink] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const emailParam = searchParams.get("email");

    console.log("Search params:", { token: tokenParam, email: emailParam });

    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(decodeURIComponent(emailParam));
    } else {
      setIsInvalidLink(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await dispatch(
        resetPassword({
          email,
          token,
          newPassword,
        }),
      ).unwrap();

      setIsSuccess(true);
      setIsInvalidLink(false);
    } catch (err) {
      setIsInvalidLink(true);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInvalidLink) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex-3 w-full justify-center">
          <Card className="w-full bg-transparent border-none shadow-none max-w-md mx-auto">
            <CardHeader className="mb-6">
              <CardTitle className="text-3xl sm:text-4xl font-bold">
                Invalid Link
              </CardTitle>
              <CardDescription className="font-medium text-muted-foreground">
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Please request a new password reset link.
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 mt-8">
              <Link href="/forgot-password" className="w-full">
                <Button
                  className="w-full text-md font-semibold shadow-[0_0_10px_primary]"
                  size="lg"
                >
                  Request New Link
                </Button>
              </Link>
              <Link href="/login" className="w-full">
                <Button variant="ghost" className="w-full" size="lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        <div className="hidden lg:flex flex-4 w-full min-h-screen bg-primary" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex-3 w-full justify-center">
          <Card className="w-full bg-transparent border-none shadow-none max-w-md mx-auto">
            <CardHeader className="mb-6">
              <CardTitle className="text-3xl sm:text-4xl font-bold">
                Password Updated
              </CardTitle>
              <CardDescription className="font-medium text-muted-foreground">
                Your password has been updated. You can now sign in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-green-500/10 px-4 py-3 text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Password reset successful
              </div>
            </CardContent>
            <CardFooter className="mt-8">
              <Link href="/login" className="w-full">
                <Button
                  className="w-full text-md font-semibold shadow-[0_0_10px_primary]"
                  size="lg"
                >
                  Continue to Login
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        <div className="hidden lg:flex flex-4 w-full min-h-screen bg-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex-3 w-full justify-center">
        <Card className="w-full bg-transparent border-none shadow-none max-w-md mx-auto">
          <CardHeader className="mb-6">
            <CardTitle className="text-3xl sm:text-4xl font-bold">
              Reset Password
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground">
              Enter your new password for{" "}
              <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2 mb-6">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    size="lg"
                    icon={<LockIcon />}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-5 top-0 h-full p-0! hover:bg-transparent"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    size="lg"
                    icon={<LockIcon />}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-5 top-0 h-full p-0! hover:bg-transparent"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive">
                    Passwords do not match
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 mt-8">
              <Button
                type="submit"
                className="w-full text-md font-semibold shadow-[0_0_10px_primary]"
                disabled={
                  isLoading ||
                  newPassword !== confirmPassword ||
                  newPassword.length < 6
                }
                size="lg"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
              <Link href="/login" className="w-full">
                <Button variant="ghost" className="w-full" size="lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
      <div className="hidden lg:flex flex-4 w-full min-h-screen bg-primary" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
