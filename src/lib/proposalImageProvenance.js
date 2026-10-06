export function proposalImageProvenance(image) {
  if (image?.provenance === 'no_photo_concept') return '無原照概念圖，現場幾何未驗證。';
  if (image?.provenance === 'source_photo_derived') return '原照衍生設計圖，尺寸與新增配置須現場核對。';
  return '此版本未記錄圖片來源類型，不能據此確認現場幾何。';
}
