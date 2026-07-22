import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Sparkles, 
  ExternalLink, 
  CheckCircle, 
  Loader2,
  CreditCard,
  UserCheck,
  Link,
  ShieldCheck
} from "lucide-react";
import { ProjectRequirement, SendEmail } from "@/lib/localAdapters";
import { localStore } from "@/lib/localStore";

export default function ServiceOptions({ formData, isSubmitting, setIsSubmitting }) {
  const [selectedOption, setSelectedOption] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState("");

  const options = [
    {
      id: "ai_proposal",
      icon: Sparkles,
      title: "AI 付費裝修規劃提案",
      description: "AI 基於您的需求生成個人化規劃提案，包含風格方向、材料建議與預算分析",
      price: "NT$ 2,999",
      features: [
        "專業 AI 分析您的需求",
        "3-5 個風格提案選擇", 
        "包含 3D 效果圖",
        "詳細材料與色彩建議",
        "預算範圍分析",
        "7 天內交付完成"
      ],
      action: "選擇 NT$2,999 提案",
      highlight: true
    },
    {
      id: "platform_matching",
      icon: UserCheck,
      title: "平台設計師媒合",
      description: "由我們的專業團隊為您匹配最適合的室內設計師，提供完整的設計服務",
      price: "免費媒合",
      features: [
        "專業團隊人工媒合",
        "推薦 3-5 位適合設計師",
        "設計師作品集展示",
        "報價比較與選擇",
        "全程服務品質保障",
        "3-5 個工作天媒合完成"
      ],
      action: "選擇免費媒合"
    },
    {
      id: "twcid_platform",
      icon: ExternalLink,
      title: "TWCID 平台招標媒合",
      description: "直接使用 TWCID 平台的招標系統，讓多位設計師為您提案競標",
      price: "依招標規則",
      features: [
        "開放式招標競爭",
        "多位設計師提案",
        "透明化報價機制",
        "豐富的設計師資源",
        "自主選擇合作對象",
        "TWCID 平台品質保證"
      ],
      action: "選擇 TWCID 招標"
    },
    {
      id: "isafe_governance",
      icon: ShieldCheck,
      title: "後續銜接 iSAFE 監管",
      description: "先建立 StyleMatchAI 與 TWCID 媒合需求；媒合結果經人工確認後，才能正式交接至 iSAFE。",
      price: "依監管方案",
      features: [
        "建立 TWCID 媒合需求",
        "人工確認媒合成功",
        "確認後才產生 isafe_case_id",
        "同步案件時間軸與稽核紀錄",
        "建立 Evidence 與 PGP 基礎資料",
        "由 iSAFE 管理後續 Gate 狀態"
      ],
      action: "建立媒合及監管需求"
    }
  ];

  const handleOptionSelect = async (optionId) => {
    if (isSubmitting) return;
    
    setSelectedOption(optionId);
    setError("");
    setIsSubmitting(true);

    try {
      // 儲存專案需求到資料庫
      const projectData = {
        ...formData,
        completion_status: "已完成",
        service_option: optionId,
      };
      
      const project = await ProjectRequirement.create(projectData);
      // This records the governance requirement only. The iSAFE handover is
      // created after the TWCID match is explicitly confirmed.

      // 根據選擇的服務發送不同的 email
      let emailSubject = "";
      let emailBody = "";

      switch (optionId) {
        case "isafe_governance":
          emailSubject = "iSAFE 監管需求已登記";
          emailBody = `您的 StyleMatchAI 案件已登記後續 iSAFE 監管需求。\n\n案件代碼：${project.case_code}\n完成 TWCID 媒合並經人工確認後，系統才會建立 iSAFE 監管專案。`;
          break;
        case "ai_proposal":
          emailSubject = "AI設計提案服務 - 付款資訊";
          emailBody = `
親愛的客戶您好，

感謝您選擇我們的AI設計提案服務！

服務內容：
• AI 專業分析您的空間需求
• 3-5 個個人化風格提案
• 包含 3D 效果圖展示
• 詳細材料與色彩建議
• 預算範圍分析

服務費用：NT$ 2,999
預計交付：7個工作天

付款方式：
請透過以下連結完成付款，我們將在確認付款後立即開始為您製作專屬設計提案。

[付款連結將在此提供]

如有任何問題，歡迎隨時與我們聯繫。

StyleMatch AI 團隊
`;
          break;

        case "platform_matching":
          emailSubject = "設計師媒合服務 - 需求已收到";
          emailBody = `
親愛的客戶您好，

我們已收到您的設計師媒合需求！

我們的專業團隊將根據您的需求進行以下服務：
• 分析您的空間需求與預算
• 從我們的設計師夥伴中挑選最適合的候選人
• 為您推薦 3-5 位專業室內設計師
• 提供設計師作品集與服務內容
• 協助您比較報價與選擇

預計時間：3-5 個工作天內完成媒合

我們將盡快安排合適的設計師與您聯繫，請保持電話暢通。

如有緊急需求或疑問，歡迎隨時與我們聯繫。

StyleMatch AI 團隊
`;
          break;

        case "twcid_platform":
          emailSubject = "TWCID平台招標 - 需求轉送確認";
          emailBody = `
親愛的客戶您好，

我們將協助您將設計需求轉送至 TWCID 平台進行招標媒合。

TWCID 平台服務特色：
• 開放式招標競爭機制
• 眾多專業設計師參與提案
• 透明化報價比較
• 完整的平台保障機制

接下來的流程：
1. 我們將整理您的需求資料
2. 協助您在 TWCID 平台建立招標案件
3. 設計師開始提案競標
4. 您可自由選擇合作的設計師

預計 1-2 個工作天內我們會與您聯繫，協助您完成 TWCID 平台的招標流程。

TWCID 平台連結：https://twcid.com

如有任何疑問，歡迎隨時與我們聯繫。

StyleMatch AI 團隊
`;
          break;
      }

      // 發送確認 email
      await SendEmail({
        to: formData.user_email,
        subject: emailSubject,
        body: emailBody,
        from_name: "StyleMatch AI"
      });

      setIsCompleted(true);

    } catch (err) {
      setError(err.message || "送出時發生錯誤，請稍後再試");
      console.error("Error:", err);
    }

    setIsSubmitting(false);
  };

  if (isCompleted) {
    return (
      <Card className="border-none shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-stone-800 mb-2">
            需求提交成功！
          </h3>
          <p className="text-stone-600 text-lg mb-4">
            案件已儲存在這台電腦，並建立本地通知紀錄
          </p>
          <p className="text-stone-500 text-sm">
            您可以前往「本地案件」查看案件編號與目前狀態。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-stone-800 text-center">
          選擇您的服務方案
        </CardTitle>
        <p className="text-stone-600 text-center">
          根據您的需求深度，選擇付費 AI 提案、免費設計師媒合或 TWCID 招標。
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {options.map((option) => (
            <div
              key={option.id}
              className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                option.highlight
                  ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50"
                  : "border-stone-200 hover:border-stone-300 bg-white"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    option.highlight
                      ? "bg-gradient-to-r from-amber-500 to-orange-500"
                      : "bg-stone-100"
                  }`}>
                    <option.icon className={`w-6 h-6 ${
                      option.highlight ? "text-white" : "text-stone-600"
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-800">
                      {option.title}
                    </h3>
                    <p className="text-stone-600 text-sm">
                      {option.description}
                    </p>
                  </div>
                </div>
                <div className={`text-right ${
                  option.highlight ? "text-amber-600" : "text-stone-600"
                }`}>
                  <p className="font-bold text-lg">{option.price}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {option.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className={`w-4 h-4 ${
                      option.highlight ? "text-amber-500" : "text-green-500"
                    }`} />
                    <span className="text-sm text-stone-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleOptionSelect(option.id)}
                disabled={isSubmitting}
                className={`w-full ${
                  option.highlight
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    : "bg-stone-700 hover:bg-stone-800"
                }`}
              >
                {isSubmitting && selectedOption === option.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    處理中...
                  </>
                ) : (
                  <>
                    {option.id === "ai_proposal" && <CreditCard className="w-4 h-4 mr-2" />}
                    {option.id === "platform_matching" && <UserCheck className="w-4 h-4 mr-2" />}
                    {option.id === "twcid_platform" && <Link className="w-4 h-4 mr-2" />}
                    {option.id === "isafe_governance" && <ShieldCheck className="w-4 h-4 mr-2" />}
                    {option.action}
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
          <h4 className="font-semibold text-stone-800 mb-2">服務保證：</h4>
          <ul className="text-sm text-stone-600 space-y-1">
            <li>• 所有服務均提供完整的品質保障</li>
            <li>• 不滿意可申請修正或退款</li>
            <li>• 專業客服團隊全程協助</li>
            <li>• 透明化服務流程與進度追蹤</li>
          </ul>
        </div>

      </CardContent>
    </Card>
  );
}
