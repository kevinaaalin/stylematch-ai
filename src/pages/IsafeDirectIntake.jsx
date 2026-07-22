import React, { useState } from "react";
import { ArrowUpRight, Building2, CheckCircle2, Loader2, ShieldPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDirectIsafeIntake } from "@/lib/isafeApi";

const initialForm = { title: "", applicant_name: "", contact: "", project_location: "", project_type: "residential_renovation", description: "" };

function ResultField({ label, value }) {
  return <div className="border-b border-stone-200 py-3 last:border-b-0"><p className="text-xs text-stone-500">{label}</p><p className="mt-1 break-words font-mono text-sm font-medium text-stone-900">{value || "-"}</p></div>;
}

export default function IsafeDirectIntake() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdCase, setCreatedCase] = useState(null);
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault(); setError(""); setIsSubmitting(true);
    try { const response = await createDirectIsafeIntake(form); setCreatedCase(response.case); }
    catch (requestError) { setError(requestError.message || "iSAFE 直接立案失敗，請稍後再試。"); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-stone-200 pb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white"><ShieldPlus className="h-4 w-4" />iSAFE Direct Intake</div>
          <h1 className="text-3xl font-semibold text-stone-950">iSAFE 直接立案</h1>
          <p className="mt-2 max-w-3xl text-stone-600">適用於未經 StyleMatchAI 或 TWCID 媒合、直接申請工程治理的案件。送出後由 iSAFE 總部進行 D1 初審。</p>
        </div>

        <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-200 pb-3"><Building2 className="h-5 w-5 text-stone-700" /><h2 className="text-lg font-semibold text-stone-900">案件基本資料</h2></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="direct-title">案件名稱</Label><Input id="direct-title" value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="例如：台北住宅翻修工程監管" required /></div>
                <div className="space-y-2"><Label htmlFor="direct-applicant">申請人或公司</Label><Input id="direct-applicant" value={form.applicant_name} onChange={(e) => updateField("applicant_name", e.target.value)} required /></div>
                <div className="space-y-2"><Label htmlFor="direct-contact">聯絡方式</Label><Input id="direct-contact" value={form.contact} onChange={(e) => updateField("contact", e.target.value)} placeholder="Email 或電話" required /></div>
                <div className="space-y-2"><Label htmlFor="direct-location">工程地點</Label><Input id="direct-location" value={form.project_location} onChange={(e) => updateField("project_location", e.target.value)} /></div>
                <div className="space-y-2"><Label>案件類型</Label><Select value={form.project_type} onValueChange={(value) => updateField("project_type", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="residential_renovation">住宅裝修</SelectItem><SelectItem value="commercial_fitout">商業空間</SelectItem><SelectItem value="public_project">公共工程</SelectItem><SelectItem value="other">其他</SelectItem></SelectContent></Select></div>
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="direct-description">治理需求摘要</Label><Textarea id="direct-description" rows={5} value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="說明目前工程階段、希望監管的範圍及已具備的文件。" /></div>
              </div>
            </section>
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-700 hover:bg-emerald-800">{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldPlus className="mr-2 h-4 w-4" />}建立 iSAFE 直接立案</Button>
          </form>

          <aside className="border-l border-stone-200 pl-0 lg:pl-6">
            {createdCase ? <div><div className="flex items-center gap-2 text-emerald-700"><CheckCircle2 className="h-5 w-5" /><h2 className="font-semibold">立案完成</h2></div><Badge className="mt-3 bg-emerald-100 text-emerald-800">D1 初審</Badge><div className="mt-4"><ResultField label="isafe_case_id" value={createdCase.isafe_case_id} /><ResultField label="direct_intake_id" value={createdCase.direct_intake_id} /><ResultField label="project_id" value={createdCase.project_id} /><ResultField label="intake_channel" value={createdCase.intake_channel} /></div><a href={createdCase.workspace_url} target="_blank" rel="noreferrer"><Button variant="outline" className="mt-5 w-full">開啟 iSAFE 專案<ArrowUpRight className="ml-2 h-4 w-4" /></Button></a></div> : <div className="space-y-3 text-sm text-stone-600"><h2 className="font-semibold text-stone-900">直接立案規則</h2><p>不建立 StyleMatchAI 或 TWCID 關聯識別碼。</p><p>系統只建立 iSAFE canonical project、direct intake 與治理案件。</p><p>案件建立後仍須經 iSAFE 人員完成 Evidence 與 Gate 審查。</p></div>}
          </aside>
        </div>
      </div>
    </div>
  );
}
