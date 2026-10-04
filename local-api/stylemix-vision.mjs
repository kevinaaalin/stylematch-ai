import { spawn } from 'node:child_process';
let busy = false;
export async function analyzeStyleMixImage(payload, { python, script }) {
  if (busy) throw Object.assign(new Error('圖片分析進行中，請稍後再試。'), { status: 409, code: 'STYLEMIX_ANALYSIS_BUSY' });
  if (typeof payload?.image !== 'string' || payload.image.length > 8 * 1024 * 1024 ||
      !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(payload.image)) {
    throw Object.assign(new Error('請提供小於 6 MB 的 PNG、JPEG 或 WebP 圖片。'), { status: 400, code: 'STYLEMIX_IMAGE_INVALID' });
  }
  busy = true;
  try {
    return await new Promise((resolve, reject) => {
      const child = spawn(python, [script], { windowsHide: true, env: { ...process.env, HF_HUB_OFFLINE: '1', TRANSFORMERS_OFFLINE: '1', PYTHONIOENCODING: 'utf-8' } });
      let output = ''; let timedOut = false; let oversized = false;
      const timer = setTimeout(() => { timedOut = true; child.kill(); }, 120000);
      child.stdout.on('data', bytes => { output += bytes; if (output.length > 200000) { oversized = true; child.kill(); } });
      child.stderr.resume();
      child.stdin.on('error', () => {});
      child.on('error', error => { clearTimeout(timer); reject(error); });
      child.on('close', code => {
        clearTimeout(timer);
        if (code !== 0 || timedOut || oversized) return reject(Object.assign(new Error('本機圖片分析未完成，請確認模型已安裝或稍後重試。'), { status: 503, code: 'STYLEMIX_ANALYSIS_FAILED' }));
        try { resolve(JSON.parse(output)); } catch { reject(new Error('圖片分析回傳格式錯誤。')); }
      });
      child.stdin.end(JSON.stringify({ image: payload.image }));
    });
  } finally { busy = false; }
}
