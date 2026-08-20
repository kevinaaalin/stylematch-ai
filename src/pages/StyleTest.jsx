import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Loader2, MailCheck, Sparkles, Star, Undo2 } from "lucide-react";

import { styleTestImages as styleImages, STYLE_TEST_IMAGE_MANIFEST_VERSION } from "../data/styleTestImageManifest";
import { STYLE_KEYS } from "../data/styleCatalog";
import ContactForm from "../components/styletest/ContactForm";
import { createStyleTestQuestionSet } from "../lib/styleTestSampling";
import { scoreStyleRatings } from "../lib/styleTestScoring";
import { createPageUrl } from "@/utils";

const FULL_MINIMUM = 15;

const RATING_OPTIONS = [
  { value: 1, label: "完全不喜歡" },
  { value: 2, label: "不太喜歡" },
  { value: 3, label: "普通" },
  { value: 4, label: "喜歡" },
  { value: 5, label: "非常喜歡" },
];

function calculateStyleResult(allRatings, mode, totalImages) {
  const scoring = scoreStyleRatings(allRatings, STYLE_KEYS);
  const completedCount = allRatings.length;
  const confidenceScore = Math.min(100, Math.round((completedCount / totalImages) * 100));

  return {
    ratings: allRatings,
    test_score: scoring.scores,
    test_score_details: scoring.details,
    ranked_style_ids: scoring.ranked_style_ids,
    primary_style: scoring.primary_style,
    secondary_style: scoring.secondary_style,
    scoring_method: "direct_star_sum_v1",
    test_mode: mode,
    completed_count: completedCount,
    total_images: totalImages,
    confidence_score: confidenceScore,
    style_catalog_version: "stylematch.style-catalog.v1",
    image_manifest_version: STYLE_TEST_IMAGE_MANIFEST_VERSION,
  };
}

