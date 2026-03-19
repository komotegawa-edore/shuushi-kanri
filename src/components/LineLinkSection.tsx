"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircle, Link2Off, RefreshCw, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function LineLinkSection() {
  const { user } = useAuth();
  const [linked, setLinked] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [copied, setCopied] = useState(false);

  const getToken = useCallback(async () => {
    if (!user) return null;
    return user.getIdToken();
  }, [user]);

  const fetchStatus = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch("/api/line/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLinked(data.linked);
    } catch {
      console.error("Failed to fetch LINE status");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch("/api/line/link", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "コード発行に失敗しました");
        return;
      }
      const data = await res.json();
      setCode(data.code);
    } catch {
      toast.error("コード発行に失敗しました");
    } finally {
      setGenerating(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm("LINE連携を解除しますか？")) return;
    setUnlinking(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch("/api/line/unlink", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLinked(false);
        setCode(null);
        toast.success("LINE連携を解除しました");
      }
    } catch {
      toast.error("解除に失敗しました");
    } finally {
      setUnlinking(false);
    }
  };

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            LINE連携
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            読み込み中...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          LINE連携
        </CardTitle>
        <CardDescription>
          LINEから経費・売上を会話形式で記録できます
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {linked ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              連携済み
            </div>
            <p className="text-sm text-muted-foreground">
              LINEで「経費」または「売上」と送信すると記録を開始できます。
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnlink}
              disabled={unlinking}
            >
              <Link2Off className="h-4 w-4 mr-2" />
              {unlinking ? "解除中..." : "連携を解除"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {code ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  以下のコードをLINE Botに送信してください（10分間有効）。
                </p>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-mono font-bold tracking-[0.3em] bg-muted px-4 py-2 rounded-lg">
                    {code}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>1. LINE Botを友だち追加してください</p>
                  <p>2. 上記の6桁コードをBotに送信してください</p>
                  <p>3. 連携完了後、このページを更新してください</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchStatus}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  状態を更新
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  LINE Botと連携して、LINEから経費・売上を記録できるようにします。
                </p>
                <Button onClick={handleGenerateCode} disabled={generating}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {generating ? "コード発行中..." : "連携コードを発行"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
