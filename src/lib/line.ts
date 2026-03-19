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
  console.log("[line] replyMessage token:", replyToken?.slice(0, 10) + "...", "messages:", messages.length);
  const payload = JSON.stringify({ replyToken, messages });
  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: payload,
  });
  const resText = await res.text();
  console.log("[line] reply response:", res.status, resText);
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
