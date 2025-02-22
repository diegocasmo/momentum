"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInSchema } from "@/app/schemas/sign-in-schema";
import { setFormErrors } from "@/lib/utils/form";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestOtpAction } from "@/app/actions/request-otp-action";
import { verifyOtpAction } from "@/app/actions/verify-otp-action";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RootFormError } from "@/components/root-form-error";

export function SignInForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"email" | "otp">("email");

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      otp: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      try {
        if (step === "email") {
          const formData = new FormData();
          formData.set("email", data.email);
          const result = await requestOtpAction(formData);

          if (result.success) {
            setStep("otp");
          } else {
            setFormErrors(form.setError, result.errors);
          }
        } else {
          const formData = new FormData();
          formData.set("email", data.email);
          formData.set("otp", data.otp!);
          const result = await verifyOtpAction(formData);

          if (result.success) {
            router.push("/dashboard");
          } else {
            setFormErrors(form.setError, result.errors);
          }
        }
      } catch (error) {
        console.error("Sign in error:", error);
        form.setError("root", {
          type: "manual",
          message: "An unexpected error occurred. Please try again.",
        });
      }
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {step === "email"
                  ? "We'll send you a one-time password."
                  : "Enter the OTP sent to your email."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {step === "otp" && (
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>One-Time Password</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter your OTP"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <RootFormError message={form.formState.errors.root?.message} />
        <div className="flex justify-center">
          <Button type="submit" disabled={isPending || !form.formState.isValid}>
            {isPending
              ? "Submitting..."
              : step === "email"
              ? "Continue with email"
              : "Verify OTP"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
