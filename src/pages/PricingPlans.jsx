import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Coins, CreditCard, Crown, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readActivePlan, setActivePlan } from "@/lib/planAccess";
import { localStore } from "@/lib/localStore";
import { createProjectPaymentOrder } from "@/lib/structuredSpaceApi";
import { createPageUrl } from "@/utils";

const homeownerPlans = [
  { id: "free", name: "免費風格測驗", price: "免費", description: "先理解主、次風格與基本裝修方向。", features: ["風格測驗 1 次", "主要與次要風格分析", "基礎方向建議"], target: "StyleTest", action: "開始免費測驗" },
  { id: "single", name: "單次購買方案", price: "NT$ 2,999", description: "取得一份固定範圍的 AI 裝修規劃與設計提案，不含進階工具與點數。", features: ["空間需求整理", "裝修預算配置", "設計理念、風格參考照片與材料建議方向"], target: "AIProposal", action: "取得單次提案" },
];

const businessPlans = [
  { id: "pro", name: "商業方案 Pro", price: "NT$ 499 / 月", description: "適合個人設計師與小型工作室。", features: ["啟用全部扣點功能", "無限專案管理", "AI 圖片生成", "高解析度下載"], recommended: true },
  { id: "business", name: "商業方案 Team", price: "NT$ 1,999 / 月", description: "適合設計公司與多人團隊。", features: ["啟用全部扣點功能", "5 人團隊權限", "API 與批次處理", "品牌設定" ] },
];