export default function StyleTest() {
  const navigate = useNavigate();
  const [questionImages, setQuestionImages] = useState(() => createStyleTestQuestionSet(styleImages));
  const [mode, setMode] = useState("full");
  const [currentStep, setCurrentStep] = useState(0);
  const [quickRatings, setQuickRatings] = useState([]);
  const [gridRatings, setGridRatings] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postSubmitStep, setPostSubmitStep] = useState("confirmation");

  useEffect(() => {
    if (!userInfo || postSubmitStep !== "confirmation") return undefined;
    const timer = window.setTimeout(() => navigate(createPageUrl("StyleTestServices"), {
      state: {
        delivery: userInfo.delivery,
        user_email: userInfo.email,
      },
    }), 3000);
    return () => window.clearTimeout(timer);
  }, [navigate, postSubmitStep, userInfo]);

  const fullRatings = useMemo(
    () => questionImages
      .filter((image) => gridRatings[image.id])
      .map((image) => ({
        imageId: image.id,
        styles: image.style,
        rating: gridRatings[image.id],
      })),
    [gridRatings, questionImages]
  );

  const completedFullCount = fullRatings.length;
  const fullProgress = Math.round((completedFullCount / questionImages.length) * 100);
  const quickProgress = Math.round((currentStep / questionImages.length) * 100);

  const resetTest = (nextMode) => {
    setMode(nextMode);
    setCurrentStep(0);
    setQuickRatings([]);
    setGridRatings({});
    setTestResult(null);
    setUserInfo(null);
    setPostSubmitStep("confirmation");
    setQuestionImages(createStyleTestQuestionSet(styleImages));
  };

  const handleContactSubmit = (submittedUserInfo) => {
    setUserInfo(submittedUserInfo);
    setPostSubmitStep("confirmation");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuickRating = (ratingValue) => {
    if (currentStep >= questionImages.length) return;

    const currentImage = questionImages[currentStep];
    const nextRatings = [
      ...quickRatings,
      {
        imageId: currentImage.id,
        styles: currentImage.style,
        rating: ratingValue,
      },
    ];
    const nextStep = currentStep + 1;

    setQuickRatings(nextRatings);
    setCurrentStep(nextStep);

    if (nextStep === questionImages.length) {
      setTimeout(() => {
        setTestResult(calculateStyleResult(nextRatings, "quick_30", questionImages.length));
      }, 250);
    }
  };

  const handleUndo = () => {
    if (currentStep === 0) return;
    setCurrentStep((prev) => prev - 1);
    setQuickRatings((prev) => prev.slice(0, -1));
  };

  const handleGridRating = (imageId, ratingValue) => {
    setGridRatings((prev) => ({
      ...prev,
      [imageId]: prev[imageId] === ratingValue ? undefined : ratingValue,
    }));
  };

  const showFullResult = () => {
    if (completedFullCount < FULL_MINIMUM) return;
    setTestResult(calculateStyleResult(fullRatings, "expanded_30", questionImages.length));
  };

  if (testResult && userInfo === null) {
    return (
      <div className="min-h-screen bg-stone-50 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <ContactForm
            testResult={testResult}
            onSubmit={handleContactSubmit}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        </div>
      </div>
    );
  }

  if (testResult && userInfo !== null) {
    if (postSubmitStep === "confirmation") {
      const delivered = userInfo.delivery?.delivery_status === "sent";
      return (
        <div className="min-h-screen bg-stone-50 py-10 sm:py-16">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <Card className={`border shadow-lg ${delivered ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
              <CardContent className="p-8 text-center sm:p-10">
                <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${delivered ? "bg-emerald-600" : "bg-amber-600"}`}>
                  <MailCheck className="h-8 w-8 text-white" />
                </div>
                <h1 className="mt-5 text-2xl font-bold text-stone-900 sm:text-3xl">
                  {delivered ? "寄送完成" : "結果已完成並保存"}
                </h1>
                <p className="mt-4 text-lg leading-8 text-stone-700">
                  {delivered
                    ? "您的喜好風格排名以及 4 張參考照片已經寄到您的信箱"
                    : "您的喜好風格排名以及 4 張參考照片已保存至本機待寄匣"}
                </p>
                <p className="mt-2 break-all font-semibold text-stone-950">{userInfo.email}</p>
                {!delivered && (
                  <p className="mt-3 text-sm leading-6 text-amber-900">
                    尚未設定 SMTP 郵件帳號；完成設定後即可寄送到上述信箱。
                  </p>
                )}
                <div className="mt-7 flex items-center justify-center gap-2 text-sm text-stone-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  接下來將進入裝修規劃與服務說明頁
                </div>
                <Button
                  type="button"
                  size="lg"
                  onClick={() => navigate(createPageUrl("StyleTestServices"), {
                    state: {
                      delivery: userInfo.delivery,
                      user_email: userInfo.email,
                    },
                  })}
                  className="mt-6 w-full bg-stone-900 text-white hover:bg-stone-800"
                >
                  立即進入說明頁
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

  }

  return (
    <div className="min-h-screen bg-stone-50 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">
            <Sparkles className="h-4 w-4" />
            AI 喜好風格測試
          </div>
          <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">
            從圖片直覺找出你的裝修風格
          </h1>
          <p className="mt-3 text-base text-stone-600 sm:text-lg">
            網頁版可展開 30 張圖片一次評分；也可以切換成逐張快速測驗，依序完成同一組 30 張圖片。
          </p>
        </div>

        <div className="mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => resetTest("full")}
            className={`rounded-lg border p-4 text-left transition ${mode === "full" ? "border-amber-500 bg-white shadow-md" : "border-stone-200 bg-white hover:border-stone-300"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-stone-900">完整網頁版</span>
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">30 張</Badge>
            </div>
            <p className="mt-2 text-sm text-stone-600">展開圖片牆，適合桌機瀏覽，結果信心度更高。</p>
          </button>
          <button
            type="button"
            onClick={() => resetTest("quick")}
            className={`rounded-lg border p-4 text-left transition ${mode === "quick" ? "border-amber-500 bg-white shadow-md" : "border-stone-200 bg-white hover:border-stone-300"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-stone-900">快速測驗</span>
              <Badge variant="secondary">30 張</Badge>
            </div>
            <p className="mt-2 text-sm text-stone-600">逐張評分，適合手機或第一次快速體驗。</p>
          </button>
        </div>

        <div className="mx-auto mt-5 max-w-3xl border-y border-stone-200 py-4">
          <p className="text-center text-sm font-semibold text-stone-800">五星評分方式</p>
          <div className="mt-3 grid grid-cols-5 gap-1 text-center sm:gap-3">
            {RATING_OPTIONS.map((option) => (
              <div key={option.value} className="min-w-0">
                <div className="flex justify-center gap-0.5 text-amber-500">
                  {Array.from({ length: option.value }, (_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current sm:h-4 sm:w-4" />
                  ))}
                </div>
                <p className="mt-1 text-xs text-stone-600">{option.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs leading-5 text-stone-500">
            1 星就是 1 分、5 星就是 5 分；同一風格的所有圖片分數直接加總後排名，總分最高為主要風格、第二名為次要風格。
          </p>
        </div>

        {mode === "full" ? (
          <section className="mt-8">
            <Card className="border-stone-200 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-600">
                      已評分 {completedFullCount} / {questionImages.length} 張
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      評滿 {FULL_MINIMUM} 張即可看結果；完成 30 張會提高結果信心度。
                    </p>
                  </div>
                  <Button
                    onClick={showFullResult}
                    disabled={completedFullCount < FULL_MINIMUM}
                    className="bg-stone-900 text-white hover:bg-stone-800"
                  >
                    查看風格結果
                  </Button>
                </div>
                <Progress value={fullProgress} className="mt-4 h-2" />
              </CardContent>
            </Card>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {questionImages.map((image) => {
                const selectedRating = gridRatings[image.id];
                return (
                  <article key={image.id} className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
                    <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                      <img
                        src={image.src}
                        alt={`室內設計風格參考 ${image.id}`}
                        loading="lazy"
                        onError={(event) => {
                          if (event.currentTarget.dataset.fallbackApplied || !image.fallback_src) return;
                          event.currentTarget.dataset.fallbackApplied = "true";
                          event.currentTarget.src = image.fallback_src;
                        }}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      />
                    </div>
                    <div className="grid grid-cols-5 border-t border-stone-100">
                      {RATING_OPTIONS.map((option) => {
                        const isSelected = selectedRating === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            title={option.label}
                            onClick={() => handleGridRating(image.id, option.value)}
                            className={`flex h-12 items-center justify-center text-stone-500 transition hover:bg-amber-50 hover:text-amber-700 ${isSelected ? "bg-amber-100 text-amber-800" : ""}`}
                          >
                            <Star className={`h-4 w-4 ${isSelected ? "fill-current" : ""}`} />
                          </button>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="mx-auto mt-8 max-w-xl">
            <Card className="mb-5 border-stone-200 shadow-sm">
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-600">
                    第 {Math.min(currentStep + 1, questionImages.length)} / {questionImages.length} 張
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleUndo} disabled={currentStep === 0}>
                    <Undo2 className="mr-1 h-4 w-4" />
                    上一步
                  </Button>
                </div>
                <Progress value={quickProgress} className="h-2" />
              </CardContent>
            </Card>

            {currentStep < questionImages.length ? (
              <>
                <div className="overflow-hidden rounded-lg bg-white shadow-lg">
                  <div className="aspect-[4/3] bg-stone-100">
                    <img
                      src={questionImages[currentStep].src}
                      alt={`室內設計風格參考 ${currentStep + 1}`}
                      onError={(event) => {
                        const image = questionImages[currentStep];
                        if (event.currentTarget.dataset.fallbackApplied || !image.fallback_src) return;
                        event.currentTarget.dataset.fallbackApplied = "true";
                        event.currentTarget.src = image.fallback_src;
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-5 gap-2">
                  {RATING_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant="outline"
                      onClick={() => handleQuickRating(option.value)}
                      className="h-auto min-h-14 px-2 py-2 text-xs sm:text-sm"
                    >
                      <Star className="mr-1 h-4 w-4" />
                      {option.value} 星
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                <CheckCircle className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
                <h2 className="text-xl font-bold text-stone-900">正在分析你的風格偏好</h2>
                <p className="mt-2 text-stone-600">AI 正在整理圖片評分，準備產生風格結果。</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
