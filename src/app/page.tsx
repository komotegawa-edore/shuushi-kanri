"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">収支管理</span>
          </div>
          <Link href="/login">
            <Button
              variant="default"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4"
            >
              ログイン
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/80 via-white to-white -z-10" />
        <div className="absolute top-20 left-[10%] w-20 h-20 rounded-full bg-indigo-100/60 blur-xl animate-pulse" />
        <div className="absolute top-40 right-[15%] w-32 h-32 rounded-full bg-amber-100/60 blur-xl animate-pulse [animation-delay:1s]" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            個人事業主のための収支管理
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            経費記録を、
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              もっと簡単に、もっと心地よく。
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            タップするだけで記録完了。
            <br className="hidden sm:block" />
            <span className="text-indigo-600 font-semibold">
              気持ちいいアニメーション
            </span>
            で、毎日の記録が心地よい体験に。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link href="/login">
              <Button
                variant="default"
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-indigo-600/25 hover:shadow-xl transition-all"
              >
                無料ではじめる
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <span className="text-sm text-gray-400">クレジットカード不要</span>
          </div>

          {/* Dashboard Mockup */}
          <div className="max-w-2xl mx-auto">
            <div className="relative rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-2xl shadow-gray-200/50 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 mx-4 h-6 rounded-full bg-gray-200" />
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
                <div className="rounded-xl bg-white p-3 sm:p-4 shadow-sm border border-gray-100">
                  <TrendingUp className="w-6 h-6 text-blue-500 mb-1" />
                  <div className="text-xs text-gray-400 mb-0.5">売上</div>
                  <div className="text-sm sm:text-base font-bold text-gray-800">
                    ¥1,250,000
                  </div>
                </div>
                <div className="rounded-xl bg-white p-3 sm:p-4 shadow-sm border border-gray-100">
                  <PieChart className="w-6 h-6 text-orange-500 mb-1" />
                  <div className="text-xs text-gray-400 mb-0.5">経費</div>
                  <div className="text-sm sm:text-base font-bold text-gray-800">
                    ¥380,000
                  </div>
                </div>
                <div className="rounded-xl bg-white p-3 sm:p-4 shadow-sm border border-gray-100">
                  <Sparkles className="w-6 h-6 text-emerald-500 mb-1" />
                  <div className="text-xs text-gray-400 mb-0.5">利益</div>
                  <div className="text-sm sm:text-base font-bold text-emerald-600">
                    ¥870,000
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
                <div className="flex items-end justify-between gap-1 h-20">
                  {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-indigo-500 to-indigo-400 opacity-80"
                        style={{ height: `${h}%` }}
                      />
                    )
                  )}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                  <span>1月</span>
                  <span>6月</span>
                  <span>12月</span>
                </div>
              </div>

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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-sm font-medium mb-4">
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
            <Card className="group relative border-0 shadow-none bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-all duration-300 hover:ring-1 hover:ring-indigo-200">
              <CardContent className="pt-2">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Receipt className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  ワンタップ記録
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  カテゴリをタップして金額を入れるだけ。最小限の操作で記録が完了します。
                </p>
              </CardContent>
            </Card>

            <Card className="group relative border-0 shadow-none bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all duration-300 hover:ring-1 hover:ring-amber-200">
              <CardContent className="pt-2">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  心地よい体験
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  スムーズなアニメーションと気持ちいいフィードバック。記録が小さな喜びに変わります。
                </p>
              </CardContent>
            </Card>

            <Card className="group relative border-0 shadow-none bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-all duration-300 hover:ring-1 hover:ring-emerald-200">
              <CardContent className="pt-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  見える化
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  月次・年次レポートでお金の流れが一目瞭然。グラフで直感的に把握できます。
                </p>
              </CardContent>
            </Card>

            <Card className="group relative border-0 shadow-none bg-gradient-to-br from-purple-50 to-fuchsia-50 hover:from-purple-100 hover:to-fuchsia-100 transition-all duration-300 hover:ring-1 hover:ring-purple-200">
              <CardContent className="pt-2">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6 text-purple-600" />
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

      {/* UX Highlight Section */}
      <section className="py-20 sm:py-28 px-4 bg-gradient-to-b from-white via-gray-50/50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              使うたびに、
              <span className="text-indigo-600">気持ちいい</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              細部にこだわったアニメーションとフィードバックで、
              毎日の経費記録をストレスフリーに。
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                <MousePointerClick className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">瞬時にフィードバック</h3>
              <p className="text-sm text-gray-500">
                記録ボタンを押した瞬間、心地よいアニメーションで完了を実感。
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
                <MonitorSmartphone className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">スムーズな操作感</h3>
              <p className="text-sm text-gray-500">
                すべての画面遷移やインタラクションに、なめらかなトランジションを実装。
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-amber-600" />
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
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-700 font-medium text-sm leading-relaxed">
                今月の利益がいくらなのか、すぐに分からない
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-lg text-gray-600">
              <Target className="w-5 h-5 inline-block text-indigo-600 mr-1 -mt-0.5" />
              すべて、<span className="font-semibold text-gray-900">これひとつ</span>で解決します。
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 sm:py-32 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            面倒な経費記録は、
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              もう終わりにしよう。
            </span>
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
            登録は無料、1分で完了。
            <br />
            今日から気持ちよく経費記録をはじめましょう。
          </p>
          <Link href="/login">
            <Button
              variant="default"
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-14 text-lg font-semibold shadow-xl shadow-indigo-600/25 hover:shadow-2xl transition-all"
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
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Receipt className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-gray-700 text-sm">
              収支管理
            </span>
          </div>
          <p className="text-sm text-gray-400">
            &copy; 2026 収支管理 All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
