"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Client } from "@/types";
import { getClients, addClient, updateClient, deleteClient } from "@/lib/firestore";

export function useClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getClients(user.uid);
      setClients(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const add = async (data: Omit<Client, "id" | "createdAt" | "updatedAt">) => {
    if (!user) return;
    await addClient(user.uid, data);
    await fetch();
  };

  const update = async (id: string, data: Partial<Client>) => {
    if (!user) return;
    await updateClient(user.uid, id, data);
    await fetch();
  };

  const remove = async (id: string) => {
    if (!user) return;
    await deleteClient(user.uid, id);
    await fetch();
  };

  return { clients, loading, add, update, remove, refresh: fetch };
}
