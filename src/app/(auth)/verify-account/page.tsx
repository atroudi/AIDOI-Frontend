"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/services";

const verifySchema = z.object({
  token: z
    .string()
    .min(6, "Token must be 6 digits")
    .max(6, "Token must be 6 digits")
    .regex(/^\d+$/, "Token must contain numbers only"),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

export default function VerifyAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: VerifyFormValues) => {
    setIsLoading(true);
    setError("");
    try {
      await authService.verifyAccount({ email, token: data.token });
      setSuccess(true);
      setTimeout(() => router.push("/sign-in"), 2000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr.response?.data?.message ||
          "Invalid or expired token. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Account</h1>
      <p className="text-muted mb-8">
        Check the backend terminal for your 6-digit activation token
        {email && (
          <>
            {" "}
            sent to <span className="font-medium text-foreground">{email}</span>
          </>
        )}
        .
      </p>

      {success ? (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
          ✅ Account activated! Redirecting to sign in…
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="token"
              label="Activation Token"
              type="text"
              placeholder="123456"
              maxLength={6}
              error={errors.token?.message}
              {...register("token")}
            />

            <Button
              type="submit"
              className="w-full py-3 text-base"
              isLoading={isLoading}
            >
              Verify Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Didn&apos;t receive a token?{" "}
            <Link
              href="/sign-in"
              className="text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Back to Sign In
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
