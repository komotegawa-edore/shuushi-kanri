import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  displayName: string;
  businessName: string; // 屋号
  address: string;
  phone: string;
  email: string;
  bankInfo: string; // 振込先情報
  invoiceNumber: string; // 登録番号（インボイス）
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Transaction {
  id: string;
  type: "income" | "expense"; // 売上 or 経費
  date: string; // YYYY-MM-DD
  amount: number;
  categoryId: string;
  categoryName: string;
  description: string;
  client?: string; // 取引先名
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  isDefault: boolean;
  createdAt: Timestamp;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export type InvoiceStatus = "draft" | "sent" | "paid";

export interface Invoice {
  id: string;
  invoiceNumber: string; // 請求書番号
  clientId: string;
  clientName: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: InvoiceStatus;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ExpenseTemplate {
  id: string;
  name: string; // テンプレート名（例: "Adobe CC", "AWS"）
  amount: number;
  categoryId: string;
  categoryName: string;
  description: string;
  client: string;
  createdAt: Timestamp;
}

export const DEFAULT_EXPENSE_CATEGORIES = [
  "旅費交通費",
  "通信費",
  "消耗品費",
  "接待交際費",
  "地代家賃",
  "水道光熱費",
  "広告宣伝費",
  "外注費",
  "雑費",
  "新聞図書費",
  "減価償却費",
  "租税公課",
];

export const DEFAULT_INCOME_CATEGORIES = [
  "売上高",
  "業務委託収入",
  "その他収入",
];

// ---- LINE連携 ----
export interface LineLink {
  lineUserId: string;
  linkedAt: string; // ISO 8601
}

export interface LineUserMapping {
  userId: string;
  linkedAt: string;
}

export interface LinkingCode {
  userId: string;
  expiresAt: number; // Unix ms
  createdAt: number;
}

export type ConversationStep =
  | "IDLE"
  | "AWAITING_CATEGORY"
  | "AWAITING_AMOUNT"
  | "AWAITING_DESCRIPTION"
  | "CONFIRMING";

export interface LineConversationState {
  state: ConversationStep;
  data: {
    type?: "income" | "expense";
    categoryId?: string;
    categoryName?: string;
    amount?: number;
    description?: string;
  };
  updatedAt: number; // Unix ms
}

// ---- Gamification ----
export interface UserStats {
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  currentStreak: number; // 連続記録日数
  longestStreak: number;
  lastRecordDate: string; // YYYY-MM-DD
  level: number;
  exp: number;
  achievements: string[]; // 獲得済みの実績ID
  monthlyGoal: number; // 月間記録目標数
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: UserStats, monthlyCount: number) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_record", name: "はじめの一歩", description: "最初の取引を記録した", icon: "🎉", condition: (s) => s.totalTransactions >= 1 },
  { id: "records_10", name: "コツコツ記録", description: "10件の取引を記録した", icon: "📝", condition: (s) => s.totalTransactions >= 10 },
  { id: "records_50", name: "記録の達人", description: "50件の取引を記録した", icon: "🏅", condition: (s) => s.totalTransactions >= 50 },
  { id: "records_100", name: "記録マスター", description: "100件の取引を記録した", icon: "👑", condition: (s) => s.totalTransactions >= 100 },
  { id: "streak_3", name: "3日連続", description: "3日連続で記録した", icon: "🔥", condition: (s) => s.currentStreak >= 3 },
  { id: "streak_7", name: "1週間継続", description: "7日連続で記録した", icon: "⚡", condition: (s) => s.currentStreak >= 7 },
  { id: "streak_30", name: "1ヶ月継続", description: "30日連続で記録した", icon: "💎", condition: (s) => s.currentStreak >= 30 },
  { id: "income_100k", name: "売上10万円突破", description: "累計売上が10万円を超えた", icon: "💰", condition: (s) => s.totalIncome >= 100000 },
  { id: "income_1m", name: "売上100万円突破", description: "累計売上が100万円を超えた", icon: "🚀", condition: (s) => s.totalIncome >= 1000000 },
  { id: "monthly_goal", name: "月間目標達成", description: "月間記録目標を達成した", icon: "🎯", condition: (s, mc) => s.monthlyGoal > 0 && mc >= s.monthlyGoal },
  { id: "level_5", name: "レベル5到達", description: "レベル5に到達した", icon: "⭐", condition: (s) => s.level >= 5 },
  { id: "level_10", name: "レベル10到達", description: "レベル10に到達した", icon: "🌟", condition: (s) => s.level >= 10 },
];

// 経験値計算
export const EXP_PER_RECORD = 10;
export const EXP_STREAK_BONUS = 5; // ストリーク1日あたりのボーナス
export function expForLevel(level: number): number {
  return level * 100; // レベルアップに必要な累計経験値
}
export function getLevelFromExp(exp: number): number {
  let level = 1;
  let totalNeeded = 0;
  while (true) {
    totalNeeded += level * 100;
    if (exp < totalNeeded) return level;
    level++;
  }
}
export function getExpProgress(exp: number): { level: number; currentExp: number; nextLevelExp: number } {
  let level = 1;
  let consumed = 0;
  while (true) {
    const needed = level * 100;
    if (exp < consumed + needed) {
      return { level, currentExp: exp - consumed, nextLevelExp: needed };
    }
    consumed += needed;
    level++;
  }
}
