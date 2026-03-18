"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Invoice } from "@/types";
import { getInvoices, addInvoice, updateInvoice, deleteInvoice } from "@/lib/firestore";

export function useInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getInvoices(user.uid);
      setInvoices(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const add = async (data: Omit<Invoice, "id" | "createdAt" | "updatedAt" | "invoiceNumber">) => {
    if (!user) return;
    const result = await addInvoice(user.uid, data);
    await fetch();
    return result;
  };

  const update = async (id: string, data: Partial<Invoice>) => {
    if (!user) return;
    await updateInvoice(user.uid, id, data);
    await fetch();
  };

  const remove = async (id: string) => {
    if (!user) return;
    await deleteInvoice(user.uid, id);
    await fetch();
  };

  return { invoices, loading, add, update, remove, refresh: fetch };
}
