import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isBusinessPlan, PLAN_CHANGE_EVENT, readActivePlan } from "@/lib/planAccess";
import { createPageUrl } from "@/utils";

export default function BusinessAccessGate({ children }) {
  const [planId, setPlanId] = useState(readActivePlan);

  useEffect(() => {
    const refreshPlan = () => setPlanId(readActivePlan());
    window.addEventListener(PLAN_CHANGE_EVENT, refreshPlan);
    window.addEventListener("storage", refreshPlan);
    return () => { window.removeEventListener(PLAN_CHANGE_EVENT, refreshPlan); window.removeEventListener("storage", refreshPlan); };
  }, []);

  if (isBusinessPlan(planId)) return children;

  return <div className="mx-auto grid min-h-[65vh] max-w-2xl place-items-center px-4 py-12"><div className="w-full border border-stone-200 bg-white p-7 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-stone-900 text-white"><LockKeyhole className="h-6 w-6" /></span><h1 className="mt-5 text-2xl font-bold">此功能僅限商業會員</h1><p className="mt-3 leading-7 text-stone-600">一般會員仍可使用風格測驗、AI 裝修提案與我的專案。升級商業方案後，才會開啟平面圖視覺化、空間與 360°、提案圖確認。</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Button asChild><Link to={createPageUrl("PricingPlans")}><Crown className="mr-2 h-4 w-4" />查看商業方案</Link></Button><Button asChild variant="outline"><Link to={createPageUrl("MyProjects")}>返回我的專案</Link></Button></div></div></div>;
}

