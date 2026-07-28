import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowRight,
  BadgeDollarSign,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  FileSearch,
  HardHat,
  HomeIcon,
  ImagePlus,
  Palette,
  ShieldCheck,
  Sparkles,
  Star,
  Wand2,
} from "lucide-react";

const painPoints = [
  {
    icon: CircleDollarSign,
    title: "預算失控",
    description: "裝修最常見的問題不是沒有預算，而是前期沒有把工程、設備與空間項目拆清楚。",
  },
  {
    icon: HomeIcon,
    title: "設計不適合",
    description: "風格、收納、動線與生活習慣沒有先釐清，入住後才發現不好用。",
  },
  {
    icon: AlertTriangle,
    title: "工程風險",
    description: "中古屋或毛胚屋常有泥作、水電、門窗與衛浴變數，若前期未預留容易追加。",
  },
];

const features = [
  ["AI風格分析", "分析偏好的設計風格、材質語彙與空間氛圍。", Palette],
  ["裝修預算配置", "依屋況與空間需求拆解合理比例，避免超支。", BadgeDollarSign],
  ["空間規劃方向", "先整理收納、動線與生活需求，再進入設計。", ClipboardList],
  ["單張AI空間照片生成模擬", "上傳一張空間照片，快速模擬設計方向。", ImagePlus],
  ["設計師媒合與工程治理", "可銜接 TWCID 媒合與 iSAFE 工程履歷。", ShieldCheck],
];

const budgetGroups = [
  {
    group_key: "base_engineering",
    group_label: "基礎工程預算",
    group_note: "中古屋或毛胚屋須先確認的工程變數",
    subtotal: 50,
    amount: "100 萬",
    items: [
      { key: "masonry", name: "泥作工程", value: 12, amount: "24 萬", color: "bg-stone-500" },
      { key: "electrical_plumbing", name: "水電工程", value: 10, amount: "20 萬", color: "bg-sky-500" },
      { key: "doors_windows", name: "門窗工程", value: 8, amount: "16 萬", color: "bg-cyan-600" },
      { key: "kitchen_equipment", name: "廚具工程", value: 10, amount: "20 萬", color: "bg-amber-600" },
      { key: "bathroom", name: "衛浴工程", value: 10, amount: "20 萬", color: "bg-teal-500" },
    ],
  },
  {
    group_key: "space_design",
    group_label: "空間設計預算",
    group_note: "基礎工程確認後，再依生活使用頻率分配",
    subtotal: 50,
    amount: "100 萬",
    items: [
      { key: "living_room", name: "客廳", value: 18, amount: "36 萬", color: "bg-blue-500" },
      { key: "kitchen_space", name: "廚房", value: 12, amount: "24 萬", color: "bg-amber-500" },
      { key: "master_bedroom", name: "主臥", value: 8, amount: "16 萬", color: "bg-emerald-500" },
      { key: "storage", name: "收納系統", value: 6, amount: "12 萬", color: "bg-violet-400" },
      { key: "other", name: "其他", value: 6, amount: "12 萬", color: "bg-stone-400" },
    ],
  },
];

const steps = [
  ["01", "填寫需求", "輸入坪數、屋況、預算與風格偏好。"],
  ["02", "取得AI分析", "獲得風格建議、預算配置與空間規劃方向。"],
  ["03", "完整規劃", "進一步選擇 AI 提案、設計師媒合或工程治理。"],
];

const styles = [
  ["簡約現代", "簡潔線條、開放空間"],
  ["北歐風", "溫暖木質、自然光線"],
  ["工業風", "裸露材質、粗獷美學"],
  ["日式禪風", "寧靜和諧、自然素材"],
  ["地中海", "明亮色彩、拱形設計"],
  ["裝飾藝術", "奢華幾何、金屬玻璃"],
];

