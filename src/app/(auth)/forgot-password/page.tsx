"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/services";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setIsLoading(true);
    setError("");
    try {
      await authService.forgotPassword(data);
      setSuccess(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr.response?.data?.message || "Failed to send reset email"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-4 text-center">
          Check Your Email
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          If an account with that email exists, we&apos;ve sent a password reset
          token. Check your inbox and use it to reset your password.
        </p>
        <Link
          href="/reset-password"
          className="text-primary hover:text-primary-hover font-medium block"
        >
          Enter Reset Token →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900 mb-2 text-center">
        Forgot Password
      </h1>
      <p className="text-gray-500 mb-8 text-center">
        Enter your email and we&apos;ll send you a reset token.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          id="email"
          label="Work Email"
          type="email"
          placeholder="you@institution.edu"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button
          type="submit"
          className="w-full py-3 text-base"
          isLoading={isLoading}
        >
          Send Reset Token
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Remember your password?{" "}
        <Link
          href="/sign-in"
          className="text-primary hover:text-primary-hover font-medium transition-colors"
        >
          Log In
        </Link>
      </p>
    </div>
  );
}
