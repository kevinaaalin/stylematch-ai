import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Mail } from "lucide-react";

const plans = [
  {
    name: "免費風格測試",
    price: "免費",
    subtitle: "限 1 次",
    description: "適合第一次了解自己偏好風格與初步裝修方向的屋主。",
    features: ["喜好風格測試 1 次", "主要與次要風格分析", "基礎裝修方向建議"],
    action: "開始免費測試",
    target: "StyleTest",
    variant: "outline",
  },
  {
    name: "單次購買方案",
    price: "NT$ 2,999",
    subtitle: "原設計 2999 方案",
    description: "適合單一住宅案，需要取得 AI 裝修規劃與設計提案。",
    features: ["AI 室內設計提案", "裝修預算配置", "風格與材料方向", "空間需求整理"],
    action: "購買單次方案",
    target: "AIProposal",
    variant: "default",
    highlight: true,
  },
  {
    name: "商業方案 Pro",
    price: "NT$499/月",
    subtitle: "適合個人設計師與小型工作室",
    description: "提供高頻設計生成與專案管理能力，適合接案型工作流。",
    features: [
      "無限次 AI 設計生成",
      "全部設計風格",
      "高解析度下載",
      "無限專案管理",
      "優先處理佇列",
      "去除浮水印",
    ],
    action: "升級 Pro",
    target: "AIProposal",
    variant: "outline",
  },
  {
    name: "商業方案",
    price: "NT$1,999/月",
    subtitle: "適合設計公司與團隊",
    description: "為設計公司與團隊提供協作、API 與品牌化能力。",
    features: [
      "Pro 方案所有功能",
      "團隊協作（5人）",
      "API 接口",
      "自訂品牌浮水印",
      "專屬客服",
      "批量處理",
    ],
    action: "聯繫我們",
    target: "MyProjects",
    variant: "outline",
    contact: true,
  },
];

export default function PricingPlans() {
  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-stone-950">平台方案價格</h1>
          <p className="mx-auto mt-3 max-w-2xl text-stone-600">
            從免費風格測試、單次購買，到設計師與設計公司使用的商業方案，依照使用頻率選擇最適合的方案。
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col border-stone-200 shadow-sm ${plan.highlight ? "ring-2 ring-amber-400" : ""}`}
            >
              <CardHeader>
                {plan.highlight && (
                  <Badge className="mb-2 w-fit bg-amber-100 text-amber-800 hover:bg-amber-100">
                    推薦
                  </Badge>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-3xl font-bold text-amber-600">{plan.price}</p>
                <p className="text-sm font-medium text-stone-500">{plan.subtitle}</p>
                <p className="text-sm leading-relaxed text-stone-600">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-stone-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to={createPageUrl(plan.target)} className="mt-auto block pt-7">
                  <Button className="w-full" variant={plan.variant}>
                    {plan.contact && <Mail className="mr-2 h-4 w-4" />}
                    {plan.action}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
