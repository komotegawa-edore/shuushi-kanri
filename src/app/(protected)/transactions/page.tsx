"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/contexts/AuthContext";
import { Transaction, ExpenseTemplate } from "@/types";
import {
  getExpenseTemplates,
  addExpenseTemplate,
  deleteExpenseTemplate,
} from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Repeat,
  Zap,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import SuccessAnimation from "@/components/SuccessAnimation";

type TransactionType = "income" | "expense";
type FilterType = "all" | TransactionType;

interface FormData {
  date: string;
  categoryId: string;
  amount: string;
  description: string;
  client: string;
}

const emptyForm: FormData = {
  date: new Date().toISOString().split("T")[0],
  categoryId: "",
  amount: "",
  description: "",
  client: "",
};

export default function TransactionsPage() {
  const { user } = useAuth();

  const [filterType, setFilterType] = useState<FilterType>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filters = useMemo(() => {
    const f: { type?: TransactionType; startDate?: string; endDate?: string } = {};
    if (filterType !== "all") f.type = filterType;
    if (startDate) f.startDate = startDate;
    if (endDate) f.endDate = endDate;
    return f;
  }, [filterType, startDate, endDate]);

  const { transactions, loading, add, update, remove } = useTransactions(filters);
  const { categories, incomeCategories, expenseCategories } = useCategories();

  // Templates
  const [templates, setTemplates] = useState<ExpenseTemplate[]>([]);
  const loadTemplates = useCallback(async () => {
    if (!user) return;
    const data = await getExpenseTemplates(user.uid);
    setTemplates(data);
  }, [user]);
  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  // 取引先の予測変換用：過去の取引先名リスト
  const clientSuggestions = useMemo(() => {
    const names = new Set<string>();
    transactions.forEach((t) => {
      if (t.client) names.add(t.client);
    });
    return Array.from(names).sort();
  }, [transactions]);

  // Dialog state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formType, setFormType] = useState<TransactionType>("expense");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successAnim, setSuccessAnim] = useState<{
    show: boolean;
    amount: number;
    message: string;
    key: number;
  }>({ show: false, amount: 0, message: "", key: 0 });

  const filteredCategories = formType === "income" ? incomeCategories : expenseCategories;

  // カテゴリ名を取得するヘルパー
  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "";

  // 売上登録
  const openIncomeForm = () => {
    setEditingTransaction(null);
    setFormType("income");
    setFormData(emptyForm);
    setSaveAsTemplate(false);
    setFormDialogOpen(true);
  };

  // 経費登録
  const openExpenseForm = () => {
    setEditingTransaction(null);
    setFormType("expense");
    setFormData(emptyForm);
    setSaveAsTemplate(false);
    setFormDialogOpen(true);
  };

  // テンプレートから経費を即登録
  const registerFromTemplate = async (tpl: ExpenseTemplate) => {
    if (!user) return;
    try {
      await add({
        type: "expense",
        date: new Date().toISOString().split("T")[0],
        categoryId: tpl.categoryId,
        categoryName: tpl.categoryName,
        amount: tpl.amount,
        description: tpl.description,
        client: tpl.client || undefined,
      });
      setSuccessAnim((prev) => ({
        show: true,
        amount: tpl.amount,
        message: `「${tpl.name}」を記録しました`,
        key: prev.key + 1,
      }));
    } catch {
      toast.error("登録に失敗しました");
    }
  };

  // テンプレート削除
  const handleDeleteTemplate = async (tpl: ExpenseTemplate) => {
    if (!user) return;
    try {
      await deleteExpenseTemplate(user.uid, tpl.id);
      await loadTemplates();
      toast.success("テンプレートを削除しました");
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  // 編集
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormType(transaction.type);
    setFormData({
      date: transaction.date,
      categoryId: transaction.categoryId,
      amount: String(transaction.amount),
      description: transaction.description,
      client: transaction.client ?? "",
    });
    setSaveAsTemplate(false);
    setFormDialogOpen(true);
  };

  // 削除確認
  const handleDeleteClick = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  // 登録/更新
  const handleSubmit = async () => {
    if (!formData.categoryId) {
      toast.error("カテゴリを選択してください");
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("有効な金額を入力してください");
      return;
    }
    if (!formData.date) {
      toast.error("日付を入力してください");
      return;
    }

    const category = categories.find((c) => c.id === formData.categoryId);
    if (!category) {
      toast.error("カテゴリが見つかりません");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type: formType,
        date: formData.date,
        categoryId: formData.categoryId,
        categoryName: category.name,
        amount: Number(formData.amount),
        description: formData.description,
        client: formData.client || undefined,
      };

      if (editingTransaction) {
        await update(editingTransaction.id, payload);
        toast.success("取引を更新しました");
      } else {
        await add(payload as Omit<Transaction, "id" | "createdAt" | "updatedAt">);
        setSuccessAnim((prev) => ({
          show: true,
          amount: Number(formData.amount),
          message: formType === "income" ? "売上を記録しました" : "経費を記録しました",
          key: prev.key + 1,
        }));
      }

      // テンプレート保存
      if (saveAsTemplate && !editingTransaction && formType === "expense" && user) {
        const tplName = templateName.trim() || formData.description || category.name;
        await addExpenseTemplate(user.uid, {
          name: tplName,
          amount: Number(formData.amount),
          categoryId: formData.categoryId,
          categoryName: category.name,
          description: formData.description,
          client: formData.client,
        });
        await loadTemplates();
        toast.success(`テンプレート「${tplName}」を保存しました`);
      }

      setFormDialogOpen(false);
      setFormData(emptyForm);
      setEditingTransaction(null);
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  // 削除実行
  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;
    setSubmitting(true);
    try {
      await remove(deletingTransaction.id);
      toast.success("取引を削除しました");
      setDeleteDialogOpen(false);
      setDeletingTransaction(null);
    } catch {
      toast.error("削除に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Success animation */}
      <SuccessAnimation
        key={successAnim.key}
        show={successAnim.show}
        amount={successAnim.amount}
        message={successAnim.message}
        onComplete={() => setSuccessAnim((prev) => ({ ...prev, show: false }))}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">取引記録</h1>
        <div className="flex gap-2">
          <Button onClick={openIncomeForm} className="bg-blue-500 hover:bg-blue-600 text-white">
            <TrendingUp className="mr-1.5 h-4 w-4" />
            売上登録
          </Button>
          <Button onClick={openExpenseForm} className="bg-rose-500 hover:bg-rose-600 text-white">
            <TrendingDown className="mr-1.5 h-4 w-4" />
            経費登録
          </Button>
        </div>
      </div>

      {/* 定期支出テンプレート */}
      {templates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              定期支出（ワンクリック登録）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {templates.map((tpl) => (
                <div key={tpl.id} className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => registerFromTemplate(tpl)}
                    className="gap-1.5"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {tpl.name}
                    <span className="text-muted-foreground">
                      ¥{tpl.amount.toLocaleString()}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleDeleteTemplate(tpl)}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <Label>種別</Label>
              <div className="flex gap-1">
                {(["all", "income", "expense"] as const).map((v) => (
                  <Button
                    key={v}
                    variant={filterType === v ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(v)}
                  >
                    {v === "all" ? "全て" : v === "income" ? "売上" : "経費"}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>開始日</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div className="space-y-2">
              <Label>終了日</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[160px]"
              />
            </div>
            {(filterType !== "all" || startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterType("all");
                  setStartDate("");
                  setEndDate("");
                }}
              >
                リセット
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle>取引一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              取引データがありません
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日付</TableHead>
                  <TableHead>種別</TableHead>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead>取引先</TableHead>
                  <TableHead className="text-right">金額</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>
                      <Badge variant={t.type === "income" ? "default" : "destructive"}>
                        {t.type === "income" ? "売上" : "経費"}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.categoryName}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{t.description}</TableCell>
                    <TableCell className="text-muted-foreground">{t.client || "-"}</TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={t.type === "income" ? "text-blue-600" : "text-rose-600"}>
                        {t.type === "expense" ? "-" : ""}¥{t.amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(t)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* datalist for client autocomplete */}
      <datalist id="client-suggestions">
        {clientSuggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      {/* Add/Edit Dialog */}
      <Dialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          setFormDialogOpen(open);
          if (!open) {
            setEditingTransaction(null);
            setFormData(emptyForm);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction
                ? "取引を編集"
                : formType === "income"
                  ? "売上登録"
                  : "経費登録"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* 日付 */}
            <div className="space-y-2">
              <Label>日付</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>

            {/* カテゴリ - ボタン形式 */}
            <div className="space-y-2">
              <Label>カテゴリ</Label>
              <div className="flex flex-wrap gap-1.5">
                {filteredCategories.map((cat) => (
                  <Button
                    key={cat.id}
                    type="button"
                    variant={formData.categoryId === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, categoryId: cat.id }))
                    }
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
              {formData.categoryId && (
                <p className="text-xs text-muted-foreground">
                  選択中: {getCategoryName(formData.categoryId)}
                </p>
              )}
            </div>

            {/* 金額 */}
            <div className="space-y-2">
              <Label>金額</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
              />
            </div>

            {/* 説明 */}
            <div className="space-y-2">
              <Label>説明</Label>
              <Textarea
                placeholder="取引の説明を入力"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            {/* 取引先名（予測変換付き） */}
            <div className="space-y-2">
              <Label>取引先名</Label>
              <Input
                list="client-suggestions"
                placeholder="取引先名を入力（過去の入力から予測）"
                value={formData.client}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, client: e.target.value }))
                }
              />
            </div>

            {/* テンプレート保存（経費の新規登録時のみ） */}
            {formType === "expense" && !editingTransaction && (
              <div className="rounded-md border p-3 space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveAsTemplate}
                    onChange={(e) => setSaveAsTemplate(e.target.checked)}
                    className="rounded"
                  />
                  <Save className="h-3.5 w-3.5" />
                  定期支出として保存（次回からワンクリック登録）
                </label>
                {saveAsTemplate && (
                  <Input
                    placeholder="テンプレート名（例: Adobe CC, AWS）"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormDialogOpen(false)}
              disabled={submitting}
            >
              キャンセル
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? "処理中..."
                : editingTransaction
                  ? "更新する"
                  : "登録する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeletingTransaction(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>取引の削除</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              この取引を削除してもよろしいですか？
            </p>
            {deletingTransaction && (
              <div className="mt-3 rounded-md bg-muted p-3 text-sm space-y-1">
                <p>
                  <span className="font-medium">日付:</span>{" "}
                  {deletingTransaction.date}
                </p>
                <p>
                  <span className="font-medium">種別:</span>{" "}
                  {deletingTransaction.type === "income" ? "売上" : "経費"}
                </p>
                <p>
                  <span className="font-medium">金額:</span> ¥
                  {deletingTransaction.amount.toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={submitting}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={submitting}
            >
              {submitting ? "削除中..." : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
