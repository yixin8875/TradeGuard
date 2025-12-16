import { GoogleGenAI } from "@google/genai";

export const analyzeStrategyImage = async (
  base64Image: string,
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("需要 API 密钥才能进行 AI 分析。");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Clean base64 string if it contains metadata
  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg/png, API handles generic image types well
              data: cleanBase64,
            },
          },
          {
            text: `请分析这张交易策略图片。
            1. 识别“利润状态”规则（例如，利润 < 5%）。
            2. 识别相应的“策略”或“止损”操作。
            3. 用通俗易懂的中文总结逻辑，供交易者参考。
            请将输出格式化为清晰的列表。`
          }
        ]
      }
    });

    return response.text || "无法生成分析结果。";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(`分析失败: ${error.message || "未知错误"}`);
  }
};