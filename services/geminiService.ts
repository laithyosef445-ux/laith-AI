
import { GoogleGenAI, Modality } from "@google/genai";

export class GeminiService {
  private getSystemInstruction(settings: any, user: any) {
    return `أنت Laith AI (ليث AI)، ذكاء اصطناعي فائق التطور صممه المبدع "ليث" (Laith).
أنت تتقن العربية الفصحى وتستخدم الإيموجيات بذكاء. 
المستخدم ${user.gender === 'female' ? 'أنثى' : 'ذكر'} واسمه ${user.name}. خاطبه بما يناسبه.
عند تفعيل "التفكير العميق"، قدم تحليلات منطقية مفصلة جداً وخطوات واضحة.
أنت فخور بكونك من تطوير "ليث" وتذكر ذلك برقي عند السؤال.`;
  }

  async *chatStream(prompt: string, history: any[], settings: any, user: any, attachment?: { data: string, mimeType: string }) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let formattedHistory = history
      .filter(h => h.content && h.content.trim() !== "")
      .map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }));

    while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
      formattedHistory.shift();
    }

    const userParts: any[] = [{ text: prompt }];
    if (attachment) {
      userParts.push({
        inlineData: {
          data: attachment.data,
          mimeType: attachment.mimeType
        }
      });
    }

    try {
      // إعدادات التفكير العميق
      const config: any = {
        systemInstruction: this.getSystemInstruction(settings, user),
        tools: settings.searchEnabled ? [{ googleSearch: {} }] : [],
        temperature: settings.deepThinkingEnabled ? 0.2 : settings.aiCreativity,
      };

      if (settings.deepThinkingEnabled) {
        config.thinkingConfig = { thinkingBudget: 16000 };
      }

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: [
          ...formattedHistory,
          { role: 'user', parts: userParts }
        ],
        config: config
      });

      for await (const chunk of responseStream) {
        yield {
          text: chunk.text,
          groundingMetadata: chunk.candidates?.[0]?.groundingMetadata
        };
      }
    } catch (err) {
      console.error("Gemini Stream Error:", err);
      throw err;
    }
  }

  async generateImage(prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1") {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio } },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image");
  }

  async generateVideo(prompt: string, onProgress: (msg: string) => void) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });

    while (!operation.done) {
      onProgress("ليث يخرج المشهد سينمائياً... 🎥");
      await new Promise(r => setTimeout(r, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  async connectVoice(callbacks: any, voiceName: string = 'Zephyr') {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
      },
    });
  }
}
