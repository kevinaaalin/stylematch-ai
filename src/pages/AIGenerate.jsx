import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImagePlus, Sparkles, Wand2 } from "lucide-react";

const stylePresets = [
  "簡約現代",
  "北歐風",
  "日式禪風",
  "工業風",
  "地中海",
  "裝飾藝術",
];

const generatedImages = [
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80",
];

export default function AIGenerate() {
  const [style, setStyle] = useState(stylePresets[0]);
  const [space, setSpace] = useState("客廳");
  const [fileUrl, setFileUrl] = useState("");
  const [generationIndex, setGenerationIndex] = useState(0);

  const previewUrl = useMemo(
    () => generatedImages[(style.length + space.length + generationIndex) % generatedImages.length],
    [generationIndex, space, style]
  );

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileUrl(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-amber-100 px-3 py-2 text-sm font-medium text-amber-800">
            <ImagePlus className="h-4 w-4" />
            單張AI空間照片生成模擬
          </div>
          <h1 className="text-3xl font-bold text-stone-950">上傳一張空間照片，快速模擬設計方向</h1>
          <p className="mt-3 max-w-3xl text-stone-600">
            這是 localStorage MVP 的前端模擬版，可先確認體驗流程；正式版再串接 Image Adapter 與圖像生成工作佇列。
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <Card className="border-stone-200 shadow-sm">
            <CardHeader>
              <CardTitle>生成設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">空間類型</label>
                <Input value={space} onChange={(event) => setSpace(event.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">設計風格</label>
                <div className="grid grid-cols-2 gap-2">
                  {stylePresets.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant={style === preset ? "default" : "outline"}
                      onClick={() => setStyle(preset)}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">上傳空間照片</label>
                <Input type="file" accept="image/*" onChange={handleFileChange} />
              </div>
              <Button className="w-full bg-amber-500 text-white hover:bg-amber-600" onClick={() => setGenerationIndex((value) => value + 1)}>
                <Wand2 className="mr-2 h-4 w-4" />
                生成模擬圖
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="overflow-hidden border-stone-200 shadow-sm">
              <CardHeader>
                <CardTitle>原始照片</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-stone-200">
                  {fileUrl ? (
                    <img src={fileUrl} alt="上傳空間照片" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-stone-500">
                      <ImagePlus className="mb-3 h-10 w-10" />
                      尚未上傳照片
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-stone-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  AI 智能設計
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-stone-200">
                  <img src={previewUrl} alt={`${style} ${space} AI設計模擬`} className="h-full w-full object-cover" />
                </div>
                <p className="mt-3 text-sm text-stone-600">
                  模擬結果：{space} / {style}。正式串接後會回存 image_task 與 trace ID。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
