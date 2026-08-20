function jpegDimensions(bytes) {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) { offset += 1; continue; }
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
    }
    if (length < 2) break;
    offset += length + 2;
  }
  return null;
}

export function imageDimensions(bytes, contentType = "") {
  if (bytes.length >= 24 && bytes.subarray(1, 4).toString() === "PNG") {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if ((contentType.includes("jpeg") || (bytes[0] === 0xff && bytes[1] === 0xd8)) && bytes.length >= 10) return jpegDimensions(bytes);
  return null;
}

export function inspectGeneratedImage({ bytes, contentType, expectedWidth, expectedHeight, outputType = "perspective_draft" }) {
  const dimensions = imageDimensions(bytes, contentType);
  const checks = [
    { code: "FILE_NOT_EMPTY", passed: bytes.length >= 10_000, detail: `${bytes.length} bytes` },
    { code: "SUPPORTED_IMAGE", passed: Boolean(dimensions), detail: contentType || "unknown" },
  ];
  if (dimensions) {
    const widthTolerance = Math.max(4, expectedWidth * 0.02);
    const heightTolerance = Math.max(4, expectedHeight * 0.02);
    checks.push({ code: "EXPECTED_DIMENSIONS", passed: Math.abs(dimensions.width - expectedWidth) <= widthTolerance && Math.abs(dimensions.height - expectedHeight) <= heightTolerance, detail: `${dimensions.width}x${dimensions.height}; expected ${expectedWidth}x${expectedHeight}` });
    if (outputType === "equirectangular_2_1") checks.push({ code: "PANORAMA_ASPECT_2_1", passed: Math.abs(dimensions.width / dimensions.height - 2) <= 0.02, detail: `${dimensions.width}:${dimensions.height}` });
  }
  const technicalPassed = checks.every(({ passed }) => passed);
  return {
    version: "stylematch.image-qa.v1",
    technical_status: technicalPassed ? "passed" : "failed",
    checks,
    dimensions,
    human_review: {
      required: true,
      status: "pending",
      checklist: ["風格符合度", "格局與門窗一致性", "家具重複或變形", "動線可行性", "材質與照明一致性", "文字、Logo與浮水印"],
    },
    advisory_only: true,
  };
}
