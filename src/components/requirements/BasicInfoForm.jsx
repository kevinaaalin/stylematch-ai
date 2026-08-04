import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Home, Mail, Calculator } from "lucide-react";

export default function BasicInfoForm({ formData, onChange }) {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <Card className="border-none shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-stone-800 flex items-center gap-2">
          <Home className="w-5 h-5" />
          房屋基本資訊
        </CardTitle>
        <p className="text-stone-600">請提供您的房屋基本資料與預算規劃</p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-stone-700 font-medium">
            聯絡信箱 *
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
            <Input
              id="email"
              type="email"
              value={formData.user_email}
              onChange={(e) => handleChange("user_email", e.target.value)}
              placeholder="請輸入您的電子郵件"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <input
              id="cultural_preference_enabled"
              type="checkbox"
              checked={Boolean(formData.cultural_preference_enabled)}
              onChange={(event) => handleChange("cultural_preference_enabled", event.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <div className="flex-1">
              <Label htmlFor="cultural_preference_enabled" className="font-semibold text-amber-900">納入生活性格與文化偏好參考（選填）</Label>
              <p className="mt-1 text-xs leading-5 text-amber-800">八字與星座僅作為最高 5% 的情境偏好，不是科學、命理或風水判定，也不會取代直接選擇的風格與空間需求。</p>
            </div>
          </div>
          {formData.cultural_preference_enabled && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="birth_date">出生日期</Label>
                <Input id="birth_date" type="date" value={formData.birth_date || ""} onChange={(event) => handleChange("birth_date", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_time">出生時間</Label>
                <Input id="birth_time" type="time" value={formData.birth_time || ""} onChange={(event) => handleChange("birth_time", event.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="zodiac_sign">星座（可自動推算或自行選擇）</Label>
                <Input id="zodiac_sign" value={formData.zodiac_sign || ""} onChange={(event) => handleChange("zodiac_sign", event.target.value)} placeholder="例如：天秤座；留白時由生日推算" />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-stone-700 font-medium">房屋類型 *</Label>
            <Select
              value={formData.house_type}
              onValueChange={(value) => handleChange("house_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇房屋類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="公寓">公寓</SelectItem>
                <SelectItem value="透天厝">透天厝</SelectItem>
                <SelectItem value="大樓">大樓</SelectItem>
                <SelectItem value="別墅">別墅</SelectItem>
                <SelectItem value="其他">其他</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-stone-700 font-medium">屋齡 *</Label>
            <Select
              value={formData.house_age}
              onValueChange={(value) => handleChange("house_age", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇屋齡" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5年以下">5年以下</SelectItem>
                <SelectItem value="5-15年">5-15年</SelectItem>
                <SelectItem value="15-30年">15-30年</SelectItem>
                <SelectItem value="30年以上">30年以上</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="square_footage" className="text-stone-700 font-medium">
              坪數 *
            </Label>
            <div className="relative">
              <Calculator className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
              <Input
                id="square_footage"
                type="number"
                min="0"
                step="0.1"
                value={formData.square_footage || ""}
                onChange={(e) => handleChange("square_footage", parseFloat(e.target.value) || 0)}
                placeholder="例：25.5"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room_layout" className="text-stone-700 font-medium">
              格局
            </Label>
            <Input
              id="room_layout"
              value={formData.room_layout}
              onChange={(e) => handleChange("room_layout", e.target.value)}
              placeholder="例：3房2廳2衛"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-stone-700 font-medium">建材等級偏好</Label>
            <Select
              value={formData.material_grade}
              onValueChange={(value) => handleChange("material_grade", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇建材等級" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="經濟型">經濟型</SelectItem>
                <SelectItem value="中等級">中等級</SelectItem>
                <SelectItem value="高等級">高等級</SelectItem>
                <SelectItem value="頂級奢華">頂級奢華</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-stone-700 font-medium">預算範圍 *</Label>
            <Select
              value={formData.budget_range}
              onValueChange={(value) => handleChange("budget_range", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇預算範圍" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="依設計師評估">依設計師評估</SelectItem>
                <SelectItem value="50萬以下">50萬以下</SelectItem>
                <SelectItem value="50-100萬">50-100萬</SelectItem>
                <SelectItem value="100-200萬">100-200萬</SelectItem>
                <SelectItem value="200-500萬">200-500萬</SelectItem>
                <SelectItem value="500萬以上">500萬以上</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="special_requirements" className="text-stone-700 font-medium">
            特殊需求
          </Label>
          <Textarea
            id="special_requirements"
            value={formData.special_requirements}
            onChange={(e) => handleChange("special_requirements", e.target.value)}
            placeholder="例：需要寵物友善設計、無障礙空間、特殊收納需求等"
            className="h-24"
          />
        </div>

      </CardContent>
    </Card>
  );
}
