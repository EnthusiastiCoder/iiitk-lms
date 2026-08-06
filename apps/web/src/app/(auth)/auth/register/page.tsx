"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, Lock, User, GraduationCap, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { auth, setTokens } from "@/lib/api";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);
  const [role, setRole] = useState<"student" | "professor">("student");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const full_name = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!full_name || !email || !password) {
      setError("All fields are required.");
      setIsPending(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsPending(false);
      return;
    }

    try {
      const result = await auth.register({ email, password, full_name, role });

      if (result.confirmationRequired) {
        setConfirmEmail(true);
        setIsPending(false);
        return;
      }

      setTokens(result.tokens);
      window.location.href = "/student";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
      setIsPending(false);
    }
  }

  if (confirmEmail) {
    return (
      <Card className="w-full border-0 bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="p-3 rounded-full bg-brand/10">
              <CheckCircle2 className="h-8 w-8 text-[#58CC02]" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Check your email
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              We sent a confirmation link to your email address. Please check
              your inbox and click the link to activate your account.
            </p>
            <Link
              href="/auth/login"
              className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#58CC02] hover:underline"
            >
              <Mail className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 bg-card/80 backdrop-blur-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Your full name"
                required
                className="h-10 pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@iiitkalyani.ac.in"
                required
                className="h-10 pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Use your @iiitkalyani.ac.in email if available
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="h-10 pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-sm font-medium text-foreground">
              Role
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "student" | "professor")}
                className="h-10 w-full appearance-none rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="student">Student</option>
                <option value="professor">Professor</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="h-10 w-full bg-[#58CC02] text-white hover:bg-[#46A302] disabled:opacity-60"
            size="lg"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-[#58CC02] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
