"use client";

import { useEffect, useState } from "react";

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
  message?: string;
  amount?: number;
}

/**
 * 記録成功時のフルスクリーンオーバーレイアニメーション。
 * チェックマークがスッと描かれ、金額がカウントアップし、
 * 背景にソフトな波紋が広がる。
 */
export default function SuccessAnimation({
  show,
  onComplete,
  message = "記録しました",
  amount,
}: SuccessAnimationProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    setPhase("enter");

    const holdTimer = setTimeout(() => setPhase("hold"), 100);
    const exitTimer = setTimeout(() => setPhase("exit"), 1200);
    const doneTimer = setTimeout(() => {
      setVisible(false);
      setPhase("enter");
      onComplete?.();
    }, 1600);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
        phase === "exit" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* 背景の波紋 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="rounded-full bg-emerald-400/10"
          style={{
            width: phase !== "enter" ? "120vmax" : "0",
            height: phase !== "enter" ? "120vmax" : "0",
            transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>

      {/* メインコンテンツ */}
      <div
        className={`relative flex flex-col items-center gap-3 transition-all duration-500 ${
          phase !== "enter"
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-75 translate-y-4"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        {/* チェックマークサークル */}
        <div className="relative w-20 h-20">
          {/* 外円 */}
          <svg className="w-20 h-20 absolute" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeDasharray="226"
              strokeDashoffset={phase !== "enter" ? "0" : "226"}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 0.6s cubic-bezier(0.65, 0, 0.35, 1)",
              }}
            />
          </svg>
          {/* チェックマーク */}
          <svg className="w-20 h-20 absolute" viewBox="0 0 80 80">
            <path
              d="M24 42 L35 53 L56 28"
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="60"
              strokeDashoffset={phase !== "enter" ? "0" : "60"}
              style={{
                transition: "stroke-dashoffset 0.4s cubic-bezier(0.65, 0, 0.35, 1) 0.3s",
              }}
            />
          </svg>
        </div>

        {/* テキスト */}
        <p
          className="text-lg font-semibold text-emerald-700 dark:text-emerald-300"
          style={{
            opacity: phase !== "enter" ? 1 : 0,
            transform: phase !== "enter" ? "translateY(0)" : "translateY(8px)",
            transition: "all 0.4s ease 0.4s",
          }}
        >
          {message}
        </p>

        {/* 金額 */}
        {amount !== undefined && (
          <p
            className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums"
            style={{
              opacity: phase !== "enter" ? 1 : 0,
              transform: phase !== "enter" ? "translateY(0) scale(1)" : "translateY(12px) scale(0.8)",
              transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s",
            }}
          >
            ¥{amount.toLocaleString()}
          </p>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes ripple-out {
              0% { transform: scale(0); opacity: 0.3; }
              100% { transform: scale(1); opacity: 0; }
            }
          `,
        }}
      />
    </div>
  );
}
