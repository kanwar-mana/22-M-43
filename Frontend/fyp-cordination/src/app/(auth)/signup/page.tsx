"use client";
import SignupForm from "./signupForm";
import OtpInput from "@/components/auth/otpInput";
import Image from "next/image";
import { useState } from "react";

export default function Page() {
  const [isVerificationCodeSent, setIsVerificationCodeSent] =
    useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="flex-3 flex items-center w-full justify-center">
        <div className="mx-auto flex w-full max-w-md items-center justify-center">
          {isVerificationCodeSent ? (
            <OtpInput email={userEmail} />
          ) : (
            <SignupForm
              setIsVerificationCodeSent={setIsVerificationCodeSent}
              setUserEmail={setUserEmail}
            />
          )}
        </div>
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
