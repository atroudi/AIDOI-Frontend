"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/services";

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  token: z.string().min(1, "Reset token is required"),
  new_password: z.string().min(6, "Password must be at least 6 characters"),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormValues) => {
    setIsLoading(true);
    setError("");
    try {
      await authService.resetPassword(data);
      router.push("/sign-in?reset=true");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Reset Password
      </h1>
      <p className="text-gray-500 mb-8">
        Enter the token from your email along with your new password.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@institution.edu"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          id="token"
          label="Reset Token"
          type="text"
          placeholder="Enter 6-digit token"
          error={errors.token?.message}
          {...register("token")}
        />

        <Input
          id="new_password"
          label="New Password"
          type="password"
          placeholder="••••••••"
          error={errors.new_password?.message}
          {...register("new_password")}
        />

        <Button
          type="submit"
          className="w-full py-3 text-base"
          isLoading={isLoading}
        >
          Reset Password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link
          href="/sign-in"
          className="text-primary hover:text-primary-hover font-medium transition-colors"
        >
          Back to Log In
        </Link>
      </p>
    </div>
  );
}
