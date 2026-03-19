import { NextRequest, NextResponse } from "next/server";
import { verifySignature, replyMessage, textMessage, quickReplyMessage } from "@/lib/line";
import { handleTextMessage } from "@/lib/line-conversation";
import { removeLineLink, lookupByLineUserId } from "@/lib/firestore-admin";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-line-signature") || "";

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const parsed = JSON.parse(body);
  const events = parsed.events || [];

  for (const event of events) {
    await handleEvent(event);
  }

  return NextResponse.json({ ok: true });
}

async function handleEvent(event: {
  type: string;
  replyToken?: string;
  source?: { userId?: string };
  message?: { type: string; text?: string };
}) {
  const lineUserId = event.source?.userId;
  if (!lineUserId || !event.replyToken) return;

  try {
    if (event.type === "follow") {
      await replyMessage(event.replyToken, [
        quickReplyMessage(
          "スットへようこそ!\n\nLINEから経費・売上を簡単に記録できます。\n\nまずはWebアプリの設定ページからアカウントを連携してください。\n連携コード（6桁の数字）をこちらに送信すると連携できます。",
          [{ label: "ヘルプ", text: "ヘルプ" }]
        ),
      ]);
      return;
    }

    if (event.type === "unfollow") {
      const userId = await lookupByLineUserId(lineUserId);
      if (userId) {
        await removeLineLink(userId);
      }
      return;
    }

    if (event.type === "message" && event.message?.type === "text") {
      const result = await handleTextMessage(lineUserId, event.message.text!);
      await replyMessage(event.replyToken, result.messages);
      return;
    }

    if (event.type === "message") {
      await replyMessage(event.replyToken, [
        textMessage("テキストメッセージのみ対応しています。\n「ヘルプ」と送信すると使い方を確認できます。"),
      ]);
    }
  } catch (err) {
    // エラー内容をLINEに返して確認できるようにする
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[webhook] error:", errorMsg);
    try {
      await replyMessage(event.replyToken, [
        textMessage(`[デバッグ] エラーが発生しました:\n${errorMsg}`),
      ]);
    } catch {
      // reply自体が失敗した場合は無視
    }
  }
}
