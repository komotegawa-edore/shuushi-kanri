import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  orderBy,
  where,
  Timestamp,
  runTransaction,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  Transaction,
  Category,
  Client,
  Invoice,
  UserProfile,
  ExpenseTemplate,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from "@/types";

// ---- User Profile ----
export function userRef(userId: string) {
  return doc(db, "users", userId);
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(userRef(userId));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function saveUserProfile(userId: string, data: Partial<UserProfile>) {
  await setDoc(userRef(userId), { ...data, updatedAt: Timestamp.now() }, { merge: true });
}

// ---- Transactions ----
function transactionsCol(userId: string) {
  return collection(db, "users", userId, "transactions");
}

export async function getTransactions(
  userId: string,
  filters?: { type?: "income" | "expense"; startDate?: string; endDate?: string }
) {
  const q = query(transactionsCol(userId), orderBy("date", "desc"));
  const snap = await getDocs(q);
  let results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
  if (filters?.type) {
    results = results.filter((t) => t.type === filters.type);
  }
  if (filters?.startDate) {
    results = results.filter((t) => t.date >= filters.startDate!);
  }
  if (filters?.endDate) {
    results = results.filter((t) => t.date <= filters.endDate!);
  }
  return results;
}

export async function addTransaction(userId: string, data: Omit<Transaction, "id" | "createdAt" | "updatedAt">) {
  const ref = await addDoc(transactionsCol(userId), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateTransaction(userId: string, id: string, data: Partial<Transaction>) {
  await updateDoc(doc(transactionsCol(userId), id), { ...data, updatedAt: Timestamp.now() });
}

export async function deleteTransaction(userId: string, id: string) {
  await deleteDoc(doc(transactionsCol(userId), id));
}

// ---- Categories ----
function categoriesCol(userId: string) {
  return collection(db, "users", userId, "categories");
}

export async function getCategories(userId: string) {
  const snap = await getDocs(query(categoriesCol(userId), orderBy("name")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function addCategory(userId: string, data: Omit<Category, "id" | "createdAt">) {
  const ref = await addDoc(categoriesCol(userId), { ...data, createdAt: Timestamp.now() });
  return ref.id;
}

export async function deleteCategory(userId: string, id: string) {
  await deleteDoc(doc(categoriesCol(userId), id));
}

export async function initDefaultCategories(userId: string) {
  const existing = await getCategories(userId);
  if (existing.length > 0) return;

  const promises: Promise<string>[] = [];
  for (const name of DEFAULT_EXPENSE_CATEGORIES) {
    promises.push(addCategory(userId, { name, type: "expense", isDefault: true }));
  }
  for (const name of DEFAULT_INCOME_CATEGORIES) {
    promises.push(addCategory(userId, { name, type: "income", isDefault: true }));
  }
  await Promise.all(promises);
}

// ---- Clients ----
function clientsCol(userId: string) {
  return collection(db, "users", userId, "clients");
}

export async function getClients(userId: string) {
  const snap = await getDocs(query(clientsCol(userId), orderBy("name")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Client));
}

export async function addClient(userId: string, data: Omit<Client, "id" | "createdAt" | "updatedAt">) {
  const ref = await addDoc(clientsCol(userId), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateClient(userId: string, id: string, data: Partial<Client>) {
  await updateDoc(doc(clientsCol(userId), id), { ...data, updatedAt: Timestamp.now() });
}

export async function deleteClient(userId: string, id: string) {
  await deleteDoc(doc(clientsCol(userId), id));
}

// ---- Invoices ----
function invoicesCol(userId: string) {
  return collection(db, "users", userId, "invoices");
}

export async function getInvoices(userId: string) {
  const snap = await getDocs(query(invoicesCol(userId), orderBy("issueDate", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Invoice));
}

export async function getInvoice(userId: string, id: string) {
  const snap = await getDoc(doc(invoicesCol(userId), id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Invoice) : null;
}

export async function addInvoice(userId: string, data: Omit<Invoice, "id" | "createdAt" | "updatedAt" | "invoiceNumber">) {
  // 自動採番
  const counterRef = doc(db, "users", userId);
  const invoiceNumber = await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);
    const current = counterSnap.data()?.invoiceCounter || 0;
    const next = current + 1;
    transaction.update(counterRef, { invoiceCounter: increment(1) });
    return `INV-${String(next).padStart(5, "0")}`;
  });

  const ref = await addDoc(invoicesCol(userId), {
    ...data,
    invoiceNumber,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return { id: ref.id, invoiceNumber };
}

export async function updateInvoice(userId: string, id: string, data: Partial<Invoice>) {
  await updateDoc(doc(invoicesCol(userId), id), { ...data, updatedAt: Timestamp.now() });
}

export async function deleteInvoice(userId: string, id: string) {
  await deleteDoc(doc(invoicesCol(userId), id));
}

// ---- Expense Templates ----
function templatesCol(userId: string) {
  return collection(db, "users", userId, "expenseTemplates");
}

export async function getExpenseTemplates(userId: string) {
  const snap = await getDocs(query(templatesCol(userId), orderBy("name")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ExpenseTemplate));
}

export async function addExpenseTemplate(userId: string, data: Omit<ExpenseTemplate, "id" | "createdAt">) {
  const ref = await addDoc(templatesCol(userId), { ...data, createdAt: Timestamp.now() });
  return ref.id;
}

export async function deleteExpenseTemplate(userId: string, id: string) {
  await deleteDoc(doc(templatesCol(userId), id));
}

// ---- User Stats (Gamification) ----
import {
  UserStats,
  EXP_PER_RECORD,
  EXP_STREAK_BONUS,
  getLevelFromExp,
  ACHIEVEMENTS,
} from "@/types";

function statsRef(userId: string) {
  return doc(db, "users", userId, "meta", "stats");
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const snap = await getDoc(statsRef(userId));
  if (snap.exists()) return snap.data() as UserStats;
  const defaultStats: UserStats = {
    totalTransactions: 0,
    totalIncome: 0,
    totalExpense: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastRecordDate: "",
    level: 1,
    exp: 0,
    achievements: [],
    monthlyGoal: 20,
  };
  await setDoc(statsRef(userId), defaultStats);
  return defaultStats;
}

export async function recordTransaction(
  userId: string,
  type: "income" | "expense",
  amount: number,
  today: string
): Promise<{ stats: UserStats; newAchievements: string[]; leveledUp: boolean }> {
  const stats = await getUserStats(userId);
  const prevLevel = stats.level;

  // 取引数
  stats.totalTransactions += 1;
  if (type === "income") stats.totalIncome += amount;
  else stats.totalExpense += amount;

  // ストリーク計算
  if (stats.lastRecordDate === today) {
    // 同日は変更なし
  } else {
    const lastDate = stats.lastRecordDate ? new Date(stats.lastRecordDate) : null;
    const todayDate = new Date(today);
    if (lastDate) {
      const diffMs = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        stats.currentStreak += 1;
      } else if (diffDays > 1) {
        stats.currentStreak = 1;
      }
    } else {
      stats.currentStreak = 1;
    }
    stats.lastRecordDate = today;
  }
  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak;
  }

  // 経験値
  const streakBonus = Math.min(stats.currentStreak, 10) * EXP_STREAK_BONUS;
  stats.exp += EXP_PER_RECORD + streakBonus;
  stats.level = getLevelFromExp(stats.exp);
  const leveledUp = stats.level > prevLevel;

  // 月間件数を計算（実績チェック用）
  const yearMonth = today.substring(0, 7);
  const allTx = await getTransactions(userId, {
    startDate: `${yearMonth}-01`,
    endDate: `${yearMonth}-31`,
  });
  const monthlyCount = allTx.length;

  // 実績チェック
  const newAchievements: string[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (!stats.achievements.includes(ach.id) && ach.condition(stats, monthlyCount)) {
      stats.achievements.push(ach.id);
      newAchievements.push(ach.id);
    }
  }

  await setDoc(statsRef(userId), stats);
  return { stats, newAchievements, leveledUp };
}
