"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle, User2 } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { forgotPassword } from "@/store/auth/authThunk";

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await dispatch(forgotPassword({ email }))
      .unwrap()
      .then(() => {
        setIsEmailSent(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (isEmailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex-3 w-full justify-center">
          <Card className="w-full bg-transparent border-none shadow-none max-w-md mx-auto">
            <CardHeader className="mb-6">
              <CardTitle className="text-3xl sm:text-4xl font-bold">
                Check Your Email
              </CardTitle>
              <CardDescription className="font-medium text-muted-foreground">
                We&apos;ve sent a password reset link to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-green-500/10 px-4 py-3 text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Link sent successfully
              </div>
              <p className="mt-4 font-medium text-primary break-all">{email}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Click the link in the email to reset your password. If you
                don&apos;t see the email, check your spam folder.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 mt-8">
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => setIsEmailSent(false)}
              >
                Try different email
              </Button>
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex-3 w-full justify-center">
        <Card className="w-full bg-transparent border-none shadow-none max-w-md mx-auto">
          <CardHeader className="mb-6">
            <CardTitle className="text-3xl sm:text-4xl font-bold">
              Forgot Password?
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground">
              No worries! Enter your email and we&apos;ll send you a reset link.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2 mb-6">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your university email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  size="lg"
                  icon={<User2 />}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 mt-8">
              <Button
                type="submit"
                className="w-full text-md font-semibold shadow-[0_0_10px_primary]"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
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
