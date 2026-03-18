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
