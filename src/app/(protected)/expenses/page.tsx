"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { ExpenseTemplate } from "@/types";
import {
  getExpenseTemplates,
  addExpenseTemplate,
  deleteExpenseTemplate,
} from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import SuccessAnimation from "@/components/SuccessAnimation";
import {
  Receipt,
  Zap,
  Repeat,
  Trash2,
  Plus,
  TrendingDown,
  Sparkles,
  Target,
  ChevronDown,
  ChevronUp,
  X,
  Train,
  Smartphone,
  PenLine,
  UtensilsCrossed,
  Home,
  Lightbulb,
  Megaphone,
  Handshake,
  Package,
  BookOpen,
  Monitor,
  Landmark,
  Folder,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  旅費交通費: Train,
  通信費: Smartphone,
  消耗品費: PenLine,
  接待交際費: UtensilsCrossed,
  地代家賃: Home,
  水道光熱費: Lightbulb,
  広告宣伝費: Megaphone,
  外注費: Handshake,
  雑費: Package,
  新聞図書費: BookOpen,
  減価償却費: Monitor,
  租税公課: Landmark,
};

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = CATEGORY_ICONS[name] || Folder;
  return <Icon className={className} />;
}

interface QuickAddState {
  categoryId: string;
  categoryName: string;
  amount: string;
  description: string;
}

