import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Loader2, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { StyleTest, SendEmail } from "@/lib/localAdapters";
import { createAndWaitForImageTask } from "@/lib/aiImageTasks";
import { getStyleById } from "@/data/styleCatalog";

const PRIVACY_NOTICE_VERSION = "stylematch-style-test-20260817-v1";

function retentionUntil(marketingConsent) {
  const date = new Date();
  date.setDate(date.getDate() + (marketingConsent ? 730 : 90));
  return date.toISOString();
}

export default function ContactForm({ testResult, onSubmit, isSubmitting, setIsSubmitting }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    result_delivery_consent: false,
    marketing_consent: false,
  });
  const [error, setError] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!formData.result_delivery_consent) {
      setError("請先確認結果寄送與個人資料蒐集告知。行銷同意不是必填。");
      return;
    }
    setIsSubmitting(true);

    try {
      const consentRecordedAt = new Date().toISOString();
      const primaryStyleName = getStyleById(testResult.primary_style).name;
      const secondaryStyleName = testResult.secondary_style
        ? getStyleById(testResult.secondary_style).name
        : null;
      const consent = {
        privacy_notice_version: PRIVACY_NOTICE_VERSION,
        result_delivery_consent: true,
        marketing_consent: formData.marketing_consent,
        marketing_consent_status: formData.marketing_consent ? "opted_in" : "declined",
        consent_recorded_at: consentRecordedAt,
        consent_source: "style_test",
        retention_until: retentionUntil(formData.marketing_consent),
      };

      const styleTestRecord = await StyleTest.create({
        user_name: formData.name.trim(),
        user_email: formData.email.trim().toLowerCase(),
        user_phone: formData.phone.trim(),
        ratings: testResult.ratings,
        test_score: testResult.test_score,
        test_score_details: testResult.test_score_details,
        ranked_style_ids: testResult.ranked_style_ids,
        primary_style: testResult.primary_style,
        secondary_style: testResult.secondary_style,
        style_catalog_version: testResult.style_catalog_version,
        image_manifest_version: testResult.image_manifest_version,
        style_images_sent: false,
        ...consent,
      });

      const spaces = ["living room", "bedroom", "kitchen", "dining room"];
      const generatedImages = await Promise.all(spaces.map((space, index) => (
        createAndWaitForImageTask({
          prompt: `${primaryStyleName} ${space} interior design, Taiwan residence, practical storage, professional interior photography, natural lighting`,
          outputType: "style_test_reference",
          purpose: "stylematch_style_test_reference",
          operation: {
            primary_style: testResult.primary_style,
            reference_index: index,
            style_test_id: styleTestRecord.id,
          },
        })
      )));

      const rankedScores = (testResult.ranked_style_ids || [])
        .slice(0, 5)
        .map((styleId, index) => `${index + 1}. ${getStyleById(styleId).name}：${testResult.test_score[styleId]} 分`)
        .join("\n");
      const emailBody = `親愛的 ${formData.name.trim()}：

感謝您完成 StyleMatch AI 喜好風格測試。

主要風格：${primaryStyleName}
${secondaryStyleName ? `次要風格：${secondaryStyleName}\n` : ""}
風格分數排名：
${rankedScores}

本信附上 4 張由本機 ComfyUI 依主要風格產生的空間參考圖。

${formData.marketing_consent ? "您已另行同意接收 StyleMatch AI 的設計服務與活動資訊；每封行銷郵件都應提供免費取消方式。" : "您未同意接收行銷資訊，本次僅寄送測驗結果。"}

StyleMatch AI 團隊`;

      const delivery = await SendEmail({
        lead: {
          style_test_id: styleTestRecord.id,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
        },
        consent,
        result: {
          primary_style: testResult.primary_style,
          secondary_style: testResult.secondary_style,
          test_score: testResult.test_score,
          ranked_style_ids: testResult.ranked_style_ids,
        },
        to: formData.email.trim().toLowerCase(),
        subject: `您的 StyleMatch AI 風格結果：${primaryStyleName}`,
        body: emailBody,
        from_name: "StyleMatch AI",
        ai_task_ids: generatedImages.map((image) => image.task.ai_task_id),
      });

      onSubmit({
        ...formData,
        delivery: {
          ...delivery,
          image_urls: generatedImages.map((image) => image.url),
        },
      });
    } catch (submitError) {
      setError(submitError.message || "送出時發生錯誤，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl border-stone-200 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-800">
          <Mail className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl font-bold text-stone-800">寄送風格分析與 4 張參考圖</CardTitle>
        <p className="text-stone-600">填妥資料並確認寄送後，才會顯示完整排名；行銷資訊可自由選擇。</p>
      </CardHeader>
      <CardContent>
        {error && <Alert variant="destructive" className="mb-6"><AlertDescription>{error}</AlertDescription></Alert>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">姓名 *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <Input id="name" value={formData.name} onChange={(event) => handleInputChange("name", event.target.value)} required className="pl-10" autoComplete="name" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">電子郵件 *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <Input id="email" type="email" value={formData.email} onChange={(event) => handleInputChange("email", event.target.value)} required className="pl-10" autoComplete="email" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">聯絡電話（選填）</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <Input id="phone" type="tel" value={formData.phone} onChange={(event) => handleInputChange("phone", event.target.value)} className="pl-10" autoComplete="tel" />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <div>
                <p className="font-semibold text-stone-900">個人資料蒐集告知</p>
                <p className="mt-1 leading-6">蒐集者為 StyleMatch AI；蒐集姓名、Email、選填電話及測驗結果，用於寄送本次分析、客服與您另行同意的行銷聯絡。資料在本機保存：僅寄結果者 90 天；同意行銷者最長 24 個月或撤回為止。</p>
                <p className="mt-1 leading-6">利用地區為本機服務所在地及所設定郵件服務商的處理地區；利用對象為 StyleMatch AI 營運者與寄信所必要的郵件服務商，方式為本機儲存、自動分析及電子郵件寄送。</p>
                <p className="mt-1 leading-6">您可向營運者請求查詢、更正、停止使用、撤回行銷同意或刪除。不提供姓名與 Email 將無法寄送及顯示完整結果，但不影響重新測驗。正式上線前須在隱私權頁面補入營運者法定名稱與聯絡方式。</p>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-md bg-white p-3">
              <input type="checkbox" checked={formData.result_delivery_consent} onChange={(event) => handleInputChange("result_delivery_consent", event.target.checked)} className="mt-1 h-4 w-4 accent-amber-600" />
              <span><strong>必要：</strong>我已閱讀上述告知，並同意使用資料寄送本次結果與附件。</span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-md bg-white p-3">
              <input type="checkbox" checked={formData.marketing_consent} onChange={(event) => handleInputChange("marketing_consent", event.target.checked)} className="mt-1 h-4 w-4 accent-amber-600" />
              <span><strong>選填：</strong>我願意接收設計服務、活動與優惠資訊；可隨時免費取消，不影響取得本次結果。</span>
            </label>
          </div>

          <Button type="submit" size="lg" disabled={isSubmitting || !formData.name.trim() || !formData.email.trim() || !formData.result_delivery_consent} className="w-full bg-stone-900 text-white hover:bg-stone-800">
            {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />正在產生並寄送 4 張圖片</> : <><CheckCircle className="mr-2 h-5 w-5" />寄送並查看完整結果</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
