import React from "react";
import { ArrowRight, CheckCircle2, ExternalLink, Mail, Sparkles, UserCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const serviceOptions = [
  {
    id: "ai_proposal",
    icon: Sparkles,
    title: "AI 裝修規劃設計提案",
    description: "依格局、照片、風格與預算，產生個人化空間規劃、參考圖、材料及預算摘要。",
    price: "NT$ 2,999",
    highlights: ["AI 需求與風格分析", "3 至 5 組空間方向", "材料與配色建議", "預算配置摘要"],
    action: "選擇 AI 設計提案",
    recommended: true,
  },
  {
    id: "platform_matching",
    icon: UserCheck,
    title: "專業設計師媒合",
    description: "由平台整理完整需求，媒合適合的專業設計師進一步確認、報價與實作。",
    price: "免費提出需求",
    highlights: ["依需求條件媒合", "設計師資料比較", "後續洽談安排", "以需求資料協助溝通"],
    action: "選擇設計師媒合",
  },
  {
    id: "twcid_platform",
    icon: ExternalLink,
    title: "TWCID 平台服務",
    description: "將需求整理後銜接 TWCID 平台，進行會員確認、設計服務媒合或後續招標。",
    price: "依平台規則",
    highlights: ["會員與資格確認", "正式需求登錄", "設計服務媒合", "保留案件治理銜接"],
    action: "選擇 TWCID 服務",
  },
];

export default function ServiceIntroduction({ delivery, onNext }) {
  const delivered = delivery?.delivery_status === "sent";
  const deliveryTone = delivered
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : "border-amber-200 bg-amber-50 text-amber-900";

  return (
    <div className="space-y-8">
      <div className={"flex items-start gap-3 rounded-md border p-4 " + deliveryTone}>
        {delivered ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <Mail className="mt-0.5 h-5 w-5 shrink-0" />}
        <div>
          <p className="font-semibold">{delivered ? "風格結果與 4 張參考圖已寄出" : "風格結果已建立於本機待寄匣"}</p>
          <p className="mt-1 text-sm">{delivery?.message || "寄送作業已完成，請選擇下一步服務方向。"}</p>
        </div>
      </div>

      <header className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white">
          <Users className="h-4 w-4" />
          後續服務選項
        </div>
        <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">選擇適合你的裝修規劃方式</h1>
        <p className="mx-auto mt-3 max-w-2xl text-stone-600">
          先了解三種服務的交付方式與費用，再進入需求填寫。現在的選擇會預先帶入，完成需求前仍可調整。
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        {serviceOptions.map((option) => (
          <Card key={option.id} className={"flex flex-col border-stone-200 shadow-sm " + (option.recommended ? "ring-2 ring-amber-400" : "")}>
            <CardHeader>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className={"flex h-11 w-11 items-center justify-center rounded-md " + (option.recommended ? "bg-amber-500 text-white" : "bg-stone-100 text-stone-700")}>
                  <option.icon className="h-5 w-5" />
                </div>
                {option.recommended && <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">推薦</Badge>}
              </div>
              <CardTitle className="text-xl">{option.title}</CardTitle>
              <p className="font-semibold text-amber-700">{option.price}</p>
              <p className="text-sm leading-6 text-stone-600">{option.description}</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="space-y-2">
                {option.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 text-sm text-stone-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                onClick={() => onNext(option.id)}
                className={"mt-6 w-full " + (option.recommended ? "bg-amber-500 text-white hover:bg-amber-600" : "")}
                variant={option.recommended ? "default" : "outline"}
              >
                {option.action}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="border-y border-stone-200 py-6">
        <h2 className="text-center text-lg font-semibold text-stone-900">接下來的流程</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          {[
            ["1", "住宅資料", "格局、坪數與預算"],
            ["2", "現況資料", "平面圖與空間照片"],
            ["3", "需求分析", "機能、材質與生活偏好"],
            ["4", "確認方案", "檢視分析後正式送出"],
          ].map(([step, title, description]) => (
            <div key={step}>
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white">{step}</div>
              <h3 className="mt-2 font-semibold text-stone-800">{title}</h3>
              <p className="mt-1 text-xs text-stone-500">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
