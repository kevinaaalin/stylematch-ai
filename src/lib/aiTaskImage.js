import { API_ORIGIN, localDevelopmentToken } from './deploymentConfig.js';

export function taskImageUrl(value) {
  const url = new URL(value, API_ORIGIN);
  if (url.origin !== API_ORIGIN || !/^\/api\/v1\/ai\/image-tasks\/[^/]+\/image$/.test(url.pathname)) {
    throw new Error('生成圖片來源不屬於設定的 API。');
  }
  return url.href;
}

export async function fetchTaskImage(value, caseCode = '*') {
  const url = taskImageUrl(value);
  const response = await fetch(url, {
    signal: AbortSignal.timeout(30000),
    headers: {
      Authorization: `Bearer ${localDevelopmentToken()}`,
      'X-Tenant-Id': 'tenant_local_tigi', 'X-Organization-Id': 'org_local_headquarter',
      'X-User-Id': 'stylematch-local-user', 'X-Member-Tier': 'certified_member',
      'X-Certified-Member-Type': 'designer', 'X-Case-Role': 'designer', 'X-Server-Role': 'headquarter',
      'X-Case-Authorization': caseCode, 'X-Purpose': 'generated_image_read',
      'X-Consent-Ref': 'consent_stylematch_local', 'X-Trace-Id': `image-${crypto.randomUUID()}`,
    },
  });
  if (!response.ok) throw new Error(`生成圖片讀取失敗（${response.status}），未扣點。`);
  const blob = await response.blob();
  if (!/^image\/(png|jpeg|webp)$/.test(blob.type) || blob.size > 8 * 1024 * 1024) throw new Error('生成圖片格式或容量無法保存，未扣點。');
  return blob;
}

export async function taskImageDataUrl(value, caseCode, compact = false) {
  const blob = await fetchTaskImage(value, caseCode);
  if (!compact) return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('生成圖片讀取失敗，未扣點。'));
    reader.readAsDataURL(blob);
  });
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.86);
  } finally { bitmap.close(); }
}