function PlanCard({ plan, business, onSelect, activePlan }) {
  return <Card className={`flex flex-col rounded-md border-stone-200 shadow-none ${plan.recommended ? "ring-2 ring-amber-400" : ""}`}>
    <CardHeader>{plan.recommended && <Badge className="mb-2 w-fit bg-amber-100 text-amber-900 hover:bg-amber-100">推薦</Badge>}<CardTitle>{plan.name}</CardTitle><p className="text-2xl font-bold text-stone-950">{plan.price}</p><p className="text-sm leading-relaxed text-stone-600">{plan.description}</p></CardHeader>
    <CardContent className="flex flex-1 flex-col"><ul className="space-y-3">{plan.features.map((feature) => <li key={feature} className="flex gap-2 text-sm text-stone-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{feature}</li>)}</ul>
      {business ? <Button className="mt-7 w-full" variant={activePlan === plan.id ? "outline" : "default"} onClick={() => onSelect(plan.id)}>{activePlan === plan.id ? "目前使用中" : `升級${plan.name}`}</Button> : <Button asChild variant="outline" className="mt-7 w-full"><Link to={createPageUrl(plan.target)}>{plan.action}</Link></Button>}
    </CardContent>
  </Card>;
}

export default function PricingPlans() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activePlan, setPlan] = useState(readActivePlan);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentBusy, setPaymentBusy] = useState(false);
  const projectId = searchParams.get("project");
  const checkoutMode = searchParams.get("checkout") === "single" && Boolean(projectId);
  const project = useMemo(
    () => localStore.getAll().projects.find((item) => item.id === projectId || item.project_id === projectId),
    [projectId]
  );
  const chooseBusinessPlan = (planId) => setPlan(setActivePlan(planId));
  const completeLocalPayment = () => {
    setPaymentError("");
    try {
      localStore.markProjectPayment(projectId, { status: "paid_test", plan_id: "single", amount: 2999 });
      setPlan(setActivePlan("single"));
      setPaymentCompleted(true);
    } catch (error) {
      setPaymentError(error.message || "無法完成本機付款測試。");
    }
  };
  const startPayment = async () => {
    setPaymentBusy(true);
    setPaymentError("");
    try {
      const order = await createProjectPaymentOrder(projectId, {
        plan_id: "single",
        plan_name: "StyleMatch AI 單次購買方案",
        amount: 299900,
        currency: "twd",
        customer_email: project?.user_email || "",
      });
      if (order.checkout_url) {
        window.location.assign(order.checkout_url);
        return;
      }
      setPaymentMode("configuration_required");
      setPaymentError("尚未設定 Stripe 金流帳號。本機功能仍可驗收，但不會實際扣款。");
    } catch (error) {
      setPaymentError(error.message || "無法建立付款頁面。");
    } finally {
      setPaymentBusy(false);
    }
  };

  if (checkoutMode) {
    return <div className="min-h-screen bg-stone-50 py-10"><div className="mx-auto max-w-2xl px-4 sm:px-6">
      <div className="mb-6 text-center"><p className="text-sm font-semibold text-amber-700">StyleMatch AI 單次方案</p><h1 className="mt-2 text-3xl font-bold">AI 規劃設計提案付費</h1><p className="mt-3 text-stone-600">付款確認後，從我的專案查看本次提案結果。</p></div>
      <Card className="border-stone-200 shadow-sm"><CardHeader><div className="flex items-start justify-between gap-4"><div><CardTitle>單次購買方案</CardTitle><p className="mt-2 text-sm text-stone-600">案件：{project?.case_code || "找不到案件"}</p></div><p className="text-2xl font-bold text-amber-700">NT$ 2,999</p></div></CardHeader><CardContent>
        <ul className="space-y-3">{homeownerPlans[1].features.map((feature) => <li key={feature} className="flex gap-2 text-sm text-stone-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{feature}</li>)}</ul>
        <div className="mt-6 border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><div className="flex gap-2"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">安全付款</p><p>系統會優先建立 Stripe 加密付款頁；只有在本機尚未設定金流帳號時，才提供明確標示的驗收模式。</p></div></div></div>
        {paymentError && <p className="mt-4 text-sm text-red-700">{paymentError}</p>}
        {!paymentCompleted ? <><Button type="button" size="lg" disabled={!project || paymentBusy} onClick={startPayment} className="mt-6 w-full bg-stone-900 text-white hover:bg-stone-800"><CreditCard className="mr-2 h-5 w-5" />{paymentBusy ? "正在建立安全付款頁" : "前往安全付款"}</Button>{paymentMode === "configuration_required" && <Button type="button" variant="outline" disabled={!project} onClick={completeLocalPayment} className="mt-3 w-full">僅執行本機驗收付款</Button>}</> : <div className="mt-6 border border-emerald-200 bg-emerald-50 p-5 text-center"><CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600" /><p className="mt-2 font-bold text-emerald-900">付款驗收已完成</p><Button type="button" className="mt-4 bg-stone-900 text-white hover:bg-stone-800" onClick={() => navigate(`${createPageUrl("MyProjects")}?tab=projects&project=${projectId}`)}>前往我的方案查看專案結果<ArrowRight className="ml-2 h-4 w-4" /></Button></div>}
      </CardContent></Card>
    </div></div>;
  }

  return <div className="min-h-screen bg-stone-50 py-10"><div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
    <header className="text-center"><h1 className="text-3xl font-bold">方案與使用資格</h1><p className="mx-auto mt-3 max-w-2xl text-stone-600">屋主單次服務與專業商業工具分開選擇，避免在同一個決策裡混淆。</p></header>
    <section><div className="mb-4"><p className="text-sm font-semibold text-amber-700">屋主服務</p><h2 className="text-2xl font-bold">測驗與單次提案</h2></div><div className="grid gap-5 md:grid-cols-2">{homeownerPlans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}</div></section>
    <section className="border-t border-stone-200 pt-9"><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-amber-700">專業工具</p><h2 className="text-2xl font-bold">商業方案</h2></div><Badge variant="outline" className="w-fit px-3 py-2"><Coins className="mr-2 h-4 w-4" />所有扣點功能皆須商業方案</Badge></div><div className="grid gap-5 md:grid-cols-2">{businessPlans.map((plan) => <PlanCard key={plan.id} plan={plan} business onSelect={chooseBusinessPlan} activePlan={activePlan} />)}</div></section>
    <div className="border border-stone-200 bg-white p-5"><div className="flex items-start gap-3"><Crown className="mt-0.5 h-5 w-5 text-amber-600" /><div><p className="font-semibold">資格規則</p><p className="mt-1 text-sm leading-6 text-stone-600">單次購買只包含上述三項提案內容。平面圖視覺化、鳥瞰生成、遮罩區域重繪、指定視角、圖片改版、空間彩現與 360° 等功能，皆須升級商業方案並依次扣點。</p></div></div></div>
  </div></div>;
}
