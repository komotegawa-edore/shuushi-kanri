"use client";

import { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/contexts/AuthContext";
import { Transaction } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type TransactionType = "income" | "expense";
type FilterType = "all" | TransactionType;

interface FormData {
  type: TransactionType;
  date: string;
  categoryId: string;
  amount: string;
  description: string;
  client: string;
}

const initialFormData: FormData = {
  type: "income",
  date: new Date().toISOString().split("T")[0],
  categoryId: "",
  amount: "",
  description: "",
  client: "",
};

export default function TransactionsPage() {
  const { user } = useAuth();

  // Filter state
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Build filters for the hook
  const filters = useMemo(() => {
    const f: { type?: TransactionType; startDate?: string; endDate?: string } =
      {};
    if (filterType !== "all") f.type = filterType;
    if (startDate) f.startDate = startDate;
    if (endDate) f.endDate = endDate;
    return f;
  }, [filterType, startDate, endDate]);

  const { transactions, loading, add, update, remove } =
    useTransactions(filters);
  const {
    categories,
    incomeCategories,
    expenseCategories,
    loading: categoriesLoading,
  } = useCategories();

  // Dialog state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // Filtered categories based on selected type in form
  const filteredCategories =
    formData.type === "income" ? incomeCategories : expenseCategories;

  // Open dialog for new transaction
  const handleNewTransaction = () => {
    setEditingTransaction(null);
    setFormData(initialFormData);
    setFormDialogOpen(true);
  };

  // Open dialog for editing
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      date: transaction.date,
      categoryId: transaction.categoryId,
      amount: String(transaction.amount),
      description: transaction.description,
      client: transaction.client ?? "",
    });
    setFormDialogOpen(true);
  };

  // Open delete confirmation
  const handleDeleteClick = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  // Submit form (add or update)
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
        type: formData.type,
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
        toast.success("取引を登録しました");
      }

      setFormDialogOpen(false);
      setFormData(initialFormData);
      setEditingTransaction(null);
    } catch {
      toast.error("エラーが発生しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;
    setSubmitting(true);
    try {
      await remove(deletingTransaction.id);
      toast.success("取引を削除しました");
      setDeleteDialogOpen(false);
      setDeletingTransaction(null);
    } catch {
      toast.error("削除に失敗しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle type change in form - reset categoryId when type changes
  const handleFormTypeChange = (type: TransactionType) => {
    setFormData((prev) => ({ ...prev, type, categoryId: "" }));
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">取引記録</h1>
        <Button onClick={handleNewTransaction}>
          <Plus className="mr-1.5 h-4 w-4" />
          新規登録
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <Label>種別</Label>
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value as FilterType)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="全て" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" label="全て">全て</SelectItem>
                  <SelectItem value="income" label="売上">売上</SelectItem>
                  <SelectItem value="expense" label="経費">経費</SelectItem>
                </SelectContent>
              </Select>
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
                フィルターをリセット
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
              取引データがありません。「新規登録」ボタンから取引を追加してください。
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日付</TableHead>
                  <TableHead>種別</TableHead>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead className="text-right">金額</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      {transaction.type === "income" ? (
                        <Badge variant="default">売上</Badge>
                      ) : (
                        <Badge variant="destructive">経費</Badge>
                      )}
                    </TableCell>
                    <TableCell>{transaction.categoryName}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {transaction.type === "income" ? (
                        <span className="text-blue-600 dark:text-blue-400">
                          ¥{transaction.amount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">
                          -¥{transaction.amount.toLocaleString()}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">編集</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteClick(transaction)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">削除</span>
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

      {/* Add/Edit Dialog */}
      <Dialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          setFormDialogOpen(open);
          if (!open) {
            setEditingTransaction(null);
            setFormData(initialFormData);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "取引を編集" : "新規取引登録"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* 種別 */}
            <div className="space-y-2">
              <Label>種別</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  handleFormTypeChange(value as TransactionType)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income" label="売上">売上</SelectItem>
                  <SelectItem value="expense" label="経費">経費</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            {/* カテゴリ */}
            <div className="space-y-2">
              <Label>カテゴリ</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: value as string,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id} label={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            {/* 取引先名 */}
            <div className="space-y-2">
              <Label>取引先名（任意）</Label>
              <Input
                placeholder="取引先名を入力"
                value={formData.client}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, client: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" disabled={submitting}>
                  キャンセル
                </Button>
              }
            />
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
              この取引を削除してもよろしいですか？この操作は取り消せません。
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
                {deletingTransaction.description && (
                  <p>
                    <span className="font-medium">説明:</span>{" "}
                    {deletingTransaction.description}
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" disabled={submitting}>
                  キャンセル
                </Button>
              }
            />
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
