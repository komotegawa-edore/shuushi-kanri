import type { LineMessage } from "./line";
import { textMessage, quickReplyMessage } from "./line";
import {
  lookupByLinkingCode,
  deleteLinkingCode,
  saveLineLink,
  lookupByLineUserId,
  getCategories,
  addTransaction,
  getConversationState,
  setConversationState,
  resetConversation,
} from "./firestore-admin";
import type { Category } from "@/types";

interface ConversationResult {
  messages: LineMessage[];
}

export async function handleTextMessage(
  lineUserId: string,
  text: string
): Promise<ConversationResult> {
  const input = text.trim();

  // ヘルプ
  if (input === "ヘルプ" || input === "help") {
    return { messages: [helpMessage()] };
  }

  // キャンセル
  if (input === "キャンセル" || input === "cancel") {
    await resetConversation(lineUserId);
    return { messages: [textMessage("キャンセルしました。")] };
  }

  // 6桁コードによるアカウント連携
  if (/^\d{6}$/.test(input)) {
    return handleLinkingCode(lineUserId, input);
  }

  // ユーザー連携確認
  const userId = await lookupByLineUserId(lineUserId);

  if (!userId) {
    return {
      messages: [
        textMessage(
          "アカウントが連携されていません。\n\nスットのWebアプリの設定ページから「LINE連携」で表示される6桁のコードをこちらに送信してください。"
        ),
      ],
    };
  }

  // 会話状態を取得
  const conv = await getConversationState(lineUserId);

  // IDLE状態: 新規入力待ち
  if (conv.state === "IDLE") {
    if (input === "経費") {
      return startTransaction(lineUserId, userId, "expense");
    }
    if (input === "売上") {
      return startTransaction(lineUserId, userId, "income");
    }
    return {
      messages: [
        quickReplyMessage(
          "記録したい項目を選んでください。",
          [
            { label: "経費", text: "経費" },
            { label: "売上", text: "売上" },
            { label: "ヘルプ", text: "ヘルプ" },
          ]
        ),
      ],
    };
  }

  // AWAITING_CATEGORY: カテゴリ選択
  if (conv.state === "AWAITING_CATEGORY") {
    const categories = await getCategories(userId);
    const type = conv.data.type!;
    const filtered = categories.filter((c) => c.type === type);
    const selected = filtered.find((c) => c.name === input);

    if (!selected) {
      return {
        messages: [
          categoryQuickReply(
            "該当するカテゴリが見つかりません。以下から選択してください。",
            filtered
          ),
        ],
      };
    }

    await setConversationState(lineUserId, {
      state: "AWAITING_AMOUNT",
      data: {
        ...conv.data,
        categoryId: selected.id,
        categoryName: selected.name,
      },
      updatedAt: Date.now(),
    });
    return {
      messages: [textMessage("金額を入力してください（数字のみ）。")],
    };
  }

  // AWAITING_AMOUNT: 金額入力
  if (conv.state === "AWAITING_AMOUNT") {
    const amount = parseInt(input.replace(/[,，円]/g, ""), 10);
    if (isNaN(amount) || amount <= 0) {
      return {
        messages: [
          textMessage("正しい金額を数字で入力してください（例: 1500）。"),
        ],
      };
    }

    await setConversationState(lineUserId, {
      state: "AWAITING_DESCRIPTION",
      data: { ...conv.data, amount },
      updatedAt: Date.now(),
    });
    return {
      messages: [
        quickReplyMessage(
          "メモを入力してください（スキップも可）。",
          [{ label: "スキップ", text: "スキップ" }]
        ),
      ],
    };
  }

  // AWAITING_DESCRIPTION: メモ入力
  if (conv.state === "AWAITING_DESCRIPTION") {
    const description =
      input === "スキップ" || input === "skip" ? "" : input;

    await setConversationState(lineUserId, {
      state: "CONFIRMING",
      data: { ...conv.data, description },
      updatedAt: Date.now(),
    });

    const d = conv.data;
    const typeLabel = d.type === "income" ? "売上" : "経費";
    const summary = [
      `【${typeLabel}の確認】`,
      `カテゴリ: ${d.categoryName}`,
      `金額: ${d.amount!.toLocaleString()}円`,
      description ? `メモ: ${description}` : "メモ: なし",
      "",
      "この内容で記録しますか？",
    ].join("\n");

    return {
      messages: [
        quickReplyMessage(summary, [
          { label: "記録する", text: "はい" },
          { label: "キャンセル", text: "キャンセル" },
        ]),
      ],
    };
  }

  // CONFIRMING: 確認
  if (conv.state === "CONFIRMING") {
    if (input === "はい" || input === "OK" || input === "ok") {
      const d = conv.data;
      const today = new Date()
        .toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "-");

      await addTransaction(userId, {
        type: d.type!,
        date: today,
        amount: d.amount!,
        categoryId: d.categoryId!,
        categoryName: d.categoryName!,
        description: d.description || "",
      });

      await resetConversation(lineUserId);

      const typeLabel = d.type === "income" ? "売上" : "経費";
      return {
        messages: [
          quickReplyMessage(
            `${typeLabel}を記録しました!\n\n${d.categoryName}: ${d.amount!.toLocaleString()}円`,
            [
              { label: "経費", text: "経費" },
              { label: "売上", text: "売上" },
            ]
          ),
        ],
      };
    }

    // はい以外 → キャンセル扱い
    await resetConversation(lineUserId);
    return { messages: [textMessage("キャンセルしました。")] };
  }

  return { messages: [helpMessage()] };
}