const styleCards = [
  {
    title: "簡約現代",
    description: "簡潔線條、開放空間與俐落材質。",
    image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "北歐風",
    description: "溫暖木質、自然光線與柔和配色。",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "工業風",
    description: "裸露材質、深色金屬與粗獷美學。",
    image: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "日式禪風",
    description: "低彩度、自然素材與安定留白。",
    image: "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "地中海",
    description: "明亮色彩、拱形語彙與度假氛圍。",
    image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "裝飾藝術",
    description: "幾何線條、金屬細節與精緻層次。",
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=80",
  },
];

const pricing = [
  ["免費風格測試", "免費", ["限 1 次", "主要與次要風格分析", "基礎裝修方向建議"]],
  ["單次購買方案", "NT$ 2,999", ["AI 室內設計提案", "裝修預算配置", "風格與材料方向"]],
  ["商業方案 Pro", "NT$499/月", ["無限次 AI 設計生成", "高解析度下載", "無限專案管理"]],
  ["商業方案", "NT$1,999/月", ["團隊協作（5人）", "API 接口", "專屬客服"]],
];

const testimonials = [
  ["劉小姐", "台北市 · 中古屋 22坪", "小坪數最難規劃，AI 提案裡的收納規劃讓每一個角落都被善用。"],
  ["林小姐", "台北市 · 新成屋 32坪", "透過 AI 風格測試才發現自己真正喜歡的是日式侘寂風，而不是一開始以為的北歐風。"],
  ["陳先生", "新北市 · 中古屋 45坪", "中古屋改造最怕踩雷，AI 規劃把預算分配得非常清楚。"],
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      <section className="relative bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_32%),linear-gradient(135deg,#fafaf9,#fff7ed)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">
              <Sparkles className="h-4 w-4" />
              由20年以上設計與工程團隊經驗打造
            </div>
            <h1 className="text-4xl font-bold leading-tight text-stone-950 sm:text-5xl lg:text-6xl">
              裝修前，
              <span className="block text-amber-600">先做AI規劃。</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
              避免預算失控、設計錯誤與工程風險。StyleMatch AI 為您分析最適合的裝修策略與設計方向。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={createPageUrl("StyleTest")}>
                <Button size="lg" className="bg-amber-500 text-white hover:bg-amber-600">
                  免費設計風格測試
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("AIProposal")}>
                <Button variant="outline" size="lg">
                  取得AI 裝修規劃設計提案
                </Button>
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-3 text-sm text-stone-600">
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                AI預算分析
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                可銜接 TWCID / iSAFE
              </span>
            </div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden rounded-lg bg-stone-900 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1400&q=80"
              alt="現代室內設計客廳"
              className="h-full min-h-[420px] w-full object-cover opacity-90"
            />
            <div className="absolute bottom-5 left-5 right-5 rounded-lg bg-white/92 p-5 shadow-xl backdrop-blur">
              <p className="text-sm font-medium text-stone-500">AI 裝修決策摘要</p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-2xl font-bold text-stone-950">30%+</p>
                  <p className="text-xs text-stone-500">可降低無效支出</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-950">3</p>
                  <p className="text-xs text-stone-500">系統串接</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-950">200萬</p>
                  <p className="text-xs text-stone-500">示範預算級距</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pain-points" className="bg-stone-100 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-stone-950">為什麼多數裝修最後都後悔？</h2>
            <p className="mt-3 text-lg text-stone-600">不是設計不好，而是裝修前沒有完整規劃。</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {painPoints.map((item) => (
              <Card key={item.title} className="border-stone-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 leading-relaxed text-stone-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-3xl font-bold text-stone-950">StyleMatch AI 如何幫助你做對裝修決策？</h2>
            <p className="mt-3 text-lg text-stone-600">
              從風格分析到設計師媒合，提供全方位裝修前規劃支持，讓每一分預算都花在刀口上。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {features.map(([title, description, Icon]) => (
              <Card key={title} className="border-stone-200 shadow-sm">
                <CardContent className="p-5">
                  <Icon className="mb-4 h-7 w-7 text-amber-600" />
                  <h3 className="font-semibold text-stone-950">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="case-study" className="bg-gradient-to-br from-stone-50 to-amber-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="mb-4 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
              案例分析
            </span>
            <h2 className="text-3xl font-bold text-stone-950">AI 裝修預算配置示範</h2>
            <p className="mt-3 text-stone-600">中古屋・25 坪・3 房 2 廳・預算級距 200 萬</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="border-none shadow-xl lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CircleDollarSign className="h-6 w-6 text-amber-600" />
                  裝修預算配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {budgetGroups.map((group) => (
                  <div key={group.group_key} className="rounded-lg border border-stone-200 bg-white p-4">
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-stone-900">{group.group_label}</h3>
                        <p className="text-xs text-stone-500">{group.group_note}</p>
                      </div>
                      <p className="text-sm font-semibold text-amber-700">
                        小計 {group.subtotal}%・{group.amount}
                      </p>
                    </div>
                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <div key={item.key}>
                          <div className="mb-2 flex justify-between text-sm">
                            <span className="font-medium text-stone-700">{item.name}</span>
                            <span className="text-stone-500">{item.value}%・{item.amount}</span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-none bg-stone-950 text-white shadow-xl lg:col-span-2">
              <CardContent className="flex h-full flex-col p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500">
                  <FileSearch className="h-6 w-6" />
                </div>
                <h3 className="mb-4 text-2xl font-bold">AI 建議摘要</h3>
                <ul className="space-y-3 leading-relaxed text-stone-300">
                  <li>• 基礎工程預算先抓 50%，涵蓋泥作、水電、門窗、廚具與衛浴等中古屋/毛胚屋變數。</li>
                  <li>• 空間設計預算抓 50%，再依客廳、廚房、主臥、收納與其他空間的使用頻率分配。</li>
                  <li>• 後續 AI 分析會依屋況、坪數、屋齡與照片判斷兩組比例是否需要上修或下修。</li>
                </ul>
                <Link to={createPageUrl("AIProposal")} className="mt-auto pt-8">
                  <Button className="w-full bg-amber-500 text-white hover:bg-amber-600">
                    查看我的AI分析
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-stone-950">3步驟取得AI室內設計提案</h2>
            <p className="mt-3 text-lg text-stone-600">簡單三步驟，讓 AI 為您量身打造最適合的裝修策略。</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map(([number, title, description]) => (
              <Card key={number} className="border-stone-200 shadow-sm">
                <CardContent className="p-7">
                  <p className="text-5xl font-black text-amber-200">{number}</p>
                  <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-stone-600">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to={createPageUrl("AIProposal")}>
              <Button size="lg" className="bg-stone-900 text-white hover:bg-stone-800">
                開始AI分析
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-stone-100 py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-bold text-stone-950">AI 設計前後對比</h2>
            <p className="mt-3 text-lg leading-relaxed text-stone-600">
              上傳空間照片，AI 在數秒內生成專業設計方案，讓您在動工前就能看見成果。
            </p>
            <Link to={createPageUrl("AIGenerate")} className="mt-6 inline-flex">
              <Button className="bg-amber-500 text-white hover:bg-amber-600">
                單張AI空間照片生成模擬
                <Wand2 className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 overflow-hidden rounded-lg shadow-xl">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80"
                alt="原始空間"
                className="h-80 w-full object-cover"
              />
              <span className="absolute left-3 top-3 rounded bg-white px-3 py-1 text-sm font-medium">原始</span>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80"
                alt="AI 智能設計"
                className="h-80 w-full object-cover"
              />
              <span className="absolute left-3 top-3 rounded bg-amber-500 px-3 py-1 text-sm font-medium text-white">
                AI 智能設計
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-stone-950">探索設計風格</h2>
            <p className="mt-3 text-lg text-stone-600">從多種專業設計風格中選擇，AI 會根據您的空間量身定制。</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {styleCards.map((style) => (
              <Card key={style.title} className="overflow-hidden border-stone-200 shadow-sm">
                <div className="aspect-[4/3] overflow-hidden bg-stone-200">
                  <img
                    src={style.image}
                    alt={`${style.title} 室內設計風格`}
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    <h3 className="font-semibold">{style.title}</h3>
                  </div>
                  <p className="text-sm text-stone-600">{style.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-950 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold">不只是AI，而是設計與工程經驗整合</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              [Sparkles, "StyleMatch", "AI設計分析系統，精準解析風格與預算。"],
              [Building2, "TWCID", "設計媒合平台，連結優質設計師與屋主。"],
              [HardHat, "iSAFE", "工程監管系統，保障施工品質與安全。"],
            ].map(([Icon, title, description]) => (
              <Card key={title} className="border-white/10 bg-white/5 text-white shadow-none">
                <CardContent className="p-6 text-center">
                  <Icon className="mx-auto mb-4 h-8 w-8 text-amber-400" />
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-stone-300">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-stone-950">選擇適合您的裝修規劃方案</h2>
            <p className="mt-3 text-lg text-stone-600">從免費基礎分析到完整設計媒合，依您的需求選擇最合適的服務方案。</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {pricing.map(([title, price, items], index) => (
              <Card key={title} className={`border-stone-200 shadow-sm ${index === 1 ? "ring-2 ring-amber-400" : ""}`}>
                <CardHeader>
                  {index === 1 && (
                    <span className="mb-2 w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                      主推方案
                    </span>
                  )}
                  <CardTitle>{title}</CardTitle>
                  <p className="text-2xl font-bold text-amber-600">{price}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-stone-600">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link to={index === 0 ? createPageUrl("StyleTest") : createPageUrl("PricingPlans")} className="mt-6 block">
                    <Button className="w-full" variant={index === 1 ? "default" : "outline"}>
                      {index === 0 ? "免費開始" : index === 1 ? "購買單次方案" : "查看方案"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-stone-950">客戶見證</h2>
            <p className="mt-3 text-lg text-stone-600">真實客戶，真實成果。</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map(([name, meta, quote]) => (
              <Card key={name} className="border-stone-200 shadow-sm">
                <CardContent className="p-6">
                  <p className="leading-relaxed text-stone-700">「{quote}」</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 font-semibold text-amber-800">
                      {name.slice(0, 1)}
                    </div>
                    <div>
                      <p className="font-semibold">{name}</p>
                      <p className="text-sm text-stone-500">{meta}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-stone-950">常見問題</h2>
          {[
            ["AI會取代設計師嗎？", "不會。AI 用來協助屋主在前期釐清風格、需求與預算方向，正式設計仍由專業設計師判斷。"],
            ["AI分析準確嗎？", "它適合做前期決策與方向整理，實際工程報價仍需依現場條件確認。"],
            ["是否可以推薦設計公司？", "可以，需求整理後可銜接 TWCID 設計媒合或招標流程。"],
          ].map(([question, answer]) => (
            <details key={question} className="mb-3 rounded-lg border border-stone-200 bg-stone-50 p-5">
              <summary className="cursor-pointer font-semibold text-stone-900">{question}</summary>
              <p className="mt-3 text-stone-600">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="cta" className="bg-stone-950 py-16 text-center text-white lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">裝修前先規劃，避免裝修時後悔。</h2>
          <p className="mt-4 text-lg text-stone-300">讓 AI 幫你做對第一個決策，一個正確的裝修規劃能避免後續追加與遺憾。</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={createPageUrl("StyleTest")}>
              <Button size="lg" className="bg-amber-500 text-white hover:bg-amber-600">
                免費取得AI分析
              </Button>
            </Link>
            <Link to={createPageUrl("AIProposal")}>
              <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-stone-950">
                預約裝修顧問
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
