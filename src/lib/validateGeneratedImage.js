export async function validateGeneratedImage(url) {
  if (typeof url !== "string" || !/^(https?:\/\/|data:image\/|\/(?!\/)|\.\/)/i.test(url)) throw new Error("圖片來源無效。");
  const image = new Image();
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { image.src = ""; reject(new Error("圖片讀取逾時，未扣點。")); }, 15000);
    image.onload = () => { clearTimeout(timer); image.naturalWidth > 0 && image.naturalHeight > 0 ? resolve() : reject(new Error("圖片內容無效，未扣點。")); };
    image.onerror = () => { clearTimeout(timer); reject(new Error("無法讀取生成圖片，未扣點。")); };
    image.src = url;
  });
}
