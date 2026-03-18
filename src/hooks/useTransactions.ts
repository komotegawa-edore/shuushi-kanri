"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Transaction } from "@/types";
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/firestore";

export function useTransactions(filters?: {
  type?: "income" | "expense";
  startDate?: string;
  endDate?: string;
}) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getTransactions(user.uid, filters);
      setTransactions(data);
    } finally {
      setLoading(false);
    }
  }, [user, filters?.type, filters?.startDate, filters?.endDate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const add = async (data: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => {
    if (!user) return;
    await addTransaction(user.uid, data);
    await fetch();
  };

  const update = async (id: string, data: Partial<Transaction>) => {
    if (!user) return;
    await updateTransaction(user.uid, id, data);
    await fetch();
  };

  const remove = async (id: string) => {
    if (!user) return;
    await deleteTransaction(user.uid, id);
    await fetch();
  };

  return { transactions, loading, add, update, remove, refresh: fetch };
}
