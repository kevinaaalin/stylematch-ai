import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BadgeDollarSign, BriefcaseBusiness, Home, ImagePlus, Menu, Palette, PenTool, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { title: "首頁", url: createPageUrl("Home"), icon: Home },
    { title: "喜好風格測試", url: createPageUrl("StyleTest"), icon: Palette },
    { title: "AI 裝修規劃設計提案", url: createPageUrl("AIProposal"), icon: PenTool },
    { title: "單張AI空間照片生成模擬", url: createPageUrl("AIGenerate"), icon: ImagePlus },
    { title: "我的專案", url: createPageUrl("MyProjects"), icon: BriefcaseBusiness },
    { title: "平台方案價格", url: createPageUrl("PricingPlans"), icon: BadgeDollarSign },
  ];

  const isCurrentPage = (url) => location.pathname === url;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl("Home")} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-900 text-sm font-bold text-white">
              SM
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">StyleMatch AI</h1>
              <p className="text-xs text-stone-500">TWCID x iSAFE local MVP</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                to={item.url}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                  isCurrentPage(item.url)
                    ? "bg-amber-100 text-amber-800"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            aria-label={isMobileMenuOpen ? "關閉選單" : "開啟選單"}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {isMobileMenuOpen && (
          <nav className="border-t border-stone-200 bg-white px-4 py-3 lg:hidden">
            <div className="mx-auto grid max-w-7xl gap-2 sm:grid-cols-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium ${
                    isCurrentPage(item.url)
                      ? "bg-amber-100 text-amber-800"
                      : "text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="min-h-screen">{children}</main>

      <footer className="bg-stone-950 text-stone-300">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-500 text-sm font-bold text-white">
                SM
              </div>
              <h3 className="font-semibold text-white">StyleMatch AI</h3>
            </div>
            <p className="text-sm leading-relaxed text-stone-400">
              裝修前先做 AI 規劃，串接風格測試、室內設計提案、TWCID 媒合與 iSAFE 工程治理。
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white">功能選單</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>喜好風格測試</li>
              <li>AI 裝修規劃設計提案</li>
              <li>單張AI空間照片生成模擬</li>
              <li>我的專案與平台方案價格</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white">聯絡資訊</h4>
            <div className="space-y-2 text-sm text-stone-400">
              <p>客服信箱：service@stylematch.ai</p>
              <p>合作洽詢：partner@stylematch.ai</p>
              <p>服務時間：週一至週五 9:00-18:00</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
