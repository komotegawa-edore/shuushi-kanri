"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, saveUserProfile } from "@/lib/firestore";
import { UserProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCategories } from "@/hooks/useCategories";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";

export default function SettingsPage() {
  const { user } = useAuth();
  const {
    categories,
    incomeCategories,
    expenseCategories,
    add: addCategory,
    remove: removeCategory,
  } = useCategories();

  const [profile, setProfile] = useState({
    displayName: "",
    businessName: "",
    address: "",
    phone: "",
    email: "",
    bankInfo: "",
    invoiceNumber: "",
  });
  const [saving, setSaving] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<"income" | "expense">(
    "expense"
  );

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((data) => {
      if (data) {
        setProfile({
          displayName: data.displayName || "",
          businessName: data.businessName || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || user.email || "",
          bankInfo: data.bankInfo || "",
          invoiceNumber: data.invoiceNumber || "",
        });
      } else {
        setProfile((prev) => ({ ...prev, email: user.email || "" }));
      }
    });
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveUserProfile(user.uid, {
        ...profile,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      toast.success("プロフィールを保存しました");
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await addCategory({
        name: newCategoryName.trim(),
        type: newCategoryType,
        isDefault: false,
      });
      setNewCategoryName("");
      setCategoryDialogOpen(false);
      toast.success("カテゴリを追加しました");
    } catch {
      toast.error("追加に失敗しました");
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    try {
      await removeCategory(id);
      toast.success("カテゴリを削除しました");
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">設定</h1>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>プロフィール</CardTitle>
          <CardDescription>
            請求書に表示される事業者情報を設定します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>表示名</Label>
              <Input
                value={profile.displayName}
                onChange={(e) =>
                  setProfile({ ...profile, displayName: e.target.value })
                }
                placeholder="山田太郎"
              />
            </div>
            <div className="space-y-2">
              <Label>屋号</Label>
              <Input
                value={profile.businessName}
                onChange={(e) =>
                  setProfile({ ...profile, businessName: e.target.value })
                }
                placeholder="山田デザイン事務所"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>住所</Label>
            <Input
              value={profile.address}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
              placeholder="東京都渋谷区..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>電話番号</Label>
              <Input
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                placeholder="090-1234-5678"
              />
            </div>
            <div className="space-y-2">
              <Label>メールアドレス</Label>
              <Input
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>インボイス登録番号</Label>
            <Input
              value={profile.invoiceNumber}
              onChange={(e) =>
                setProfile({ ...profile, invoiceNumber: e.target.value })
              }
              placeholder="T1234567890123"
            />
          </div>
          <div className="space-y-2">
            <Label>振込先情報</Label>
            <Textarea
              value={profile.bankInfo}
              onChange={(e) =>
                setProfile({ ...profile, bankInfo: e.target.value })
              }
              placeholder="○○銀行 △△支店 普通 1234567 ヤマダ タロウ"
              rows={3}
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "保存中..." : "保存"}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Category Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>カテゴリ管理</CardTitle>
            <CardDescription>取引のカテゴリを管理します</CardDescription>
          </div>
          <Button size="sm" onClick={() => setCategoryDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            追加
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">売上カテゴリ</h3>
            <div className="flex flex-wrap gap-2">
              {incomeCategories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {cat.name}
                  {!cat.isDefault && (
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="ml-1 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">経費カテゴリ</h3>
            <div className="flex flex-wrap gap-2">
              {expenseCategories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {cat.name}
                  {!cat.isDefault && (
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="ml-1 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>カテゴリ追加</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>種別</Label>
              <Select
                value={newCategoryType}
                onValueChange={(v) =>
                  setNewCategoryType(v as "income" | "expense")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income" label="売上">売上</SelectItem>
                  <SelectItem value="expense" label="経費">経費</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>カテゴリ名</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="カテゴリ名を入力"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCategoryDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button onClick={handleAddCategory}>追加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
