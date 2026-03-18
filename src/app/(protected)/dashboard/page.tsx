"use client";

import { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
} from "date-fns";
import { TrendingUp, TrendingDown, Wallet, Receipt, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user } = useAuth();

  const now = new Date();
  const currentMonthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const currentMonthEnd = format(endOfMonth(now), "yyyy-MM-dd");
  const prevMonth = subMonths(now, 1);
  const prevMonthStart = format(startOfMonth(prevMonth), "yyyy-MM-dd");
  const prevMonthEnd = format(endOfMonth(prevMonth), "yyyy-MM-dd");
  const yearStart = format(startOfYear(now), "yyyy-MM-dd");
  const yearEnd = format(endOfYear(now), "yyyy-MM-dd");

  const { transactions: currentTransactions, loading: currentLoading } =
    useTransactions({
      startDate: currentMonthStart,
      endDate: currentMonthEnd,
    });

  const { transactions: prevTransactions, loading: prevLoading } =
    useTransactions({
      startDate: prevMonthStart,
      endDate: prevMonthEnd,
    });

  const { transactions: yearTransactions, loading: yearLoading } =
    useTransactions({
      startDate: yearStart,
      endDate: yearEnd,
    });

  const summary = useMemo(() => {
    const currentIncome = currentTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const currentExpense = currentTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const currentProfit = currentIncome - currentExpense;

    const prevIncome = prevTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const prevExpense = prevTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const prevProfit = prevIncome - prevExpense;

    const profitChange =
      prevProfit !== 0
        ? ((currentProfit - prevProfit) / Math.abs(prevProfit)) * 100
        : currentProfit > 0
          ? 100
          : 0;

    return {
      income: currentIncome,
      expense: currentExpense,
      profit: currentProfit,
      profitChange,
    };
  }, [currentTransactions, prevTransactions]);

  const yearSummary = useMemo(() => {
    const income = yearTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = yearTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, profit: income - expense };
  }, [yearTransactions]);

  const recentTransactions = useMemo(() => {
    return [...yearTransactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);
  }, [yearTransactions]);

  const loading = currentLoading || prevLoading || yearLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      {/* Monthly Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月の売上</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{summary.income.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月の経費</CardTitle>
            <Receipt className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{summary.expense.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月の利益</CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{summary.profit.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">前月比</CardTitle>
            {summary.profitChange >= 0 ? (
              <TrendingUp className="size-4 text-green-600" />
            ) : (
              <TrendingDown className="size-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.profitChange >= 0 ? "+" : ""}
              {summary.profitChange.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Annual Summary Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          <Calendar className="size-4 inline mr-2" />
          {now.getFullYear()}年 年間サマリー
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">年間売上</CardTitle>
              <TrendingUp className="size-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ¥{yearSummary.income.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">年間経費</CardTitle>
              <Receipt className="size-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ¥{yearSummary.expense.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">年間利益</CardTitle>
              <Wallet className="size-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${yearSummary.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                ¥{yearSummary.profit.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>最近の取引</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              取引はまだありません
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
                {recentTransactions.map((transaction) => (
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
                    <TableCell className="text-right">
                      ¥{transaction.amount.toLocaleString()}
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
