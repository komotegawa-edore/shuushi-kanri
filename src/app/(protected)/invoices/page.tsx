"use client";

import { useState, useCallback } from "react";
import { useInvoices } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { useAuth } from "@/contexts/AuthContext";
import { Invoice, InvoiceItem, InvoiceStatus } from "@/types";
import { getUserProfile } from "@/lib/firestore";
import { generateInvoicePDF } from "@/lib/pdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Pencil,
  Trash2,
  Download,
  MoreHorizontal,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<
  InvoiceStatus,
  { label: string; variant: "secondary" | "default" | "outline" }
> = {
  draft: { label: "下書き", variant: "secondary" },
  sent: { label: "送付済", variant: "default" },
  paid: { label: "入金済", variant: "outline" },
};

const emptyItem: InvoiceItem = {
  description: "",
  quantity: 1,
  unitPrice: 0,
  amount: 0,
};

type InvoiceFormData = {
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  taxRate: number;
  notes: string;
  status: InvoiceStatus;
};

const getEmptyForm = (): InvoiceFormData => ({
  clientId: "",
  clientName: "",
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10),
  items: [{ ...emptyItem }],
  taxRate: 10,
  notes: "",
  status: "draft",
});

function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

export default function InvoicesPage() {
  const { user } = useAuth();
  const { invoices, loading, add, update, remove } = useInvoices();
  const { clients } = useClients();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState<InvoiceFormData>(getEmptyForm());
  const [submitting, setSubmitting] = useState(false);

  // Calculate totals from items
  const calculateTotals = useCallback(
    (items: InvoiceItem[], taxRate: number) => {
      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = Math.floor(subtotal * (taxRate / 100));
      const total = subtotal + taxAmount;
      return { subtotal, taxAmount, total };
    },
    []
  );

  const { subtotal, taxAmount, total } = calculateTotals(
    form.items,
    form.taxRate
  );

  const openAddDialog = () => {
    setEditingInvoice(null);
    setForm(getEmptyForm());
    setDialogOpen(true);
  };

  const openEditDialog = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setForm({
      clientId: invoice.clientId,
      clientName: invoice.clientName,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      items: invoice.items.length > 0 ? [...invoice.items] : [{ ...emptyItem }],
      taxRate: invoice.taxRate,
      notes: invoice.notes,
      status: invoice.status,
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (invoice: Invoice) => {
    setDeletingInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  // Line item handlers
  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setForm((prev) => {
      const newItems = [...prev.items];
      const item = { ...newItems[index] };

      if (field === "description") {
        item.description = value as string;
      } else if (field === "quantity") {
        item.quantity = Number(value) || 0;
        item.amount = item.quantity * item.unitPrice;
      } else if (field === "unitPrice") {
        item.unitPrice = Number(value) || 0;
        item.amount = item.quantity * item.unitPrice;
      }

      newItems[index] = item;
      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...emptyItem }],
    }));
  };

  const removeItem = (index: number) => {
    setForm((prev) => {
      if (prev.items.length <= 1) return prev;
      const newItems = prev.items.filter((_, i) => i !== index);
      return { ...prev, items: newItems };
    });
  };

  const handleClientChange = (clientId: string | null) => {
    if (!clientId) return;
    const client = clients.find((c) => c.id === clientId);
    setForm((prev) => ({
      ...prev,
      clientId,
      clientName: client?.name || "",
    }));
  };

  const handleSubmit = async () => {
    if (!form.clientId) {
      toast.error("取引先を選択してください");
      return;
    }
    if (!form.issueDate) {
      toast.error("発行日を入力してください");
      return;
    }
    if (!form.dueDate) {
      toast.error("支払期限を入力してください");
      return;
    }
    if (form.items.some((item) => !item.description.trim())) {
      toast.error("明細の内容を入力してください");
      return;
    }

    setSubmitting(true);
    try {
      const { subtotal: s, taxAmount: ta, total: t } = calculateTotals(
        form.items,
        form.taxRate
      );

      const invoiceData = {
        clientId: form.clientId,
        clientName: form.clientName,
        issueDate: form.issueDate,
        dueDate: form.dueDate,
        items: form.items,
        subtotal: s,
        taxRate: form.taxRate,
        taxAmount: ta,
        total: t,
        status: form.status,
        notes: form.notes,
      };

      if (editingInvoice) {
        await update(editingInvoice.id, invoiceData);
        toast.success("請求書を更新しました");
      } else {
        await add(invoiceData);
        toast.success("請求書を作成しました");
      }
      setDialogOpen(false);
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingInvoice) return;

    setSubmitting(true);
    try {
      await remove(deletingInvoice.id);
      toast.success("請求書を削除しました");
      setDeleteDialogOpen(false);
    } catch {
      toast.error("削除に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (
    invoice: Invoice,
    newStatus: InvoiceStatus
  ) => {
    try {
      await update(invoice.id, { status: newStatus });
      toast.success(
        `ステータスを「${statusConfig[newStatus].label}」に変更しました`
      );
    } catch {
      toast.error("ステータスの変更に失敗しました");
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const profile = user ? await getUserProfile(user.uid) : null;
      await generateInvoicePDF(invoice, profile);
      toast.success("PDFをダウンロードしました");
    } catch {
      toast.error("PDFの生成に失敗しました");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">請求書管理</h1>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-1" />
          新規作成
        </Button>
      </div>

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>請求書がありません</p>
          <p className="text-sm mt-1">
            「新規作成」ボタンから請求書を作成してください
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>請求書番号</TableHead>
                  <TableHead>取引先</TableHead>
                  <TableHead>発行日</TableHead>
                  <TableHead>支払期限</TableHead>
                  <TableHead className="text-right">合計金額</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>{invoice.issueDate}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(invoice.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[invoice.status].variant}>
                        {statusConfig[invoice.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" />
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditDialog(invoice)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            編集
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownloadPDF(invoice)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            PDFダウンロード
                          </DropdownMenuItem>
                          {invoice.status === "draft" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(invoice, "sent")
                              }
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              送付済にする
                            </DropdownMenuItem>
                          )}
                          {invoice.status === "sent" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(invoice, "paid")
                              }
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              入金済にする
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => openDeleteDialog(invoice)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInvoice ? "請求書を編集" : "請求書を作成"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Client Select */}
            <div className="space-y-2">
              <Label>取引先 *</Label>
              <Select
                value={form.clientId}
                onValueChange={handleClientChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="取引先を選択" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id} label={client.name}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate">発行日 *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={form.issueDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      issueDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">支払期限 *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>明細行</Label>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  行を追加
                </Button>
              </div>
              <div className="space-y-2">
                {/* Header row */}
                <div className="grid grid-cols-[1fr_80px_100px_100px_32px] gap-2 text-xs font-medium text-muted-foreground px-1">
                  <span>内容</span>
                  <span>数量</span>
                  <span>単価</span>
                  <span>金額</span>
                  <span />
                </div>
                {form.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_80px_100px_100px_32px] gap-2 items-center"
                  >
                    <Input
                      placeholder="内容"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      min="0"
                      placeholder="数量"
                      value={item.quantity || ""}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      min="0"
                      placeholder="単価"
                      value={item.unitPrice || ""}
                      onChange={(e) =>
                        updateItem(index, "unitPrice", e.target.value)
                      }
                    />
                    <div className="text-sm text-right pr-2 tabular-nums">
                      {formatCurrency(item.amount)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeItem(index)}
                      disabled={form.items.length <= 1}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Rate */}
            <div className="space-y-2">
              <Label htmlFor="taxRate">税率（%）</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                className="w-24"
                value={form.taxRate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    taxRate: Number(e.target.value) || 0,
                  }))
                }
              />
            </div>

            {/* Totals */}
            <div className="rounded-lg border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">小計</span>
                <span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  消費税（{form.taxRate}%）
                </span>
                <span className="tabular-nums">
                  {formatCurrency(taxAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold text-base">
                <span>合計</span>
                <span className="tabular-nums">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">備考</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="備考があれば入力してください"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              キャンセル
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? "保存中..."
                : editingInvoice
                  ? "更新"
                  : "作成"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>請求書の削除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            請求書「{deletingInvoice?.invoiceNumber}」を削除しますか？この操作は取り消せません。
          </p>
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
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? "削除中..." : "削除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
