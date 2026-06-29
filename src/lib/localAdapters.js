import { localStore } from "./localStore.js";

const referenceImages = [
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80",
];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("本地圖片讀取失敗"));
    reader.readAsDataURL(file);
  });
}

export const StyleTest = {
  create: async (data) => localStore.createStyleTest(data),
};

export const ProjectRequirement = {
  create: async (data) => localStore.createProject(data),
};

export async function UploadFile({ file }) {
  return { file_url: await fileToDataUrl(file) };
}

export async function GenerateImage({ prompt }) {
  return { url: referenceImages[prompt.length % referenceImages.length] };
}

export async function SendEmail(message) {
  localStore.addNotification({
    ...message,
    delivery_status: "本地模擬完成",
  });
  return { success: true, local: true };
}
