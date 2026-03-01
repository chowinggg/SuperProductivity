/**
 * ============================================
 * 登录页面
 * ============================================
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormItem } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { Target } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/okr");
      router.refresh();
    } catch (error: any) {
      setError(error.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
            <Target className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">Super Productivity</h1>
          <p className="text-sm text-muted-foreground">
            登录您的账户
          </p>
        </div>

        {/* 登录卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>欢迎回来</CardTitle>
            <CardDescription>
              输入邮箱和密码登录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <FormItem label="邮箱" required>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FormItem>

              <FormItem label="密码" required>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FormItem>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" loading={loading}>
                登录
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <Link
                href="/register"
                className="text-primary hover:underline"
              >
                还没有账户？立即注册
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 演示账户提示 */}
        <div className="text-center text-sm text-muted-foreground">
          <p>演示账户</p>
          <p>邮箱: demo@example.com</p>
          <p>密码: demopassword</p>
        </div>
      </div>
    </div>
  );
}
