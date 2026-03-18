"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Receipt,
  BarChart3,
  FileText,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  CheckCircle,
  TrendingUp,
  PieChart,
  Clock,
  MousePointerClick,
  MonitorSmartphone,
  Palette,
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/icon.png" alt="スット" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-lg text-blue-600">スット</span>
          </div>
          <Link href="/login">
            <Button
              variant="default"
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4"
            >
              ログイン
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white to-white -z-10" />
        <div className="absolute top-20 left-[10%] w-20 h-20 rounded-full bg-blue-100/60 blur-xl animate-pulse" />
        <div className="absolute top-40 right-[15%] w-32 h-32 rounded-full bg-emerald-100/60 blur-xl animate-pulse [animation-delay:1s]" />

        <div className="max-w-4xl mx-auto text-center">
          {/* Mascot */}
          <div className="mb-6">
            <Image
              src="/icon.png"
              alt="スットのマスコット"
              width={80}
              height={80}
              className="mx-auto drop-shadow-lg"
            />
          </div>

          {/* Logo */}
          <div className="mb-6">
            <Image
              src="/logo.png"
              alt="スット"
              width={200}
              height={80}
              className="mx-auto"
              priority
            />
          </div>

          <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            個人事業主のための収支管理
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            経費記録を、
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-500 bg-clip-text text-transparent">
              もっと簡単に、もっと心地よく。
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            タップするだけで記録完了。
            <br className="hidden sm:block" />
            <span className="text-blue-500 font-semibold">
              スッと気持ちいい操作感
            </span>
            で、毎日の記録がストレスフリーに。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link href="/login">
              <Button
                variant="default"
                size="lg"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
              >
                無料ではじめる
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <span className="text-sm text-gray-400">クレジットカード不要</span>
          </div>

          {/* OGP-style Hero Image */}
          <div className="max-w-2xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-200/40 border border-gray-200">
              <Image
                src="/ogp.png"
                alt="スットの機能イメージ"
                width={1200}
                height={630}
                className="w-full h-auto"
                priority
              />
              <div className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full px-3 py-1 text-xs font-bold shadow-lg flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                記録完了
              </div>
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="group relative border-0 shadow-none bg-gradient-to-br from-blue-50 to-sky-50 hover:from-blue-100 hover:to-sky-100 transition-all duration-300 hover:ring-1 hover:ring-blue-200">
              <CardContent className="pt-2">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Receipt className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  ワンタップ記録
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  カテゴリをタップして金額を入れるだけ。最小限の操作で記録が完了します。
                </p>
              </CardContent>
            </Card>

            <Card className="group relative border-0 shadow-none bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-all duration-300 hover:ring-1 hover:ring-emerald-200">
              <CardContent className="pt-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  心地よい体験
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  スムーズなアニメーションと気持ちいいフィードバック。記録が小さな喜びに変わります。
                </p>
              </CardContent>
            </Card>

            <Card className="group relative border-0 shadow-none bg-gradient-to-br from-sky-50 to-cyan-50 hover:from-sky-100 hover:to-cyan-100 transition-all duration-300 hover:ring-1 hover:ring-sky-200">
              <CardContent className="pt-2">
                <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-sky-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  見える化
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  月次・年次レポートでお金の流れが一目瞭然。グラフで直感的に把握できます。
                </p>
              </CardContent>
            </Card>

            <Card className="group relative border-0 shadow-none bg-gradient-to-br from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 transition-all duration-300 hover:ring-1 hover:ring-violet-200">
              <CardContent className="pt-2">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  請求書作成
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  プロフェッショナルな請求書をPDFで即発行。テンプレートで簡単に作成。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* UX Highlight */}
      <section className="py-20 sm:py-28 px-4 bg-gradient-to-b from-white via-blue-50/30 to-white">
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

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center mx-auto mb-4">
                <MousePointerClick className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">瞬時にフィードバック</h3>
              <p className="text-sm text-gray-500">
                記録ボタンを押した瞬間、心地よいアニメーションで完了を実感。
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
                <MonitorSmartphone className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">スムーズな操作感</h3>
              <p className="text-sm text-gray-500">
                すべての画面遷移やインタラクションに、なめらかなトランジションを実装。
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-violet-500" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">洗練されたUI</h3>
              <p className="text-sm text-gray-500">
                見やすく美しいデザインで、情報を直感的に把握できます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 sm:py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
              こんな悩み、ありませんか？
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-gray-700 font-medium text-sm leading-relaxed">
                確定申告の直前に慌てて領収書を整理している
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-gray-700 font-medium text-sm leading-relaxed">
                Excelでの管理が面倒で、つい後回しにしてしまう
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-700 font-medium text-sm leading-relaxed">
                今月の利益がいくらなのか、すぐに分からない
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-lg text-gray-600">
              <Target className="w-5 h-5 inline-block text-blue-500 mr-1 -mt-0.5" />
              すべて、<span className="font-bold text-blue-600">スット</span>ひとつで解決します。
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 sm:py-32 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Image
            src="/icon.png"
            alt="スット"
            width={64}
            height={64}
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
              variant="default"
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-10 h-14 text-lg font-semibold shadow-xl shadow-blue-500/25 hover:shadow-2xl transition-all"
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
            <Image src="/icon.png" alt="スット" width={24} height={24} className="rounded-md" />
            <span className="font-semibold text-gray-700 text-sm">
              スット
            </span>
          </div>
          <p className="text-sm text-gray-400">
            &copy; 2026 スット All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
