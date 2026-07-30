import React, { useState } from "react";
import { CheckCircle2, CreditCard, ExternalLink, FileText, Loader2, Sparkles, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectRequirement, SendEmail } from "@/lib/localAdapters";
import { createPageUrl } from "@/utils";

const options = [
  {
    id: "ai_proposal",
    icon: Sparkles,
    title: "AI 裝修規劃設計提案",
    description: "依已填寫的格局、照片、風格與預算，產生個人化空間規劃與設計提案。",
    price: "NT$ 2,999",
    features: ["AI需求分析", "3至5組空間方向", "材料與配色建議", "預算配置摘要"],
    action: "選擇AI設計提案",
    highlighted: true,
  },
  {
    id: "platform_matching",
    icon: UserCheck,
    title: "專業設計師媒合",
    description: "將完整需求交由平台整理，媒合適合的專業設計師進一步確認與實作。",
    price: "免費提出需求",
    features: ["依需求條件媒合", "設計師資料比較", "後續洽談安排", "提案內容作為溝通基礎"],
    action: "提出媒合需求",
  },
  {
    id: "twcid_platform",
    icon: ExternalLink,
    title: "TWCID平台招標媒合",
    description: "把需求轉入TWCID平台，進行會員確認、設計服務媒合或後續招標。",
    price: "依平台規則",
    features: ["會員與資格確認", "正式需求登錄", "設計服務媒合", "保留後續案件銜接"],
    action: "前往TWCID服務",
  },
];

export default function ServiceOptions({ formData, isSubmitting, setIsSubmitting }) {
  const [selectedOption, setSelectedOption] = useState("");
  const [completedProject, setCompletedProject] = useState(null);
  const [error, setError] = useState("");

  const handleOptionSelect = async (option) => {
    if (isSubmitting) return;
    setSelectedOption(option.id);
    setError("");
    setIsSubmitting(true);
    try {
      const project = await ProjectRequirement.create({
        ...formData,
        completion_status: "需求已完成",
        service_option: option.id,
      });
      await SendEmail({
        to: formData.user_email,
        subject: `${option.title}－需求已登記`,
        body: `您的StyleMatch AI需求已完成登記。\n\n案件代碼：${project.case_code}\n選擇方案：${option.title}\n\n後續將依方案內容進行通知。`,
        from_name: "StyleMatch AI",
      });
      setCompletedProject(project);
    } catch (requestError) {
      setError(requestError.message || "需求登記失敗，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedProject) {
    return (
      <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h2 className="mt-4 text-2xl font-bold text-stone-900">需求已完成登記</h2>
          <p className="mt-2 text-stone-600">案件代碼：{completedProject.case_code}</p>
          {completedProject.service_option === "ai_proposal" && (
            <Link to={`${createPageUrl("ProposalReport")}?project=${completedProject.project_id}`}>
              <Button className="mt-5 bg-stone-900 text-white hover:bg-stone-800">
                <FileText className="mr-2 h-4 w-4" />預覽並下載設計提案
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-5">
      <div className="text-center">
        <p className="text-sm font-medium text-amber-700">需求填寫完成</p>
        <h2 className="mt-1 text-2xl font-bold text-stone-900">選擇三種後續方案之一</h2>
        <p className="mt-2 text-stone-600">以下方案說明只會在完成需求與預算分析後顯示。</p>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="grid gap-4 lg:grid-cols-3">
        {options.map((option) => (
          <Card key={option.id} className={`flex flex-col border-stone-200 shadow-sm ${option.highlighted ? "ring-2 ring-amber-400" : ""}`}>
            <CardHeader>
              <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-md ${option.highlighted ? "bg-amber-500 text-white" : "bg-stone-100 text-stone-700"}`}>
                <option.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">{option.title}</CardTitle>
              <p className="font-semibold text-amber-700">{option.price}</p>
              <p className="text-sm leading-6 text-stone-600">{option.description}</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="space-y-2">
                {option.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-stone-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                className={`mt-6 w-full ${option.highlighted ? "bg-amber-500 text-white hover:bg-amber-600" : ""}`}
                variant={option.highlighted ? "default" : "outline"}
                disabled={isSubmitting}
                onClick={() => handleOptionSelect(option)}
              >
                {isSubmitting && selectedOption === option.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : option.id === "ai_proposal" ? (
                  <CreditCard className="mr-2 h-4 w-4" />
                ) : option.id === "platform_matching" ? (
                  <UserCheck className="mr-2 h-4 w-4" />
                ) : (
                  <ExternalLink className="mr-2 h-4 w-4" />
                )}
                {option.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
