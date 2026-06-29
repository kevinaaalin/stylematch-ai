import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, Sparkles, Lock } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// Sample case data (fixed demo)
const SAMPLE_SPACES = [
  { name: "客廳",     value: 30,  color: "#3B5BDB", amount: "NT$60萬" },
  { name: "廚房",     value: 22.5, color: "#F59E0B", amount: "NT$45萬" },
  { name: "主臥",     value: 17.5, color: "#10B981", amount: "NT$35萬" },
  { name: "收納系統", value: 15,  color: "#A78BFA", amount: "NT$30萬" },
  { name: "其他",     value: 15,  color: "#CBD5E1", amount: "NT$30萬" },
];

const CustomLegend = () => (
  <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-4">
    {SAMPLE_SPACES.map((s) => (
      <div key={s.name} className="flex items-center gap-1.5 text-sm text-stone-700">
        <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: s.color }} />
        {s.name} · {s.value}%
      </div>
    ))}
  </div>
);

export default function BudgetEstimation({ formData }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <CircleDollarSign className="w-6 h-6 text-amber-600" />
            AI 裝修預算評估
          </CardTitle>
          <p className="text-stone-600 text-sm">
            以下為案例示意，讓您了解 AI 預算評估的呈現方式。
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Case Summary Tags */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "房屋類型", value: formData.house_type || "大樓" },
              { label: "屋齡",     value: formData.house_age  || "15-30年" },
              { label: "坪數",     value: formData.square_footage ? `${formData.square_footage} 坪` : "35 坪" },
              { label: "建材等級", value: formData.material_grade || "中等級" },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-xl p-3 shadow-sm text-center">
                <p className="text-xs text-stone-400 mb-1">{item.label}</p>
                <p className="font-semibold text-stone-700 text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Donut Chart */}
          <div>
            <p className="text-center text-xs text-stone-400 mb-2">案例示意 — 空間預算配置比例</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={SAMPLE_SPACES}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {SAMPLE_SPACES.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value}%`, name]}
                  contentStyle={{ borderRadius: 10, fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <CustomLegend />
          </div>
        </CardContent>
      </Card>

      {/* Sample Table */}
      <Card className="border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            案例說明 — AI 智能預算配置分析結果
          </CardTitle>
          <p className="text-stone-500 text-sm">透過 AI 預算配置，每個空間依使用頻率與需求智能分配預算。</p>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl overflow-hidden border border-stone-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50">
                  <th className="text-left px-4 py-3 font-semibold text-stone-600">空間項目</th>
                  <th className="text-right px-4 py-3 font-semibold text-stone-600">建議預算</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_SPACES.map((s, i) => (
                  <tr key={s.name} className={i % 2 === 0 ? "bg-white" : "bg-stone-50/50"}>
                    <td className="px-4 py-3 flex items-center gap-2 text-stone-700">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-stone-700 blur-sm select-none">
                      {s.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Locked Notice */}
          <div className="mt-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <Lock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">您的 AI 預算評估將於提案中呈現給您</p>
              <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                根據您的案件資料所生成的個人化預算分析，將在設計提案完成後完整呈現，包含各空間詳細預算配比、建材建議與省錢策略。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
