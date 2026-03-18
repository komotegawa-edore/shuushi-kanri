"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  addMonths,
} from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const MONTH_NAMES = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

export default function DashboardPage() {
  const { user } = useAuth();
  const now = new Date();

  // 選択中の年月
  const [selectedDate, setSelectedDate] = useState(now);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const selectedMonthStart = format(startOfMonth(selectedDate), "yyyy-MM-dd");
  const selectedMonthEnd = format(endOfMonth(selectedDate), "yyyy-MM-dd");
  const prevMonth = subMonths(selectedDate, 1);
  const prevMonthStart = format(startOfMonth(prevMonth), "yyyy-MM-dd");
  const prevMonthEnd = format(endOfMonth(prevMonth), "yyyy-MM-dd");
  const yearStart = format(startOfYear(new Date(selectedYear, 0, 1)), "yyyy-MM-dd");
  const yearEnd = format(endOfYear(new Date(selectedYear, 0, 1)), "yyyy-MM-dd");

  const isCurrentMonth =
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth();

  const { transactions: selectedTransactions, loading: selectedLoading } =
    useTransactions({ startDate: selectedMonthStart, endDate: selectedMonthEnd });

  const { transactions: prevTransactions, loading: prevLoading } =
    useTransactions({ startDate: prevMonthStart, endDate: prevMonthEnd });

  const { transactions: yearTransactions, loading: yearLoading } =
    useTransactions({ startDate: yearStart, endDate: yearEnd });

  // 年の選択肢（過去5年）
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let i = 0; i < 5; i++) years.push(now.getFullYear() - i);
    return years;
  }, []);

  // 月ナビゲーション
  const goToPrevMonth = () => setSelectedDate((d) => subMonths(d, 1));
  const goToNextMonth = () => {
    const next = addMonths(selectedDate, 1);
    if (next <= now) setSelectedDate(next);
  };
  const goToCurrentMonth = () => setSelectedDate(now);

  // 月次サマリー
  const summary = useMemo(() => {
    const income = selectedTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = selectedTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const profit = income - expense;

    const prevIncome = prevTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const prevExpense = prevTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const prevProfit = prevIncome - prevExpense;

    const profitChange =
      prevProfit !== 0
        ? ((profit - prevProfit) / Math.abs(prevProfit)) * 100
        : profit > 0
          ? 100
          : 0;

    return { income, expense, profit, profitChange };
  }, [selectedTransactions, prevTransactions]);

  // 年間サマリー
  const yearSummary = useMemo(() => {
    const income = yearTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = yearTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, profit: income - expense };
  }, [yearTransactions]);

  // 選択月の取引一覧
  const monthTransactions = useMemo(() => {
    return [...selectedTransactions].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  }, [selectedTransactions]);

  const loading = selectedLoading || prevLoading || yearLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const monthLabel = `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      {/* Month Navigator */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="icon" onClick={goToPrevMonth}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-lg font-semibold min-w-[140px] text-center">
          {monthLabel}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={goToNextMonth}
          disabled={isCurrentMonth}
        >
          <ChevronRight className="size-4" />
        </Button>
        {!isCurrentMonth && (
          <Button variant="ghost" size="sm" onClick={goToCurrentMonth}>
            今月に戻る
          </Button>
        )}
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">売上</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
              <TrendingUp className="size-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ¥{summary.income.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">経費</CardTitle>
            <div className="h-8 w-8 rounded-full bg-rose-50 flex items-center justify-center">
              <Receipt className="size-4 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              ¥{summary.expense.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">利益</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <Wallet className="size-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              ¥{summary.profit.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-sky-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">前月比</CardTitle>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${summary.profitChange >= 0 ? "bg-emerald-50" : "bg-rose-50"}`}>
              {summary.profitChange >= 0 ? (
                <TrendingUp className="size-4 text-emerald-500" />
              ) : (
                <TrendingDown className="size-4 text-rose-500" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.profitChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {summary.profitChange >= 0 ? "+" : ""}
              {summary.profitChange.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Annual Summary Cards */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="size-4 text-blue-500" />
          <h2 className="text-lg font-semibold">年間サマリー</h2>
          <Select
            value={selectedYear}
            onValueChange={(v) => {
              if (v != null) setSelectedYear(v as number);
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={y} label={`${y}年`}>
                  {y}年
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl p-4 bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-700/80">年間売上</p>
              <TrendingUp className="size-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              ¥{yearSummary.income.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl p-4 bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-rose-700/80">年間経費</p>
              <Receipt className="size-4 text-rose-500" />
            </div>
            <p className="text-2xl font-bold text-rose-600">
              ¥{yearSummary.expense.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-emerald-700/80">年間利益</p>
              <Wallet className="size-4 text-emerald-500" />
            </div>
            <p className={`text-2xl font-bold ${yearSummary.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              ¥{yearSummary.profit.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Month's Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>{monthLabel}の取引</CardTitle>
        </CardHeader>
        <CardContent>
          {monthTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              この月の取引はありません
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日付</TableHead>
                  <TableHead>種別</TableHead>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead>摘要</TableHead>
                  <TableHead className="text-right">金額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.type === "income"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {transaction.type === "income" ? "売上" : "経費"}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.categoryName}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={transaction.type === "income" ? "text-blue-600" : "text-rose-600"}>
                        {transaction.type === "expense" ? "-" : ""}¥{transaction.amount.toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
