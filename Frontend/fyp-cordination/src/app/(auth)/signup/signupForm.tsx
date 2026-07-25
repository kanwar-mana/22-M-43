"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch } from "@/store/hooks";
import { signup } from "@/store/auth/authThunk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LockIcon, Mail, User2, Building } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TabNavigation from "@/components/TabNavigation";
import { DEPARTMENTS } from "@/lib/constants";

interface SignupFormProps {
  setIsVerificationCodeSent: (value: boolean) => void;
  setUserEmail: (value: string) => void;
}

export default function SignupForm({
  setIsVerificationCodeSent,
  setUserEmail,
}: SignupFormProps) {
  type Department = {
    label: string;
    value: string;
  };

  const dispatch = useAppDispatch();
  const router = useRouter();

  const [fullName, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"student" | "supervisor" | "coordinator">(
    "student",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }
    if (!department) {
      setError("Please select a department");
      setIsLoading(false);
      return;
    }
    
    const payload = { fullName, email, password, role, department };
    console.log("Signup payload:", payload);
    await dispatch(signup(payload))
      .unwrap()
      .then((res) => {
        setUserEmail(res?.data?.email || email);
        setIsVerificationCodeSent(true);
        router.replace("/signup?step=verify-account");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="flex items-center justify-center w-full">
      <Card className="w-full bg-transparent border-none shadow-none max-w-md mx-auto">
        <CardHeader className="mb-6 flex flex-col gap-2">
          <div className="w-16 h-16 rounded-xl bg-primary/10 overflow-hidden relative">
            <Image src="/logo.png" alt="AcadPath Logo" fill className="object-contain p-2" />
          </div>
          <CardTitle className="text-3xl sm:text-4xl font-bold text-center mt-2">
            Create Account
          </CardTitle>
          <CardDescription className="font-medium text-muted-foreground text-center">
            Join the FYP Coordination System
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error?.message || error}
              </div>
            )}
            <TabNavigation
              defaultValue="student"
              tabs={[
                { value: "student", label: "Student" },
                { value: "supervisor", label: "Supervisor" },
                { value: "coordinator", label: "Coordinator" },
              ]}
              onValueChange={(value) =>
                setRole(value as "student" | "supervisor" | "coordinator")
              }
            />
            <div className="space-y-2 mb-6">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                size="lg"
                icon={<User2 />}
              />
            </div>
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
                icon={<Mail />}
              />
            </div>
            <div className="space-y-2">
              <Select onValueChange={setDepartment} value={department} required>
                <SelectTrigger className="h-12! w-full text-sm bg-input/20 border-input shadow-sm">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                size="lg"
                icon={<LockIcon />}
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
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
