"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Category } from "@/types";
import {
  getCategories,
  addCategory,
  deleteCategory,
  initDefaultCategories,
} from "@/lib/firestore";

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      await initDefaultCategories(user.uid);
      const data = await getCategories(user.uid);
      setCategories(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const add = async (data: Omit<Category, "id" | "createdAt">) => {
    if (!user) return;
    await addCategory(user.uid, data);
    await fetch();
  };

  const remove = async (id: string) => {
    if (!user) return;
    await deleteCategory(user.uid, id);
    await fetch();
  };

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return { categories, incomeCategories, expenseCategories, loading, add, remove, refresh: fetch };
}
