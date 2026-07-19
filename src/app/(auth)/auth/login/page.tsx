"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  return (
    <Card className="w-full border-0 bg-card/80 backdrop-blur-sm">
      <CardContent className="pt-6">
        <form action={formAction} className="flex flex-col gap-4">
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
                placeholder="Enter your password"
                required
                className="h-10 pl-9"
              />
            </div>
          </div>

          {(state?.error || urlError) && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state?.error || urlError}
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
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-[#58CC02] hover:underline"
            >
              Create one
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
