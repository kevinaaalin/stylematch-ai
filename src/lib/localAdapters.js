import { localStore } from "./localStore.js";
import { aiTaskHeaders } from "./aiImageTasks.js";

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
  if (!message.lead || !Array.isArray(message.ai_task_ids)) {
    localStore.addNotification({
      ...message,
      delivery_status: "本機待寄",
    });
    return { success: true, local: true, delivery_status: "outbox_only" };
  }
  const response = await fetch("http://127.0.0.1:4180/api/v1/stylematch/style-test-deliveries", {
    method: "POST",
    headers: aiTaskHeaders({
      idempotencyKey: `style-test-delivery-${crypto.randomUUID()}`,
      purpose: "style_test_result_delivery",
    }),
    body: JSON.stringify(message),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `寄送服務回應錯誤 (${response.status})`);
  localStore.addNotification({
    ...message,
    body: undefined,
    ai_task_ids: undefined,
    delivery_status: payload.delivery_status,
    delivery_id: payload.delivery_id,
    marketing_consent: payload.marketing_consent,
  });
  return payload;
}
