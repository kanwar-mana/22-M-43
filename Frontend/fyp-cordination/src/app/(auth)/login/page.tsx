"use client";

import { useState, useEffect } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/store/auth/authThunk";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User2, LockIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await dispatch(login({ email, password }))
      .unwrap()
      .then(() => {
        router.push("/dashboard");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-3 flex justify-center items-center w-full">
        <Card className="w-full bg-transparent border-none shadow-none max-w-md mx-auto">
          <CardHeader className="mb-4 sm:mb-6 text-center lg:text-start flex flex-col gap-2">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center lg:mx-0 mx-auto overflow-hidden relative">
              <Image src="/logo.png" alt="AcadPath Logo" fill className="object-contain p-2" />
            </div>
            <CardTitle className="text-3xl sm:text-4xl font-bold mt-2">
              Sign In
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground">
              Sign in to FYP Coordination System
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
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
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 mt-8">
              <Button
                type="submit"
                className="w-full text-md font-semibold shadow-[0_0_10px_primary]"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
      <div className="hidden lg:flex flex-4 w-full relative bg-card border-l border-border/50 items-center justify-center p-12 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[128px] opacity-70 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-screen filter blur-[128px] opacity-70" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative z-10 flex flex-col items-center max-w-xl text-center">
          <div className="relative w-48 h-48 md:w-64 md:h-64 mb-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500">
            <Image 
              src="/logo.png" 
              alt="AcadPath Logo" 
              fill 
              className="object-contain filter drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]"
              priority
            />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
            AcadPath
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-md mx-auto">
            The ultimate platform for streamlining Final Year Projects at UET Taxila. Collaborate, track milestones, and manage evaluations seamlessly.
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-2 bg-background/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-border shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Real-time Collaboration
            </div>
            <div className="flex items-center gap-2 bg-background/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-border shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              Smart Workflow
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
