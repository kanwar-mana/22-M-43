"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAppDispatch } from "@/store/hooks";
import { verifyEmail, resendVerificationEmail } from "@/store/auth/authThunk";

export const title = "Email Verification Flow";

const formSchema = z.object({
  code: z.string().min(6, {
    message: "Verification code must be 6 characters.",
  }),
});

interface OtpInputProps {
  email: string;
  onVerification?: () => void;
}

export default function OtpInput({
  email,
  onVerification = () => {},
}: OtpInputProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload: any = { email, verificationCode: values.code };
    setIsVerifying(true);
    await dispatch(verifyEmail(payload))
      .unwrap()
      .then(() => {
        onVerification();
        router.push("/login");
      })
      .finally(() => setIsVerifying(false));
  }

  const handleResend = async () => {
    setIsResending(true);
    await dispatch(resendVerificationEmail({ email }))
      .finally(() => setIsResending(false));
  };

  return (
    <Card className="w-full bg-transparent border-none shadow-none max-w-md mx-auto">
      <CardHeader className="mb-6">
        <CardTitle className="text-3xl sm:text-4xl font-bold">
          Verify Email
        </CardTitle>
        <CardDescription className="font-medium text-muted-foreground">
          Enter the 6-digit code sent to your email.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-6 rounded-md bg-primary/10 px-4 py-3 text-sm text-primary flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span className="truncate">Verification code sent to {email}</span>
        </div>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot className="bg-input/20" index={0} />
                          <InputOTPSlot className="bg-input/20" index={1} />
                          <InputOTPSlot className="bg-input/20" index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot className="bg-input/20" index={3} />
                          <InputOTPSlot className="bg-input/20" index={4} />
                          <InputOTPSlot className="bg-input/20" index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-full text-md font-semibold shadow-[0_0_10px_primary]"
              disabled={isVerifying}
              type="submit"
              size="lg"
            >
              {isVerifying ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter>
        <div className="w-full text-center text-sm text-muted-foreground">
          Didn&apos;t receive the email?{" "}
          <Button
            className="h-auto p-0 font-normal"
            type="button"
            variant="link"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? "Sending..." : "Resend code"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
