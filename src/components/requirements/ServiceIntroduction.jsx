import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Users, 
  ExternalLink,
  UserCheck,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function ServiceIntroduction({ onNext }) {
  const serviceOptions = [
    {
      id: "ai_proposal",
      icon: Sparkles,
      title: "付費生成設計提案",
      description: "AI 基於您的需求生成個人化設計提案，包含 3D 效果圖、材料建議、預算分析",
      price: "NT$ 2,999",
      highlights: ["專業 AI 分析", "3-5 個風格提案", "包含 3D 效果圖", "7 天內交付"],
      action: "選擇 NT$2,999 提案",
      color: "from-amber-500 to-orange-500",
      bgColor: "from-amber-50 to-orange-50",
      recommended: true
    },
    {
      id: "platform_matching", 
      icon: UserCheck,
      title: "系統自動媒合設計師",
      description: "填寫詳細表單，由我們的專業團隊為您匹配最適合的室內設計師",
      price: "免費媒合",
      highlights: ["專業團隊人工媒合", "推薦 3-5 位設計師", "作品集展示", "3-5 天完成媒合"],
      action: "選擇免費媒合",
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-50"
    },
    {
      id: "twcid_platform",
      icon: ExternalLink,
      title: "TWCID 平台招標媒合",
      description: "直接使用 TWCID 平台的招標系統，讓多位設計師為您提案競標",
      price: "依招標規則",
      highlights: ["開放式招標競爭", "多位設計師提案", "透明化報價", "自主選擇合作對象"],
      action: "選擇 TWCID 招標",
      color: "from-purple-500 to-purple-600", 
      bgColor: "from-purple-50 to-purple-50"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Users className="w-4 h-4" />
          <span>選擇服務方案</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-stone-800 mb-4">
          三種裝修規劃服務選項
        </h1>
        <p className="text-stone-600 text-lg max-w-2xl mx-auto">
          從 AI 付費提案到設計師媒合，先選擇適合的服務方向，
          再填寫需求，讓後續規劃更精準。
        </p>
      </div>

      {/* Service Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {serviceOptions.map((option) => (
          <Card key={option.id} className={`border-none shadow-lg overflow-hidden ${
            option.recommended ? "ring-2 ring-amber-300" : ""
          }`}>
            {option.recommended && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2">
                <Badge className="bg-white text-amber-600 font-semibold">
                  🔥 推薦選項
                </Badge>
              </div>
            )}
            
            <CardHeader className={`bg-gradient-to-r ${option.bgColor} p-6`}>
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${option.color} rounded-2xl flex items-center justify-center`}>
                  <option.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-stone-800 mb-2">
                  {option.title}
                </CardTitle>
                <p className="text-2xl font-bold text-stone-700">
                  {option.price}
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <p className="text-stone-600 mb-4 text-sm leading-relaxed">
                {option.description}
              </p>
              
              <div className="space-y-2">
                {option.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-stone-700">{highlight}</span>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                onClick={onNext}
                className={`w-full mt-6 bg-gradient-to-r ${option.color} hover:opacity-90 text-white`}
              >
                {option.action}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Process Flow Explanation */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-stone-50 to-stone-100">
        <CardContent className="p-8">
          <h3 className="text-xl font-bold text-stone-800 text-center mb-6">
            接下來的流程
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { step: "1", title: "基本資料", desc: "房屋類型與預算" },
              { step: "2", title: "空間照片", desc: "上傳各空間照片" },
              { step: "3", title: "喜好描述", desc: "氛圍與參考圖片" },
              { step: "4", title: "預算案例", desc: "付費後提供完整評估" },
              { step: "5", title: "選擇服務", desc: "確認服務方案" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  {item.step}
                </div>
                <h4 className="font-semibold text-stone-800 mb-1">{item.title}</h4>
                <p className="text-sm text-stone-600">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button 
              onClick={onNext}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-8 py-3"
            >
              填寫需求
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-800 mb-3">溫馨提醒：</h4>
        <ul className="text-sm text-blue-700 space-y-2">
          <li>• 填寫越詳細的需求，我們能為您提供越精準的服務</li>
          <li>• 所有個人資料均受到隱私保護，不會外洩給第三方</li>
          <li>• 您可以先填寫需求，後續再決定是否付費提案或媒合設計師</li>
          <li>• 如有任何疑問，歡迎隨時與我們的客服團隊聯繫</li>
        </ul>
      </div>
    </div>
  );
}
