import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import BasicInfoForm from "@/components/requirements/BasicInfoForm";
import BudgetEstimation from "@/components/requirements/BudgetEstimation";
import PhotoUploadForm from "@/components/requirements/PhotoUploadForm";
import PreferenceForm from "@/components/requirements/PreferenceForm";
import ServiceOptions from "@/components/requirements/ServiceOptions";
import { createPageUrl } from "@/utils";

const steps = [
  { id: "basic", title: "基本資料", description: "填寫住宅條件與預算範圍" },
  { id: "photos", title: "空間照片", description: "提供格局與現況資料" },
  { id: "preference", title: "偏好需求", description: "整理風格、生活與機能需求" },
  { id: "budget", title: "預算分析", description: "檢視AI預算配置建議" },
  { id: "options", title: "後續方案", description: "完成需求後選擇服務方式" },
];

export default function Requirements() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    user_email: location.state?.user_email || "",
    preferred_service: location.state?.preferred_service || "",
    house_type: "",
    house_age: "",
    square_footage: 0,
    room_layout: "",
    material_grade: "",
    budget_range: "",
    space_photos: {
      floor_plan: [],
      living_room: [],
      dining_room: [],
      kitchen: [],
      master_bedroom: [],
      study_room: [],
      bedroom1: [],
      bedroom2: [],
      bathroom: [],
    },
    atmosphere_description: "",
    reference_photos: [],
    special_requirements: "",
    cultural_preference_enabled: false,
    birth_date: "",
    birth_time: "",
    zodiac_sign: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormDataChange = (updates) => {
    setFormData((previous) => ({ ...previous, ...updates }));
  };

  const isStepValid = () => {
    if (currentStep === 0) {
      return Boolean(formData.user_email && formData.house_type && formData.square_footage > 0 && formData.budget_range);
    }
    if (currentStep === 1) {
      return Object.values(formData.space_photos).some((photos) => photos.length > 0);
    }
    if (currentStep === 2) return Boolean(formData.atmosphere_description.trim());
    return true;
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const returnToPreviousPage = () => {
    if (location.state?.return_to === "StyleTestServices") {
      navigate(-1);
      return;
    }
    navigate(createPageUrl("Home"));
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Button type="button" variant="ghost" onClick={returnToPreviousPage} className="mb-5 px-0 text-stone-600 hover:bg-transparent hover:text-stone-950">
          <ArrowLeft className="mr-2 h-4 w-4" />回上一頁：方案說明
        </Button>
        <header className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900">
            <PenTool className="h-4 w-4" />
            <span>AI 裝修規劃設計提案</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 lg:text-4xl">
            {currentStep === steps.length - 1 ? "選擇後續服務方案" : "填寫裝修規劃需求"}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-stone-600">
            {currentStep === steps.length - 1
              ? "需求資料完成後，再選擇AI提案、設計師媒合或TWCID平台服務。"
              : "依序提供住宅條件、空間資料與設計偏好，完成後才會顯示三種服務選項。"}
          </p>
        </header>

        <Card className="mb-8 border-stone-200 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-stone-700">
                步驟 {currentStep + 1} / {steps.length}：{currentStepData.title}
              </span>
              <span className="text-sm font-medium text-amber-700">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mb-5 h-2" />
            <div className="grid grid-cols-5 gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex min-w-0 flex-col items-center text-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    index <= currentStep ? "bg-amber-500 text-white" : "bg-stone-200 text-stone-500"
                  }`}>
                    {index < currentStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  <p className="mt-1 w-full break-words text-xs text-stone-600">{step.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <main className="mb-8">
          {currentStep === 0 && <BasicInfoForm formData={formData} onChange={handleFormDataChange} />}
          {currentStep === 1 && <PhotoUploadForm formData={formData} onChange={handleFormDataChange} />}
          {currentStep === 2 && <PreferenceForm formData={formData} onChange={handleFormDataChange} />}
          {currentStep === 3 && <BudgetEstimation formData={formData} />}
          {currentStep === 4 && (
            <ServiceOptions
              formData={formData}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
            />
          )}
        </main>

        {currentStep < steps.length - 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />上一步
            </Button>
            <Button
              onClick={() => setCurrentStep((step) => Math.min(steps.length - 1, step + 1))}
              disabled={!isStepValid()}
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              {currentStep === steps.length - 2 ? "選擇你的方案" : "下一步"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
