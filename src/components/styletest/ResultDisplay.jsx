import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Award, Crown, Sparkles, Star } from "lucide-react";

const styleInfo = {
  modern: {
    name: "現代風",
    color: "from-sky-500 to-blue-600",
    description: "重視俐落線條、明亮採光與實用機能，適合想要乾淨、耐看又有質感的居家氛圍。",
  },
  classic: {
    name: "經典風",
    color: "from-violet-500 to-purple-600",
    description: "偏好細節層次、優雅比例與沉穩材質，適合喜歡精緻儀式感的空間。",
  },
  industrial: {
    name: "工業風",
    color: "from-zinc-500 to-stone-700",
    description: "喜歡金屬、裸露材質與低彩度個性，空間可以保留粗獷但有秩序的表情。",
  },
  scandinavian: {
    name: "北歐風",
    color: "from-emerald-500 to-teal-600",
    description: "偏好自然木質、柔和色彩與輕盈家具，讓空間保持明亮、溫暖與放鬆。",
  },
  minimalist: {
    name: "極簡風",
    color: "from-stone-500 to-neutral-700",
    description: "重視留白、收納與材質精準度，適合希望家裡安靜、低干擾又好維護的使用者。",
  },
  bohemian: {
    name: "波西米亞風",
    color: "from-rose-500 to-orange-500",
    description: "喜歡織品、植栽、手作感與自由混搭，空間會更有生活感與個人收藏氣息。",
  },
  japandi: {
    name: "侘寂日式風",
    color: "from-amber-700 to-orange-800",
    description: "結合日式靜謐與北歐簡潔，偏好自然材質、低飽和色與沉穩的生活節奏。",
  },
  coastal: {
    name: "海岸風",
    color: "from-cyan-500 to-blue-500",
    description: "喜歡清爽色調、自然光與輕盈材質，適合想打造放鬆度假感的居家空間。",
  },
};

export default function ResultDisplay({ result, onNext }) {
  const primaryStyleInfo = styleInfo[result.primary_style] || styleInfo.modern;
  const secondaryStyleInfo = result.secondary_style ? styleInfo[result.secondary_style] : null;
  const sortedScores = Object.entries(result.test_score || {}).sort(([, a], [, b]) => b - a);
  const maxScore = Math.max(1, sortedScores[0]?.[1] || 1);
  const completedCount = result.completed_count || result.ratings?.length || 0;
  const totalImages = result.total_images || completedCount;
  const confidenceScore = result.confidence_score || Math.round((completedCount / Math.max(1, totalImages)) * 100);
  const modeName = result.test_mode === "expanded_30" ? "30張完整網頁版" : "15張快速測驗";

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">
          <Award className="h-4 w-4" />
          風格分析完成
        </div>
        <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">
          你的主要風格是 {primaryStyleInfo.name}
        </h1>
        <p className="mt-3 text-stone-600">
          已完成 {completedCount} / {totalImages} 張圖片評分，測驗模式為 {modeName}。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
        <Card className="overflow-hidden border-none bg-white shadow-xl md:col-span-3">
          <CardHeader className={`bg-gradient-to-r ${primaryStyleInfo.color} p-6 text-white`}>
            <div className="flex items-center gap-3">
              <Crown className="h-7 w-7" />
              <div>
                <p className="text-sm font-medium opacity-85">主要風格</p>
                <CardTitle className="text-2xl font-bold">{primaryStyleInfo.name}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="leading-7 text-stone-600">{primaryStyleInfo.description}</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none bg-white shadow-lg md:col-span-2">
          <CardHeader className={`bg-gradient-to-r ${secondaryStyleInfo?.color || "from-stone-400 to-stone-500"} p-6 text-white`}>
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6" />
              <div>
                <p className="text-sm font-medium opacity-85">輔助風格</p>
                <CardTitle className="text-xl font-bold">
                  {secondaryStyleInfo ? secondaryStyleInfo.name : "偏好集中"}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm leading-6 text-stone-600">
              {secondaryStyleInfo
                ? secondaryStyleInfo.description
                : "你的選擇明顯集中在主要風格上，後續設計可以先把材質、色彩和收納條件收斂得更精準。"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-stone-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-xl font-bold text-stone-900">風格分數與信心度</CardTitle>
            <Badge className="w-fit bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
              信心度 {confidenceScore}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-stone-600">圖片評分完整度</span>
              <span className="text-stone-500">{completedCount} / {totalImages}</span>
            </div>
            <Progress value={confidenceScore} className="h-2" />
          </div>

          {sortedScores.filter(([, score]) => score > 0).map(([style, score], index) => (
            <div key={style} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-stone-700">
                  {index === 0 && <Crown className="h-4 w-4 text-amber-500" />}
                  {index === 1 && <Star className="h-4 w-4 text-slate-500" />}
                  {styleInfo[style]?.name || style}
                </span>
                <span className="text-sm text-stone-500">{score} 分</span>
              </div>
              <Progress value={(score / maxScore) * 100} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-none bg-amber-50 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-stone-900">下一步取得 AI 裝修規劃設計提案</h3>
          <p className="mx-auto mt-2 max-w-2xl text-stone-600">
            我們會把你的風格偏好帶入預算、空間條件與需求問卷，產生更完整的裝修規劃方向。
          </p>
          <Button onClick={onNext} size="lg" className="mt-6 bg-stone-900 px-8 text-white hover:bg-stone-800">
            填寫聯絡資料
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
