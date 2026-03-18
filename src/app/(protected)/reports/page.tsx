"use client";

import { useState, useMemo } from "react";
import { format, startOfYear, endOfYear } from "date-fns";
import { useTransactions } from "@/hooks/useTransactions";
import { Transaction } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#6366f1",
];

const MONTHS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

export default function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const yearStart = format(startOfYear(new Date(selectedYear, 0, 1)), "yyyy-MM-dd");
  const yearEnd = format(endOfYear(new Date(selectedYear, 0, 1)), "yyyy-MM-dd");

  const { transactions, loading } = useTransactions({
    startDate: yearStart,
    endDate: yearEnd,
  });

  // Year options (current year and 4 previous years)
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  }, [currentYear]);

  // Monthly data for bar chart and summary table
  const monthlyData = useMemo(() => {
    const data = MONTHS.map((month, index) => {
      const monthStr = String(index + 1).padStart(2, "0");
      const prefix = `${selectedYear}-${monthStr}`;

      const monthTransactions = transactions.filter((t) =>
        t.date.startsWith(prefix)
      );

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month,
        売上: income,
        経費: expense,
        利益: income - expense,
      };
    });

    return data;
  }, [transactions, selectedYear]);

  // Category data for pie charts
  const categoryData = useMemo(() => {
    const incomeByCategory = new Map<string, number>();
    const expenseByCategory = new Map<string, number>();

    transactions.forEach((t) => {
      const map = t.type === "income" ? incomeByCategory : expenseByCategory;
      const current = map.get(t.categoryName) || 0;
      map.set(t.categoryName, current + t.amount);
    });

    const incomeData = Array.from(incomeByCategory.entries()).map(
      ([name, value]) => ({ name, value })
    );
    const expenseData = Array.from(expenseByCategory.entries()).map(
      ([name, value]) => ({ name, value })
    );

    return { incomeData, expenseData };
  }, [transactions]);

  // Annual totals
  const annualTotals = useMemo(() => {
    const totalIncome = monthlyData.reduce((sum, d) => sum + d.売上, 0);
    const totalExpense = monthlyData.reduce((sum, d) => sum + d.経費, 0);
    const totalProfit = totalIncome - totalExpense;
    return { totalIncome, totalExpense, totalProfit };
  }, [monthlyData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">レポート</h1>
        <Select
          value={selectedYear}
          onValueChange={(value) => {
            if (value != null) {
              setSelectedYear(value as number);
            }
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year} label={`${year}年`}>
                {year}年
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="monthly">月次推移</TabsTrigger>
          <TabsTrigger value="category">カテゴリ別</TabsTrigger>
          <TabsTrigger value="annual">年間サマリー</TabsTrigger>
        </TabsList>

        {/* Tab 1: 月次推移 */}
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>{selectedYear}年 月次推移</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      tickFormatter={(value: number) =>
                        `¥${(value / 10000).toFixed(0)}万`
                      }
                    />
                    <Tooltip
                      formatter={(value) => [
                        `¥${Number(value).toLocaleString()}`,
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="売上" fill="#2563eb" />
                    <Bar dataKey="経費" fill="#ea580c" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: カテゴリ別 */}
        <TabsContent value="category">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>売上カテゴリ</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.incomeData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    データがありません
                  </p>
                ) : (
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <PieChart>
                        <Pie
                          data={categoryData.incomeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          nameKey="name"
                          label={(props: PieLabelRenderProps) =>
                            `${props.name} ${((props.percent ?? 0) * 100).toFixed(0)}%`
                          }
                        >
                          {categoryData.incomeData.map((_, index) => (
                            <Cell
                              key={`income-cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            `¥${Number(value).toLocaleString()}`,
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>経費カテゴリ</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.expenseData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    データがありません
                  </p>
                ) : (
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <PieChart>
                        <Pie
                          data={categoryData.expenseData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          nameKey="name"
                          label={(props: PieLabelRenderProps) =>
                            `${props.name} ${((props.percent ?? 0) * 100).toFixed(0)}%`
                          }
                        >
                          {categoryData.expenseData.map((_, index) => (
                            <Cell
                              key={`expense-cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            `¥${Number(value).toLocaleString()}`,
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: 年間サマリー */}
        <TabsContent value="annual">
          <Card>
            <CardHeader>
              <CardTitle>{selectedYear}年 年間サマリー</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>月</TableHead>
                    <TableHead className="text-right">売上</TableHead>
                    <TableHead className="text-right">経費</TableHead>
                    <TableHead className="text-right">利益</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell>{row.month}</TableCell>
                      <TableCell className="text-right">
                        ¥{row.売上.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ¥{row.経費.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ¥{row.利益.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold border-t-2">
                    <TableCell>合計</TableCell>
                    <TableCell className="text-right">
                      ¥{annualTotals.totalIncome.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ¥{annualTotals.totalExpense.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ¥{annualTotals.totalProfit.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
