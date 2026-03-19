import crypto from "crypto";

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";

export function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac("SHA256", CHANNEL_SECRET)
    .update(body)
    .digest("base64");
  return hash === signature;
}

export interface LineMessage {
  type: "text";
  text: string;
  quickReply?: {
    items: QuickReplyItem[];
  };
}

interface QuickReplyItem {
  type: "action";
  action: {
    type: "message";
    label: string;
    text: string;
  };
}

export async function replyMessage(
  replyToken: string,
  messages: LineMessage[]
): Promise<void> {
  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("LINE reply failed:", res.status, text);
  }
}

export function textMessage(text: string): LineMessage {
  return { type: "text", text };
}

export function quickReplyMessage(
  text: string,
  options: { label: string; text: string }[]
): LineMessage {
  return {
    type: "text",
    text,
    quickReply: {
      items: options.map((opt) => ({
        type: "action",
        action: { type: "message", label: opt.label, text: opt.text },
      })),
    },
  };
}
