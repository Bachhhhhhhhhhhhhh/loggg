/** Làm mượt câu trả lời AI trước khi hiển thị */
export function polishAiResponse(text: string): string {
  let out = text.trim();

  out = out.replace(/\r\n/g, "\n");
  out = out.replace(/\n{3,}/g, "\n\n");
  out = out.replace(/[ \t]+/g, " ");
  out = out.replace(/ \n/g, "\n");
  out = out.replace(/\n /g, "\n");

  const roboticOpeners = [
    /^Dựa trên (?:các )?tài liệu(?: được cung cấp)?,?\s*/i,
    /^Theo (?:các )?tài liệu(?: được cung cấp)?,?\s*/i,
    /^Từ (?:các )?ngữ cảnh tài liệu,?\s*/i,
  ];
  for (const pat of roboticOpeners) {
    out = out.replace(pat, "");
  }

  if (out.length > 0) {
    out = out.charAt(0).toUpperCase() + out.slice(1);
  }

  out = out.replace(/([.!?])\s*(\*\*[^*]+\*\*)/g, "$1\n\n$2");
  out = out.replace(/(\*\*[^*]+\*\*)\s*[-•]/g, "$1\n-");

  return out.trim();
}

export function polishSummary(text: string): string {
  return polishAiResponse(text).replace(/\n- /g, "\n\n");
}