import { NextRequest, NextResponse } from "next/server";
import { verifySignature, replyMessage, textMessage, quickReplyMessage } from "@/lib/line";
import { handleTextMessage } from "@/lib/line-conversation";
import { removeLineLink, lookupByLineUserId } from "@/lib/firestore-admin";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-line-signature") || "";

  if (!verifySignature(body, signature)) {
    console.error("[webhook] signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const parsed = JSON.parse(body);
  const events = parsed.events || [];
  console.log("[webhook] events:", events.length);

  for (const event of events) {
    try {
      await handleEvent(event);
    } catch (err) {
      console.error("[webhook] event error:", err);
    }
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
  console.log("[webhook] event type:", event.type, "userId:", lineUserId, "message:", event.message);

  if (!lineUserId) return;

  if (event.type === "follow") {
    await replyMessage(event.replyToken!, [
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
    console.log("[webhook] handling text:", event.message.text);
    const result = await handleTextMessage(lineUserId, event.message.text!);
    console.log("[webhook] reply messages:", JSON.stringify(result.messages));
    await replyMessage(event.replyToken!, result.messages);
    return;
  }

  if (event.type === "message") {
    await replyMessage(event.replyToken!, [
      textMessage("テキストメッセージのみ対応しています。\n「ヘルプ」と送信すると使い方を確認できます。"),
    ]);
  }
}
