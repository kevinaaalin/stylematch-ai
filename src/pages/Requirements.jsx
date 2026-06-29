import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Upload, CheckCircle } from "lucide-react";

import ServiceIntroduction from "../components/requirements/ServiceIntroduction";
import BasicInfoForm from "../components/requirements/BasicInfoForm";
import PhotoUploadForm from "../components/requirements/PhotoUploadForm";
import PreferenceForm from "../components/requirements/PreferenceForm";
import ServiceOptions from "../components/requirements/ServiceOptions";
import BudgetEstimation from "../components/requirements/BudgetEstimation";

export default function Requirements() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    user_email: "",
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
      bathroom: []
    },
    atmosphere_description: "",
    reference_photos: [],
    special_requirements: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    {
      id: "introduction",
      title: "服務說明",
      description: "了解服務選項"
    },
    {
      id: "basic",
      title: "基本資料",
      description: "房屋基本資訊與預算"
    },
    {
      id: "photos", 
      title: "空間照片",
      description: "上傳各空間現況照片"
    },
    {
      id: "preference",
      title: "喜好描述",
      description: "氛圍描述與參考圖片"
    },
    {
      id: "budget",
      title: "預算評估",
      description: "AI 裝修預算評估"
    },
    {
      id: "options",
      title: "服務選項",
      description: "選擇後續服務方案"
    }
  ];

  const handleFormDataChange = (updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return true; // Introduction step
      case 1:
        return formData.user_email && formData.house_type && formData.square_footage > 0 && formData.budget_range;
      case 2:
        // Check if at least one space has photos
        const hasPhotos = Object.values(formData.space_photos).some(photos => photos.length > 0);
        return hasPhotos;
      case 3:
        return formData.atmosphere_description.trim();
      case 4:
        return true; // Budget estimation step - always valid
      default:
        return true;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Upload className="w-4 h-4" />
            <span>AI 室內設計提案</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-stone-800 mb-2">
            {currentStep === 0 ? "選擇您的裝修規劃服務" : "五步驟需求收集"}
          </h1>
          <p className="text-stone-600 text-lg">
            {currentStep === 0 
              ? "依照需求深度，選擇 AI 提案、設計師媒合或 TWCID 招標" 
              : "提供更詳細的資訊，讓後續提案與媒合更精準"
            }
          </p>
        </div>

        {/* Progress - only show after introduction */}
        {currentStep > 0 && (
          <Card className="mb-8 border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-stone-600">
                  步驟 {currentStep} / {steps.length - 1}: {currentStepData.title}
                </span>
                <span className="text-sm font-medium text-amber-600">
                  {Math.round(((currentStep) / (steps.length - 1)) * 100)}% 完成
                </span>
              </div>
              <Progress value={((currentStep) / (steps.length - 1)) * 100} className="h-2 mb-4" />
              
              {/* Step Indicators */}
              <div className="flex justify-between">
                {steps.slice(1).map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      (index + 1) <= currentStep 
                        ? "bg-amber-500 text-white" 
                        : "bg-stone-200 text-stone-500"
                    }`}>
                      {(index + 1) < currentStep ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <p className="text-xs text-stone-600 mt-1 text-center max-w-20">
                      {step.title}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 0 && (
            <ServiceIntroduction onNext={handleNext} />
          )}
          
          {currentStep === 1 && (
            <BasicInfoForm
              formData={formData}
              onChange={handleFormDataChange}
            />
          )}
          
          {currentStep === 2 && (
            <PhotoUploadForm
              formData={formData}
              onChange={handleFormDataChange}
            />
          )}
          
          {currentStep === 3 && (
            <PreferenceForm
              formData={formData}
              onChange={handleFormDataChange}
            />
          )}
          
          {currentStep === 4 && (
            <BudgetEstimation
              formData={formData}
            />
          )}

          {currentStep === 5 && (
            <ServiceOptions
              formData={formData}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
            />
          )}
        </div>

        {/* Navigation */}
        {currentStep > 0 && currentStep < 5 && (
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              上一步
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-6"
            >
              下一步
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
