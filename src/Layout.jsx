import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Camera,
  ChevronDown,
  Home,
  Layers3,
  Menu,
  Palette,
  PenTool,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isBusinessPlan, PLAN_CHANGE_EVENT, readActivePlan } from "@/lib/planAccess";
import { createPageUrl } from "@/utils";

const generalNavigation = [
  { title: "首頁", url: createPageUrl("Home"), icon: Home },
  { title: "風格測驗", url: createPageUrl("StyleTest"), icon: Sparkles },
  { title: "AI 裝修提案", url: createPageUrl("AIProposal"), icon: PenTool },
  { title: "我的專案", url: createPageUrl("MyProjects"), icon: BriefcaseBusiness },
  { title: "方案價格", url: createPageUrl("PricingPlans"), icon: BadgeDollarSign },
];

const businessNavigation = [
  { title: "平面圖視覺化", url: createPageUrl("FloorPlanVisualizer"), icon: Layers3 },
  { title: "空間與 360°", url: createPageUrl("AIGenerate"), icon: Camera },
  { title: "提案圖確認", url: createPageUrl("ReferenceCanvas"), icon: Palette },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [planId, setPlanId] = useState(readActivePlan);
  const hasBusinessAccess = isBusinessPlan(planId);
  const isBusinessPage = businessNavigation.some((item) => item.url === location.pathname);

  useEffect(() => {
    const refreshPlan = () => setPlanId(readActivePlan());
    window.addEventListener(PLAN_CHANGE_EVENT, refreshPlan);
    window.addEventListener("storage", refreshPlan);
    return () => { window.removeEventListener(PLAN_CHANGE_EVENT, refreshPlan); window.removeEventListener("storage", refreshPlan); };
  }, []);

  const navLinkClass = (url) => `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${location.pathname === url ? "bg-amber-100 text-amber-900" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"}`;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl("Home")} className="flex items-center gap-3" aria-label="StyleMatch AI 首頁">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-stone-900 text-sm font-bold text-white">SM</div>
            <div><span className="block text-lg font-semibold leading-tight">StyleMatch AI</span><span className="block text-xs text-stone-500">裝修前 AI 規劃</span></div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="網站主選單">
            {generalNavigation.map((item) => <Link key={item.title} to={item.url} className={navLinkClass(item.url)}><item.icon className="h-4 w-4" /><span>{item.title}</span></Link>)}
            {hasBusinessAccess && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" className={isBusinessPage ? "bg-amber-100 text-amber-900" : "text-stone-600"}><Layers3 className="mr-2 h-4 w-4" />商業工具<ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56"><DropdownMenuLabel>商業方案專用</DropdownMenuLabel><DropdownMenuSeparator />{businessNavigation.map((item) => <DropdownMenuItem key={item.title} asChild><Link to={item.url} className="flex cursor-pointer items-center gap-2"><item.icon className="h-4 w-4" />{item.title}</Link></DropdownMenuItem>)}</DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          <Button variant="ghost" size="sm" className="lg:hidden" aria-label={isMobileMenuOpen ? "關閉導覽" : "開啟導覽"} onClick={() => setIsMobileMenuOpen((open) => !open)}>{isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button>
        </div>

        {isMobileMenuOpen && (
          <nav className="border-t border-stone-200 bg-white px-4 py-3 lg:hidden" aria-label="行動版選單">
            <div className="mx-auto grid max-w-7xl gap-1">
              {generalNavigation.map((item) => <Link key={item.title} to={item.url} onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass(item.url)}><item.icon className="h-4 w-4" />{item.title}</Link>)}
              {hasBusinessAccess && <><div className="my-2 border-t border-stone-200" /><p className="px-3 py-1 text-xs font-semibold text-stone-500">商業方案工具</p>{businessNavigation.map((item) => <Link key={item.title} to={item.url} onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass(item.url)}><item.icon className="h-4 w-4" />{item.title}</Link>)}</>}
            </div>
          </nav>
        )}
      </header>

      <main className="min-h-screen">{children}</main>
      <footer className="border-t border-stone-800 bg-stone-950 text-stone-300"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8"><div><strong className="text-white">StyleMatch AI</strong><span className="ml-3 text-stone-400">裝修規劃、設計媒合與工程治理流程</span></div><div className="flex gap-4 text-stone-400"><Link to={createPageUrl("MyProjects")}>我的專案</Link><Link to={createPageUrl("PricingPlans")}>方案價格</Link></div></div></footer>
    </div>
  );
}
