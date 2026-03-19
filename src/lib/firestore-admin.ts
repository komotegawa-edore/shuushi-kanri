import { getAdminDb } from "./firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import type {
  LineUserMapping,
  LinkingCode,
  LineConversationState,
  Category,
} from "@/types";

// ---- アカウント連携 ----

export async function storeLinkingCode(
  code: string,
  userId: string
): Promise<void> {
  const data: LinkingCode = {
    userId,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10分
    createdAt: Date.now(),
  };
  await getAdminDb().collection("linkingCodes").doc(code).set(data);
}

export async function lookupByLinkingCode(
  code: string
): Promise<LinkingCode | null> {
  const snap = await getAdminDb().collection("linkingCodes").doc(code).get();
  if (!snap.exists) return null;
  const data = snap.data() as LinkingCode;
  if (Date.now() > data.expiresAt) {
    await getAdminDb().collection("linkingCodes").doc(code).delete();
    return null;
  }
  return data;
}

export async function saveLineLink(
  userId: string,
  lineUserId: string
): Promise<void> {
  const now = new Date().toISOString();
  const batch = getAdminDb().batch();

  // users/{userId} に lineLink フィールドを追加
  batch.set(
    getAdminDb().collection("users").doc(userId),
    { lineLink: { lineUserId, linkedAt: now } },
    { merge: true }
  );

  // lineUsers/{lineUserId} 逆引き
  batch.set(getAdminDb().collection("lineUsers").doc(lineUserId), {
    userId,
    linkedAt: now,
  } satisfies LineUserMapping);

  await batch.commit();
}

export async function removeLineLink(userId: string): Promise<void> {
  // まず現在の lineLink を取得
  const userSnap = await getAdminDb().collection("users").doc(userId).get();
  const lineLink = userSnap.data()?.lineLink;
  if (!lineLink) return;

  const batch = getAdminDb().batch();
  batch.update(getAdminDb().collection("users").doc(userId), {
    lineLink: FieldValue.delete(),
  });
  if (lineLink.lineUserId) {
    batch.delete(getAdminDb().collection("lineUsers").doc(lineLink.lineUserId));
    // 会話状態もクリア
    batch.delete(
      getAdminDb().collection("lineConversations").doc(lineLink.lineUserId)
    );
  }
  await batch.commit();
}

export async function lookupByLineUserId(
  lineUserId: string
): Promise<string | null> {
  const snap = await getAdminDb().collection("lineUsers").doc(lineUserId).get();
  if (!snap.exists) return null;
  return (snap.data() as LineUserMapping).userId;
}

export async function isLinked(userId: string): Promise<boolean> {
  const snap = await getAdminDb().collection("users").doc(userId).get();
  return !!snap.data()?.lineLink;
}

// ---- リンクコード消去 ----
export async function deleteLinkingCode(code: string): Promise<void> {
  await getAdminDb().collection("linkingCodes").doc(code).delete();
}

// ---- カテゴリ取得 ----
export async function getCategories(userId: string): Promise<Category[]> {
  const snap = await getAdminDb()
    .collection("users")
    .doc(userId)
    .collection("categories")
    .orderBy("name")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
}

// ---- 取引登録 ----
export async function addTransaction(
  userId: string,
  data: {
    type: "income" | "expense";
    date: string;
    amount: number;
    categoryId: string;
    categoryName: string;
    description: string;
  }
): Promise<string> {
  const ref = await getAdminDb()
    .collection("users")
    .doc(userId)
    .collection("transactions")
    .add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  return ref.id;
}

// ---- 会話状態 ----
const CONVERSATION_TIMEOUT = 5 * 60 * 1000; // 5分

export async function getConversationState(
  lineUserId: string
): Promise<LineConversationState> {
  const snap = await getAdminDb()
    .collection("lineConversations")
    .doc(lineUserId)
    .get();
  if (!snap.exists) {
    return { state: "IDLE", data: {}, updatedAt: Date.now() };
  }
  const state = snap.data() as LineConversationState;
  // 5分経過していたらリセット
  if (Date.now() - state.updatedAt > CONVERSATION_TIMEOUT) {
    return { state: "IDLE", data: {}, updatedAt: Date.now() };
  }
  return state;
}

export async function setConversationState(
  lineUserId: string,
  state: LineConversationState
): Promise<void> {
  await getAdminDb()
    .collection("lineConversations")
    .doc(lineUserId)
    .set({ ...state, updatedAt: Date.now() });
}

export async function resetConversation(lineUserId: string): Promise<void> {
  await getAdminDb().collection("lineConversations").doc(lineUserId).delete();
}
