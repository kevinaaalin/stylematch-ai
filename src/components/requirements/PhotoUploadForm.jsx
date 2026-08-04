
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, X, Image as ImageIcon, Loader2, Home } from "lucide-react";
import { UploadFile } from "@/lib/localAdapters";

const spaceTypes = [
  { id: "floor_plan", name: "平面圖", icon: "🗺️", description: "上傳您的房屋平面圖" },
  { id: "living_room", name: "客廳", icon: "🛋️", description: "沙發區、電視牆、茶几等" },
  { id: "dining_room", name: "餐廳", icon: "🍽️", description: "餐桌、餐椅、餐具櫃等" },
  { id: "kitchen", name: "廚房", icon: "🍳", description: "流理台、廚具、收納櫃等" },
  { id: "master_bedroom", name: "主臥房", icon: "🛏️", description: "床鋪、衣櫃、梳妝台等" },
  { id: "study_room", name: "書房", icon: "📚", description: "書桌、書櫃、辦公椅等" },
  { id: "bedroom1", name: "房間1", icon: "🚪", description: "次臥或客房" },
  { id: "bedroom2", name: "房間2", icon: "🚪", description: "兒童房或客房" },
  { id: "bathroom", name: "衛浴", icon: "🛁", description: "洗手台、馬桶、浴缸等" },
  { id: "office", name: "辦公室", icon: "🏢", description: "工作區、會議室、主管室與公共區域" },
  { id: "commercial_space", name: "商業空間", icon: "🏬", description: "店面、展示、接待與服務空間" },
  { id: "reception", name: "接待／門市", icon: "🛎️", description: "櫃台、候位、展示與顧客動線" }
];

export default function PhotoUploadForm({ formData, onChange }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [activeSpace, setActiveSpace] = useState("floor_plan");
  const fileInputRef = useRef(null);

  const handleFileUpload = async (files, spaceType) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadError("");
    
    try {
      const newPhotoUrls = [];
      
      // 逐一上傳每個檔案
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 檢查檔案類型
        if (!file.type.startsWith('image/')) {
          throw new Error('請上傳圖片檔案（JPG、PNG等格式）');
        }
        
        // 本地版以瀏覽器儲存，限制單檔 1MB 避免超過容量
        if (file.size > 1 * 1024 * 1024) {
          throw new Error('本地版圖片檔案不能超過 1MB');
        }
        
        console.log(`正在上傳檔案 ${i + 1}/${files.length}: ${file.name}, 大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        
        // 直接傳遞 File 物件給 UploadFile 整合
        const result = await UploadFile({ file: file });
        
        if (result && result.file_url) {
          newPhotoUrls.push(result.file_url);
          console.log(`檔案 ${i + 1} 上傳成功: ${result.file_url}`);
        } else {
          console.error('上傳結果異常:', result);
          throw new Error('上傳服務回應格式錯誤');
        }
      }
      
      // 更新狀態
      const currentPhotos = formData.space_photos[spaceType] || [];
      const updatedSpacePhotos = {
        ...formData.space_photos,
        [spaceType]: [...currentPhotos, ...newPhotoUrls]
      };
      
      onChange({ space_photos: updatedSpacePhotos });
      console.log('所有檔案上傳完成，已更新狀態');
      
    } catch (error) {
      console.error("詳細上傳錯誤:", error);
      setUploadError(error.message || "上傳失敗，請檢查網路連線或稍後再試");
    } finally {
      setIsUploading(false);
      // 清空檔案輸入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      console.log('選擇了檔案:', files.map(f => f.name));
      handleFileUpload(files, activeSpace);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      console.log('拖放檔案:', files.map(f => f.name));
      handleFileUpload(files, activeSpace);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removePhoto = (spaceType, indexToRemove) => {
    const currentPhotos = formData.space_photos[spaceType] || [];
    const updatedPhotos = currentPhotos.filter((_, index) => index !== indexToRemove);
    const updatedSpacePhotos = {
      ...formData.space_photos,
      [spaceType]: updatedPhotos
    };
    onChange({ space_photos: updatedSpacePhotos });
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getTotalPhotoCount = () => {
    return Object.values(formData.space_photos).reduce((total, photos) => total + (photos ? photos.length : 0), 0);
  };

  const activeSpaceData = spaceTypes.find(space => space.id === activeSpace);

  return (
    <Card className="border-none shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-stone-800 flex items-center gap-2">
          <Camera className="w-5 h-5" />
          空間照片上傳
        </CardTitle>
        <p className="text-stone-600">請選擇空間類型並上傳對應的照片，幫助我們更好地了解您的空間現況</p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {uploadError && (
          <Alert variant="destructive">
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {/* Space Type Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-stone-800">選擇空間類型</h3>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              已上傳 {getTotalPhotoCount()} 張照片
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {spaceTypes.map((space) => (
              <Button
                key={space.id}
                variant="outline"
                onClick={() => setActiveSpace(space.id)}
                className={`h-auto p-4 flex flex-col items-center text-center transition-all ${
                  activeSpace === space.id
                    ? "border-2 border-amber-500 bg-amber-50"
                    : "border-2 border-stone-200 hover:border-stone-300"
                }`}
              >
                <span className="text-2xl mb-1">{space.icon}</span>
                <span className="font-medium text-sm">{space.name}</span>
                {(formData.space_photos[space.id]?.length || 0) > 0 && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {formData.space_photos[space.id].length} 張
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Upload Zone for Selected Space */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activeSpaceData.icon}</span>
            <div>
              <h4 className="font-semibold text-stone-800">{activeSpaceData.name}</h4>
              <p className="text-sm text-stone-600">{activeSpaceData.description}</p>
            </div>
          </div>

          <div 
            className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-stone-400 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
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
              上傳{activeSpaceData.name}照片
            </h4>
            <p className="text-stone-600 mb-3 text-sm">
              拖拽照片到此處，或點擊下方按鈕選擇檔案
            </p>
            <p className="text-xs text-stone-500 mb-3">
              支援 JPG、PNG 格式，本地版單檔不超過 1MB
            </p>
            
            <Button
              variant="outline"
              onClick={handleBrowseClick}
              disabled={isUploading}
              className="gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              {isUploading ? "上傳中..." : "選擇照片"}
            </Button>
          </div>
        </div>

        {/* Uploaded Photos for Current Space */}
        {(formData.space_photos[activeSpace]?.length || 0) > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-stone-800">
              {activeSpaceData.name}已上傳照片 ({formData.space_photos[activeSpace].length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.space_photos[activeSpace].map((photoUrl, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-stone-100">
                    <img
                      src={photoUrl}
                      alt={`${activeSpaceData.name}照片 ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPueZvue9ruWksei0pTwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePhoto(activeSpace, index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overview of All Spaces */}
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
          <h4 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
            <Home className="w-4 h-4" />
            各空間上傳進度
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {spaceTypes.map((space) => (
              <div key={space.id} className="flex items-center justify-between text-sm">
                <span className="text-stone-600">{space.name}：</span>
                <Badge 
                  variant={(formData.space_photos[space.id]?.length || 0) > 0 ? "default" : "outline"}
                  className="text-xs"
                >
                  {(formData.space_photos[space.id]?.length || 0)} 張
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-800 mb-2">拍照小技巧：</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• 確保照片光線充足，避免過暗或過亮</li>
            <li>• 盡量拍攝空間的整體視角，包含主要傢具配置</li>
            <li>• 每個空間建議上傳2-4張不同角度的照片</li>
            <li>• 可以拍攝需要特別關注的細節區域</li>
          </ul>
        </div>

      </CardContent>
    </Card>
  );
}
