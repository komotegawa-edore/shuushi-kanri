"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "エラーが発生しました";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50/40 -z-10" />
      <div className="absolute top-20 left-[10%] w-32 h-32 rounded-full bg-blue-100/50 blur-2xl" />
      <div className="absolute bottom-20 right-[10%] w-40 h-40 rounded-full bg-emerald-100/50 blur-2xl" />

      <div className="w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <Image
              src="/icon.png"
              alt="スット"
              width={56}
              height={56}
              className="mx-auto mb-3 drop-shadow-md"
            />
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
            スット
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            個人事業主のための収支管理
          </p>
        </div>

        <Card className="shadow-xl shadow-blue-100/30 border-blue-100/50">
          <CardHeader className="text-center pb-2">
            <h2 className="text-lg font-semibold">
              {isSignUp ? "新規アカウント作成" : "ログイン"}
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="6文字以上"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={loading}
              >
                {loading ? "処理中..." : isSignUp ? "アカウント作成" : "ログイン"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              {isSignUp ? (
                <p>
                  アカウントをお持ちの方は{" "}
                  <button
                    onClick={() => setIsSignUp(false)}
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    ログイン
                  </button>
                </p>
              ) : (
                <p>
                  アカウントがない方は{" "}
                  <button
                    onClick={() => setIsSignUp(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    新規登録
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
