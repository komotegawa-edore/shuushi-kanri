import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { storeLinkingCode, isLinked } from "@/lib/firestore-admin";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  let uid: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // 既に連携済みか確認
  if (await isLinked(uid)) {
    return NextResponse.json(
      { error: "Already linked" },
      { status: 400 }
    );
  }

  // 6桁コード生成（衝突チェック付き）
  let code: string = "";
  let attempts = 0;
  do {
    code = String(Math.floor(100000 + Math.random() * 900000));
    const existing = await getAdminDb().collection("linkingCodes").doc(code).get();
    if (!existing.exists) break;
    attempts++;
  } while (attempts < 10);

  await storeLinkingCode(code, uid);

  return NextResponse.json({ code, expiresInSeconds: 600 });
}