async function startTransaction(
  lineUserId: string,
  userId: string,
  type: "income" | "expense"
): Promise<ConversationResult> {
  const categories = await getCategories(userId);
  const filtered = categories.filter((c) => c.type === type);

  if (filtered.length === 0) {
    return {
      messages: [
        textMessage(
          "カテゴリが登録されていません。Webアプリの設定ページからカテゴリを追加してください。"
        ),
      ],
    };
  }

  await setConversationState(lineUserId, {
    state: "AWAITING_CATEGORY",
    data: { type },
    updatedAt: Date.now(),
  });

  const typeLabel = type === "income" ? "売上" : "経費";
  return {
    messages: [
      categoryQuickReply(
        `${typeLabel}のカテゴリを選択してください。`,
        filtered
      ),
    ],
  };
}

async function handleLinkingCode(
  lineUserId: string,
  code: string
): Promise<ConversationResult> {
  // 既に連携済みか確認
  const existingUserId = await lookupByLineUserId(lineUserId);
  if (existingUserId) {
    return {
      messages: [
        textMessage(
          "既にアカウントと連携済みです。\n再連携する場合は、まずWebアプリの設定ページから連携を解除してください。"
        ),
      ],
    };
  }

  const linkingCode = await lookupByLinkingCode(code);
  if (!linkingCode) {
    return {
      messages: [
        textMessage(
          "このコードは無効または期限切れです。\n設定ページから新しいコードを発行してください。"
        ),
      ],
    };
  }

  await saveLineLink(linkingCode.userId, lineUserId);
  await deleteLinkingCode(code);

  return {
    messages: [
      quickReplyMessage(
        "アカウント連携が完了しました!\n\n「経費」または「売上」と送信すると記録を開始できます。",
        [
          { label: "経費", text: "経費" },
          { label: "売上", text: "売上" },
          { label: "ヘルプ", text: "ヘルプ" },
        ]
      ),
    ],
  };
}

function categoryQuickReply(text: string, categories: Category[]): LineMessage {
  // Quick Replyは最大13個
  const items = categories.slice(0, 13).map((c) => ({
    label: c.name.length > 20 ? c.name.slice(0, 17) + "..." : c.name,
    text: c.name,
  }));
  return quickReplyMessage(text, items);
}

function helpMessage(): LineMessage {
  return textMessage(
    [
      "【スット LINE連携ヘルプ】",
      "",
      "「経費」→ 経費を記録",
      "「売上」→ 売上を記録",
      "「キャンセル」→ 入力中の操作を中止",
      "「ヘルプ」→ この案内を表示",
      "",
      "アカウント連携:",
      "Webアプリの設定 → LINE連携 から6桁コードを発行し、こちらに送信してください。",
    ].join("\n")
  );
}
