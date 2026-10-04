import React, { useState } from 'react';
import { analyzeStyleMixImage } from '@/lib/structuredSpaceApi';

export default function StyleMixImageSource({ label, source, onChange, onBusy }) {
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  async function upload(file) {
    if (!file) return;
    onChange(null);
    setError('');
    setPreview('');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 6 * 1024 * 1024) {
      setError('請選擇 6 MB 以下的 PNG、JPEG 或 WebP。');
      return;
    }
    onBusy(true);
    try {
      const image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('無法讀取圖片'));
        reader.readAsDataURL(file);
      });
      setPreview(image);
      const result = await analyzeStyleMixImage(image);
      onChange({ ...result, original_dimensions: structuredClone(result.dimensions), human_confirmed: false });
    } catch (failure) { setError(failure.message); }
    finally { onBusy(false); }
  }
  return <section className="min-w-0 space-y-3">
    <label className="grid gap-2">{label} 圖片<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => upload(event.target.files[0])} /></label>
    {preview && <img src={preview} alt={`${label} 來源`} className="aspect-video w-full object-contain" />}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {source && <>
      <p className="text-sm">候選描述，尚非已校準的視覺判斷</p>
      {Object.entries(source.dimensions).map(([key, item]) => <label key={key} className="grid gap-1 text-sm">{key}<input className="min-w-0 rounded border p-2" value={item.value} onChange={event => onChange({ ...source, human_confirmed: false, dimensions: { ...source.dimensions, [key]: { ...item, value: event.target.value } } })} /></label>)}
      <label className="flex gap-2"><input type="checkbox" checked={source.human_confirmed} onChange={event => onChange({ ...source, human_confirmed: event.target.checked, confirmed_at: event.target.checked ? new Date().toISOString() : null })} />已核對並確認候選描述</label>
    </>}
  </section>;
}
