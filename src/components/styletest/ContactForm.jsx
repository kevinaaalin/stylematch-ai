import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Mail, User, Phone, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { StyleTest, GenerateImage, SendEmail } from "@/lib/localAdapters";
import { createAndWaitForImageTask } from "@/lib/aiImageTasks";
import { getStyleById } from "@/data/styleCatalog";

export default function ContactForm({ testResult, onSubmit, isSubmitting, setIsSubmitting }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const styleInfo = {
    modern: "現代簡約", classic: "經典優雅", industrial: "工業風格", scandinavian: "北歐風情",
    minimalist: "極簡主義", bohemian: "波希米亞", japandi: "日式禪風", coastal: "海岸風格",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // 儲存測試結果到資料庫
      const styleTestData = {
        user_name: formData.name,
        user_email: formData.email,
        user_phone: formData.phone,
        ratings: testResult.ratings,
        test_score: testResult.test_score,
        primary_style: testResult.primary_style,
        secondary_style: testResult.secondary_style,
        style_catalog_version: testResult.style_catalog_version,
        image_manifest_version: testResult.image_manifest_version,
        style_images_sent: false // will be true after email sent
      };

      await StyleTest.create(styleTestData);

      // 生成風格參考圖片
      const primaryStyleName = getStyleById(testResult.primary_style).name;
      const imagePrompts = [
        `Beautiful ${testResult.primary_style} living room interior design, professional photography, bright lighting`,
        `Elegant ${testResult.primary_style} bedroom design, cozy atmosphere`,
        `Stunning ${testResult.primary_style} kitchen interior, modern appliances, excellent lighting`,
        `Gorgeous ${testResult.primary_style} dining room, professional interior photography`
      ];
      
      const imageUrls = [];
      const imagePromises = imagePrompts.map(async (prompt, index) => {
        try {
          return await createAndWaitForImageTask({
            prompt,
            outputType: "style_test_reference",
            purpose: "stylematch_style_test_reference",
            operation: { primary_style: testResult.primary_style, reference_index: index },
          });
        } catch {
          return GenerateImage({ prompt });
        }
      });
      const results = await Promise.all(imagePromises);
      results.forEach(res => imageUrls.push(res.url));

      // 發送email
      const emailBody = `
親愛的 ${formData.name}，

感謝您完成 StyleMatch AI 喜好風格測試！

根據您的評分結果，您的風格偏好為：
主要風格：${primaryStyleName}
${testResult.secondary_style ? `次要風格：${getStyleById(testResult.secondary_style).name}`: ''}

我們為您精心挑選了4張 ${primaryStyleName} 的參考圖片：
${imageUrls.map((url, index) => `${index + 1}. ${url}`).join('\n')}

如果您希望獲得更詳細的設計提案，歡迎使用我們的進階需求分析服務。

祝您居家改造愉快！

StyleMatch AI 團隊
`;

      await SendEmail({
        to: formData.email,
        subject: `您的專屬設計風格：${primaryStyleName} - 參考圖片`,
        body: emailBody,
        from_name: "StyleMatch AI"
      });

      // 後續可更新資料庫標記為已發送
      setIsCompleted(true);
      onSubmit(formData);

      // 3秒後自動跳轉到進階需求分析頁面
      setTimeout(() => {
        navigate(createPageUrl("Requirements"));
      }, 3000);

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
            測試完成！
          </h3>
          <p className="text-stone-600 text-lg mb-4">
            結果已儲存在本機，通知內容已建立給 {formData.email}
          </p>
          <p className="text-stone-500 text-sm mb-6 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            即將為您轉至下一步：AI 裝修規劃與設計服務...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg w-full max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-stone-800">
          完成資料填寫
        </CardTitle>
        <p className="text-stone-600">
          請填寫聯絡資訊，我們將寄送風格參考圖片，並帶您進入下一步規劃
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-stone-700 font-medium">
              姓名 *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="pl-10"
                placeholder="請輸入您的姓名"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-stone-700 font-medium">
              電子郵件 *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="pl-10"
                placeholder="請輸入您的電子郵件"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-stone-700 font-medium">
              聯絡電話
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="pl-10"
                placeholder="請輸入您的聯絡電話（選填）"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || !formData.name || !formData.email}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                正在生成風格圖片...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                取得風格圖片與下一步規劃
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-stone-500 text-center mt-4">
          * 為必填項目。我們將保護您的隱私，不會將您的資料提供給第三方。
        </p>
      </CardContent>
    </Card>
  );
}
