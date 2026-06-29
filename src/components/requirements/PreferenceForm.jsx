
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { UploadFile } from "@/lib/localAdapters";

export default function PreferenceForm({ formData, onChange }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  const handleReferencePhotoUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadError("");
    
    try {
      const newPhotoUrls = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 檢查檔案類型和大小
        if (!file.type.startsWith('image/')) {
          throw new Error('請上傳圖片檔案（JPG、PNG等格式）');
        }
        
        if (file.size > 1 * 1024 * 1024) {
          throw new Error('本地版圖片檔案不能超過 1MB');
        }
        
        console.log(`正在上傳參考照片 ${i + 1}/${files.length}: ${file.name}`);
        
        // 直接傳遞 File 物件
        const result = await UploadFile({ file: file });
        
        if (result && result.file_url) {
          newPhotoUrls.push(result.file_url);
          console.log(`參考照片 ${i + 1} 上傳成功`);
        } else {
          throw new Error('上傳服務回應格式錯誤');
        }
      }
      
      const updatedPhotos = [...formData.reference_photos, ...newPhotoUrls];
      onChange({ reference_photos: updatedPhotos });
      
    } catch (error) {
      console.error("參考照片上傳錯誤:", error);
      setUploadError(error.message || "上傳失敗，請重新嘗試");
    } finally {
      setIsUploading(false);
      // Clear the file input value to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleReferencePhotoUpload(files);
    }
  };

  const removeReferencePhoto = (indexToRemove) => {
    const updatedPhotos = formData.reference_photos.filter((_, index) => index !== indexToRemove);
    onChange({ reference_photos: updatedPhotos });
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="border-none shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-stone-800 flex items-center gap-2">
          <Heart className="w-5 h-5" />
          喜好氛圍與參考
        </CardTitle>
        <p className="text-stone-600">描述您理想中的居家氛圍，並上傳喜歡的風格參考照片</p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* 氛圍描述 */}
        <div className="space-y-2">
          <Label htmlFor="atmosphere_description" className="text-stone-700 font-medium">
            理想氛圍描述 *
          </Label>
          <Textarea
            id="atmosphere_description"
            value={formData.atmosphere_description}
            onChange={(e) => handleChange("atmosphere_description", e.target.value)}
            placeholder="請詳細描述您希望的居家氛圍，例如：希望是溫馨舒適的感覺，客廳要有溫暖的燈光，臥室要寧靜放鬆，整體色調偏向柔和的大地色系..."
            className="h-32"
            required
          />
          <p className="text-xs text-stone-500">
            建議至少 50 字，詳細的描述能幫助我們更準確地理解您的需求
          </p>
        </div>

        {/* 參考照片上傳 */}
        <div className="space-y-4">
          <Label className="text-stone-700 font-medium">喜好參考照片（選填）</Label>
          
          {uploadError && (
            <Alert variant="destructive">
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-stone-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <div className="w-12 h-12 mx-auto mb-3 bg-stone-100 rounded-full flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-stone-500 animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-stone-500" />
              )}
            </div>
            
            <h4 className="font-semibold text-stone-800 mb-1">
              上傳喜好參考照片
            </h4>
            <p className="text-sm text-stone-600 mb-3">
              上傳您在網路上看到喜歡的室內設計照片
            </p>
            
            <Button
              variant="outline"
              onClick={handleBrowseClick}
              disabled={isUploading}
              className="gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              選擇照片
            </Button>
          </div>

          {/* 已上傳的參考照片 */}
          {formData.reference_photos.length > 0 && (
            <div className="space-y-3">
              <h5 className="font-medium text-stone-700">
                參考照片 ({formData.reference_photos.length})
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.reference_photos.map((photoUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-stone-100">
                      <img
                        src={photoUrl}
                        alt={`參考照片 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeReferencePhoto(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 範例說明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">氛圍描述範例：</h4>
          <div className="text-sm text-blue-700 space-y-2">
            <p className="font-medium">現代簡約風格：</p>
            <p className="italic">"希望整體空間簡潔明亮，以白色和木色為主調，傢具線條俐落簡單，收納功能要充足，營造乾淨舒適的居住環境。"</p>
            
            <p className="font-medium mt-3">溫馨北歐風：</p>
            <p className="italic">"喜歡溫暖的木質調和柔和的燈光，客廳要有舒適的沙發區域，整體色調偏向淺色系，希望營造放鬆療癒的家庭氛圍。"</p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
