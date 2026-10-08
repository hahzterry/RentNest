"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, User } from "lucide-react";
import * as React from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

const DASHBOARD: Record<string, string> = {
  tenant: "/dashboard/tenant",
  landlord: "/dashboard/landlord",
  admin: "/dashboard/admin",
};

const DEMO_ACCOUNTS = [
  {
    label: "Admin",
    email: "admin@rentnest.com",
    password: "Admin@123",
    icon: ShieldCheck,
    color: "from-violet-500 to-purple-600",
  },
  {
    label: "User",
    email: "tanvir@rentnest.com",
    password: "Password123!",
    icon: User,
    color: "from-sky-500 to-blue-600",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [quickLoading, setQuickLoading] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const doLogin = async (email: string, password: string) => {
    const user = await login(email, password);
    const next = searchParams.get("next");
    const destination =
      next && next.startsWith("/") ? next : DASHBOARD[user.role] ?? "/";
    router.refresh();
    router.push(destination);
  };

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setLoading(true);
    try {
      await doLogin(values.email, values.password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email: string, password: string, label: string) => {
    setError(null);
    setQuickLoading(label);
    setValue("email", email);
    setValue("password", password);
    try {
      await doLogin(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setQuickLoading(null);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your rentals, requests and payments."
    >
      {/* ── Demo quick-login buttons ── */}
      <div className="mb-5">
        <p className="mb-2.5 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Quick demo login
        </p>
        <div className="grid grid-cols-2 gap-3">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.label}
              type="button"
              disabled={!!quickLoading || loading}
              onClick={() => quickLogin(acc.email, acc.password, acc.label)}
              className={`group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r ${acc.color} px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.03] hover:shadow-lg active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {quickLoading === acc.label ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <acc.icon className="h-4 w-4" />
              )}
              {acc.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="relative mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or sign in manually</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              className="pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">
              Password
            </label>
            <Link
              href="/auth/login"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="pl-10 pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <div
            className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
            role="alert"
          >
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-primary hover:underline"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
