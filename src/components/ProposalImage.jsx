import React, { useEffect, useState } from 'react';
import { fetchTaskImage } from '@/lib/aiTaskImage';

export default function ProposalImage({ src, alt, ...props }) {
  const [image, setImage] = useState({ source: null, url: '', error: '' });
  let protectedImage = false;
  try {
    protectedImage = /^\/api\/v1\/ai\/image-tasks\/[^/]+\/image$/.test(new URL(src, window.location.href).pathname);
  } catch { /* Invalid image URLs remain visible as an image load failure. */ }
  useEffect(() => {
    if (!protectedImage) return;
    let active = true;
    let objectUrl;
    fetchTaskImage(src).then(blob => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setImage({ source: src, url: objectUrl, error: '' });
    }).catch(() => {
      if (active) setImage({ source: src, url: '', error: '圖片讀取失敗，請確認服務與存取權限。' });
    });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [src, protectedImage]);
  if (!protectedImage) return <img {...props} src={src} alt={alt} crossOrigin="anonymous" />;
  if (image.source !== src || !image.url) return <div className={props.className} data-proposal-image-state={image.source === src && image.error ? 'error' : 'pending'} role="status">{image.source === src && image.error ? image.error : '圖片載入中'}</div>;
  return <img {...props} src={image.url} alt={alt} />;
}
