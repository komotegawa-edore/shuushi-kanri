"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  BarChart3,
  FileText,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  CheckCircle,
  MousePointerClick,
  MonitorSmartphone,
  Palette,
  Clock,
  Shield,
} from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/icon.png" alt="スット" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              スット
            </span>
          </Link>
          <Link href="/login">
            <Button
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-5 shadow-sm shadow-blue-200 hover:shadow-md transition-all"
            >
              ログイン
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 px-4">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 via-white to-white" />
          <div className="absolute top-16 left-[8%] w-72 h-72 rounded-full bg-blue-100/40 blur-3xl" />
          <div className="absolute top-32 right-[5%] w-80 h-80 rounded-full bg-emerald-50/50 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-blue-200/50 to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          {/* Mascot + Logo */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <Image
              src="/icon.png"
              alt="スットのマスコット"
              width={72}
              height={72}
              className="drop-shadow-lg"
            />
            <Image
              src="/logo.png"
              alt="スット"
              width={180}
              height={72}
              className="drop-shadow-sm"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            個人事業主のための収支管理
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            経費記録を、
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-500 bg-clip-text text-transparent">
              もっと簡単に、もっと心地よく。
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            タップするだけで記録完了。
            <br className="hidden sm:block" />
            <span className="text-blue-500 font-semibold">スッと気持ちいい操作感</span>
            で、毎日の記録がストレスフリーに。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/25 transition-all"
              >
                無料ではじめる
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <span className="text-sm text-gray-400">クレジットカード不要</span>
          </div>

          {/* Hero Image */}
          <div className="max-w-2xl mx-auto relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-blue-200/30 border border-blue-100/80 ring-1 ring-blue-50">
              <Image
                src="/ogp.png"
                alt="スットの機能イメージ"
                width={1200}
                height={630}
                className="w-full h-auto"
                priority
              />
            </div>
            <div className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full px-3 py-1 text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              記録完了
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium mb-4">
              <Zap className="w-3.5 h-3.5" />
              主な機能
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              フリーランスの収支管理を、
              <br className="hidden sm:block" />
              まるごとサポート
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Receipt,
                title: "ワンタップ記録",
                description: "カテゴリをタップして金額を入れるだけ。最小限の操作で記録が完了します。",
                gradient: "from-blue-50 to-sky-50",
                hoverGradient: "hover:from-blue-100 hover:to-sky-100",
                iconBg: "bg-blue-100",
                iconColor: "text-blue-500",
                ringColor: "hover:ring-blue-200",
              },
              {
                icon: Sparkles,
                title: "心地よい体験",
                description: "スムーズなアニメーションと気持ちいいフィードバック。記録が小さな喜びに変わります。",
                gradient: "from-emerald-50 to-teal-50",
                hoverGradient: "hover:from-emerald-100 hover:to-teal-100",
                iconBg: "bg-emerald-100",
                iconColor: "text-emerald-500",
                ringColor: "hover:ring-emerald-200",
              },
              {
                icon: BarChart3,
                title: "見える化",
                description: "月次・年次レポートでお金の流れが一目瞭然。グラフで直感的に把握できます。",
                gradient: "from-sky-50 to-cyan-50",
                hoverGradient: "hover:from-sky-100 hover:to-cyan-100",
                iconBg: "bg-sky-100",
                iconColor: "text-sky-600",
                ringColor: "hover:ring-sky-200",
              },
              {
                icon: FileText,
                title: "請求書作成",
                description: "プロフェッショナルな請求書をPDFで即発行。テンプレートで簡単に作成。",
                gradient: "from-violet-50 to-purple-50",
                hoverGradient: "hover:from-violet-100 hover:to-purple-100",
                iconBg: "bg-violet-100",
                iconColor: "text-violet-600",
                ringColor: "hover:ring-violet-200",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`group relative rounded-2xl border border-transparent bg-gradient-to-br ${feature.gradient} ${feature.hoverGradient} p-6 transition-all duration-300 hover:ring-1 ${feature.ringColor} hover:shadow-sm`}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UX Highlight */}
      <section className="py-20 sm:py-28 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/20 to-white -z-10" />
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              使うたびに、
              <span className="text-blue-500">スッと気持ちいい</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              細部にこだわったアニメーションとフィードバックで、
              毎日の経費記録をストレスフリーに。
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: MousePointerClick,
                title: "瞬時にフィードバック",
                description: "記録ボタンを押した瞬間、心地よいアニメーションで完了を実感。",
                gradient: "from-blue-100 to-sky-100",
                iconColor: "text-blue-500",
              },
              {
                icon: MonitorSmartphone,
                title: "スムーズな操作感",
                description: "すべての画面遷移やインタラクションに、なめらかなトランジションを実装。",
                gradient: "from-emerald-100 to-teal-100",
                iconColor: "text-emerald-500",
              },
              {
                icon: Palette,
                title: "洗練されたUI",
                description: "見やすく美しいデザインで、情報を直感的に把握できます。",
                gradient: "from-violet-100 to-purple-100",
                iconColor: "text-violet-500",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-4`}>
                  <item.icon className={`w-8 h-8 ${item.iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
              こんな悩み、ありませんか？
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Clock,
                bg: "bg-rose-50",
                iconColor: "text-rose-400",
                text: "確定申告の直前に慌てて領収書を整理している",
              },
              {
                icon: FileText,
                bg: "bg-amber-50",
                iconColor: "text-amber-400",
                text: "Excelでの管理が面倒で、つい後回しにしてしまう",
              },
              {
                icon: BarChart3,
                bg: "bg-slate-100",
                iconColor: "text-slate-400",
                text: "今月の利益がいくらなのか、すぐに分からない",
              },
            ].map((item) => (
              <div key={item.text} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center mx-auto mb-3`}>
                  <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <p className="text-gray-700 font-medium text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-lg text-gray-600">
              <Target className="w-5 h-5 inline-block text-blue-500 mr-1 -mt-0.5" />
              すべて、<span className="font-bold text-blue-600">スット</span>ひとつで解決します。
            </p>
          </div>
        </div>
      </section>

      {/* Trust / Security */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>SSL暗号化通信</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Firebase認証</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>完全無料</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Image
            src="/icon.png"
            alt="スット"
            width={56}
            height={56}
            className="mx-auto mb-6 drop-shadow-md"
          />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            面倒な経費記録は、
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
              もう終わりにしよう。
            </span>
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
            登録は無料、1分で完了。
            <br />
            今日からスッと気持ちよく経費記録をはじめましょう。
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-10 h-14 text-lg font-semibold shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all"
            >
              無料ではじめる
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-gray-400">
            クレジットカード不要 ・ いつでも解約可能
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/icon.png" alt="スット" width={24} height={24} className="rounded-lg" />
            <span className="font-semibold text-gray-700 text-sm">スット</span>
          </div>
          <p className="text-sm text-gray-400">
            &copy; 2026 スット All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