export default function ExpensesPage() {
  const { user } = useAuth();
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");

  const { transactions, loading, add, remove } = useTransactions({
    type: "expense",
    startDate: monthStart,
    endDate: monthEnd,
  });
  const { expenseCategories, loading: categoriesLoading } = useCategories();

  // Templates
  const [templates, setTemplates] = useState<ExpenseTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const loadTemplates = useCallback(async () => {
    if (!user) return;
    setTemplatesLoading(true);
    try {
      const data = await getExpenseTemplates(user.uid);
      setTemplates(data);
    } finally {
      setTemplatesLoading(false);
    }
  }, [user]);
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Quick-add state
  const [quickAdd, setQuickAdd] = useState<QuickAddState | null>(null);
  const [quickAddSubmitting, setQuickAddSubmitting] = useState(false);

  // Success animation
  const [successAnim, setSuccessAnim] = useState<{
    show: boolean;
    amount: number;
    key: number;
  }>({ show: false, amount: 0, key: 0 });

  // Recently added item IDs for highlight animation
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());

  // Template creation form
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    amount: "",
    categoryId: "",
    description: "",
    client: "",
  });
  const [templateSubmitting, setTemplateSubmitting] = useState(false);

  const [showAllExpenses, setShowAllExpenses] = useState(false);

  // ---- Computed ----
  const monthlyTotal = useMemo(
    () => transactions.reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const categoryBreakdown = useMemo(() => {
    const map = new Map<
      string,
      { name: string; total: number; count: number }
    >();
    transactions.forEach((t) => {
      const existing = map.get(t.categoryId);
      if (existing) {
        existing.total += t.amount;
        existing.count += 1;
      } else {
        map.set(t.categoryId, { name: t.categoryName, total: t.amount, count: 1 });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [transactions]);

  const maxCategoryAmount = useMemo(
    () => (categoryBreakdown.length > 0 ? categoryBreakdown[0].total : 0),
    [categoryBreakdown]
  );

  const recentExpenses = useMemo(
    () =>
      [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20),
    [transactions]
  );

  const monthLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`;

  // ---- Handlers ----
  const handleCategoryTap = (categoryId: string, categoryName: string) => {
    if (quickAdd?.categoryId === categoryId) {
      setQuickAdd(null);
      return;
    }
    setQuickAdd({ categoryId, categoryName, amount: "", description: "" });
  };

  const triggerSuccess = (amount: number) => {
    setSuccessAnim((prev) => ({ show: true, amount, key: prev.key + 1 }));
  };

  const handleQuickSave = async () => {
    if (!user || !quickAdd) return;
    const amount = Number(quickAdd.amount);
    if (!amount || amount <= 0) {
      toast.error("金額を入力してください");
      return;
    }

    setQuickAddSubmitting(true);
    try {
      const today = format(now, "yyyy-MM-dd");
      await add({
        type: "expense",
        date: today,
        categoryId: quickAdd.categoryId,
        categoryName: quickAdd.categoryName,
        amount,
        description: quickAdd.description,
      });

      triggerSuccess(amount);
      setQuickAdd(null);
    } catch {
      toast.error("記録に失敗しました");
    } finally {
      setQuickAddSubmitting(false);
    }
  };

  const handleTemplateRegister = async (tpl: ExpenseTemplate) => {
    if (!user) return;
    try {
      const today = format(now, "yyyy-MM-dd");
      await add({
        type: "expense",
        date: today,
        categoryId: tpl.categoryId,
        categoryName: tpl.categoryName,
        amount: tpl.amount,
        description: tpl.description,
        client: tpl.client || undefined,
      });

      triggerSuccess(tpl.amount);
    } catch {
      toast.error("登録に失敗しました");
    }
  };

  const handleTemplateDelete = async (tpl: ExpenseTemplate) => {
    if (!user) return;
    try {
      await deleteExpenseTemplate(user.uid, tpl.id);
      await loadTemplates();
      toast.success("テンプレートを削除しました");
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  const handleTemplateAdd = async () => {
    if (!user) return;
    if (!templateForm.name.trim()) {
      toast.error("テンプレート名を入力してください");
      return;
    }
    if (!templateForm.categoryId) {
      toast.error("カテゴリを選択してください");
      return;
    }
    const amount = Number(templateForm.amount);
    if (!amount || amount <= 0) {
      toast.error("金額を入力してください");
      return;
    }
    const category = expenseCategories.find(
      (c) => c.id === templateForm.categoryId
    );
    if (!category) {
      toast.error("カテゴリが見つかりません");
      return;
    }

    setTemplateSubmitting(true);
    try {
      await addExpenseTemplate(user.uid, {
        name: templateForm.name.trim(),
        amount,
        categoryId: templateForm.categoryId,
        categoryName: category.name,
        description: templateForm.description,
        client: templateForm.client,
      });
      await loadTemplates();
      setShowTemplateForm(false);
      setTemplateForm({
        name: "",
        amount: "",
        categoryId: "",
        description: "",
        client: "",
      });
      toast.success("テンプレートを追加しました");
    } catch {
      toast.error("追加に失敗しました");
    } finally {
      setTemplateSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await remove(id);
      toast.success("削除しました");
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  if (!user) return null;
  const isLoading = loading || categoriesLoading;

  return (
    <div className="space-y-6">
      {/* Success overlay animation */}
      <SuccessAnimation
        key={successAnim.key}
        show={successAnim.show}
        amount={successAnim.amount}
        onComplete={() => setSuccessAnim((prev) => ({ ...prev, show: false }))}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="h-6 w-6 text-orange-500" />
          経費記録
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          カテゴリをタップ → 金額を入力 → 完了
        </p>
      </div>

      {/* Monthly Total */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #fff7ed 0%, #fffbeb 50%, #fef3c7 100%)",
        }}
      >
        <div className="relative z-10">
          <p className="text-sm font-medium text-orange-700/80">
            {monthLabel}の経費
          </p>
          <p className="text-3xl font-bold text-orange-600 mt-1 tabular-nums tracking-tight">
            ¥{isLoading ? "---" : monthlyTotal.toLocaleString()}
          </p>
          <p className="text-xs text-orange-600/60 mt-1">
            {transactions.length}件
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-orange-200/40" />
        <div className="absolute -right-8 -top-8 w-20 h-20 rounded-full bg-amber-200/30" />
      </div>

      {/* Quick-Add Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            かんたん経費入力
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {expenseCategories.map((cat) => {
                  const isSelected = quickAdd?.categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryTap(cat.id, cat.name)}
                      className={`
                        flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3
                        transition-all duration-200 min-h-[72px] active:scale-95
                        ${
                          isSelected
                            ? "border-orange-400 bg-orange-50 dark:bg-orange-950/30 shadow-lg shadow-orange-200/50 scale-[1.03]"
                            : "border-transparent bg-muted/40 hover:bg-muted hover:shadow-sm"
                        }
                      `}
                    >
                      <CategoryIcon
                        name={cat.name}
                        className={`h-5 w-5 transition-transform duration-200 ${
                          isSelected
                            ? "scale-110 text-orange-500"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={`text-[11px] font-medium leading-tight text-center ${
                          isSelected
                            ? "text-orange-700 dark:text-orange-300"
                            : "text-foreground/80"
                        }`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Inline input */}
              {quickAdd && (
                <div
                  className="mt-4 rounded-xl border border-orange-200 dark:border-orange-800/40 bg-gradient-to-b from-orange-50/80 to-white dark:from-orange-950/20 dark:to-background p-4 space-y-3"
                  style={{
                    animation: "slideDown 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CategoryIcon
                        name={quickAdd.categoryName}
                        className="h-5 w-5 text-orange-500"
                      />
                      <span className="font-medium text-orange-700 dark:text-orange-300">
                        {quickAdd.categoryName}
                      </span>
                    </div>
                    <button
                      onClick={() => setQuickAdd(null)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 font-bold text-lg">
                      ¥
                    </span>
                    <Input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      placeholder="金額"
                      value={quickAdd.amount}
                      onChange={(e) =>
                        setQuickAdd((prev) =>
                          prev ? { ...prev, amount: e.target.value } : null
                        )
                      }
                      className="pl-9 text-xl font-bold h-12 border-orange-200 dark:border-orange-800/40 focus-visible:ring-orange-400"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleQuickSave();
                      }}
                    />
                  </div>

                  <Input
                    placeholder="メモ（任意）"
                    value={quickAdd.description}
                    onChange={(e) =>
                      setQuickAdd((prev) =>
                        prev ? { ...prev, description: e.target.value } : null
                      )
                    }
                    className="border-orange-200 dark:border-orange-800/40 focus-visible:ring-orange-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleQuickSave();
                    }}
                  />

                  <Button
                    onClick={handleQuickSave}
                    disabled={quickAddSubmitting || !quickAdd.amount}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white h-11 text-base font-semibold active:scale-[0.98] transition-all"
                  >
                    {quickAddSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Sparkles className="mr-1.5 h-4 w-4" />
                        記録する
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Templates */}
      {(templates.length > 0 || showTemplateForm) && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Repeat className="h-4 w-4 text-amber-500" />
                定期支出
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateForm((prev) => !prev)}
                className="text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                追加
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showTemplateForm && (
              <div
                className="mb-4 rounded-lg border border-dashed border-orange-300 dark:border-orange-700 p-4 space-y-3 bg-orange-50/30 dark:bg-orange-950/10"
                style={{
                  animation: "slideDown 0.2s ease-out",
                }}
              >
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  新しいテンプレート
                </p>
                <Input
                  placeholder="テンプレート名（例: Adobe CC）"
                  value={templateForm.name}
                  onChange={(e) =>
                    setTemplateForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
                <div className="flex flex-wrap gap-1.5">
                  {expenseCategories.map((cat) => (
                    <Button
                      key={cat.id}
                      type="button"
                      variant={
                        templateForm.categoryId === cat.id
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setTemplateForm((prev) => ({
                          ...prev,
                          categoryId: cat.id,
                        }))
                      }
                      className={
                        templateForm.categoryId === cat.id
                          ? "bg-orange-500 hover:bg-orange-600"
                          : ""
                      }
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      ¥
                    </span>
                    <Input
                      type="number"
                      min="0"
                      placeholder="金額"
                      value={templateForm.amount}
                      onChange={(e) =>
                        setTemplateForm((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      className="pl-8"
                    />
                  </div>
                  <Input
                    placeholder="メモ（任意）"
                    value={templateForm.description}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowTemplateForm(false);
                      setTemplateForm({
                        name: "",
                        amount: "",
                        categoryId: "",
                        description: "",
                        client: "",
                      });
                    }}
                  >
                    キャンセル
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleTemplateAdd}
                    disabled={templateSubmitting}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {templateSubmitting ? "保存中..." : "保存"}
                  </Button>
                </div>
              </div>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="flex items-center justify-between rounded-xl border bg-card p-3 hover:shadow-md transition-all duration-200 group active:scale-[0.98]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {tpl.name}
                      </span>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {tpl.categoryName}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mt-0.5">
                      ¥{tpl.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Button
                      size="sm"
                      onClick={() => handleTemplateRegister(tpl)}
                      className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-3 text-xs active:scale-95 transition-all"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      記録
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleTemplateDelete(tpl)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-500" />
            {monthLabel} カテゴリ別
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
            </div>
          ) : categoryBreakdown.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">今月の経費データがありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((cat, i) => {
                const percentage =
                  monthlyTotal > 0
                    ? Math.round((cat.total / monthlyTotal) * 100)
                    : 0;
                const barWidth =
                  maxCategoryAmount > 0
                    ? Math.max((cat.total / maxCategoryAmount) * 100, 4)
                    : 0;
                return (
                  <div
                    key={cat.name}
                    className="space-y-1"
                    style={{
                      animation: `fadeSlideIn 0.3s ease-out ${i * 0.05}s both`,
                    }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <CategoryIcon
                          name={cat.name}
                          className="h-4 w-4 text-orange-500 shrink-0"
                        />
                        <span className="font-medium truncate">{cat.name}</span>
                        <span className="text-muted-foreground text-xs shrink-0">
                          {cat.count}件
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-xs text-muted-foreground">
                          {percentage}%
                        </span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400 tabular-nums">
                          ¥{cat.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400"
                        style={{
                          width: `${barWidth}%`,
                          transition: "width 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 mt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">合計</span>
                  <span className="font-bold text-lg text-orange-600 dark:text-orange-400 tabular-nums">
                    ¥{monthlyTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-amber-500" />
              最近の経費
            </CardTitle>
            {recentExpenses.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllExpenses((prev) => !prev)}
                className="text-xs"
              >
                {showAllExpenses ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5 mr-1" />
                    閉じる
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5 mr-1" />
                    全{recentExpenses.length}件
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
            </div>
          ) : recentExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">まだ経費がありません</p>
              <p className="text-xs mt-1">
                上のカテゴリボタンから記録しましょう
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {(showAllExpenses
                ? recentExpenses
                : recentExpenses.slice(0, 5)
              ).map((t, i) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-all duration-150 group"
                  style={{
                    animation: `fadeSlideIn 0.25s ease-out ${i * 0.03}s both`,
                  }}
                >
                  <div className="h-9 w-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                    <CategoryIcon
                      name={t.categoryName}
                      className="h-4 w-4 text-orange-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium truncate">
                        {t.description || t.categoryName}
                      </span>
                      {t.description && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] shrink-0"
                        >
                          {t.categoryName}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.date}
                      {t.client && ` ・ ${t.client}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                      -¥{t.amount.toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteExpense(t.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Global animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-8px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes fadeSlideIn {
              from { opacity: 0; transform: translateY(6px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `,
        }}
      />
    </div>
  );
}
