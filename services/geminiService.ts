import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VocabularyWord } from "../types";
import { decodeBase64 } from "./audioUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// 1. Generate Theme and Words (JSON)
export const generateVocabularySet = async (): Promise<{ theme: string; words: VocabularyWord[] }> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Generate a random, fun theme suitable for children (e.g., Space, Jungle Animals, Superheroes, Fruits, Colors, Under the Sea).
    Then, list exactly 10 English vocabulary words related to this theme.
    For each word, provide:
    - The word itself
    - Phonetic pronunciation (simple)
    - Chinese meaning (suitable for kids)
    - A simple example sentence in English
    - The Chinese translation of the example sentence.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          theme: { type: Type.STRING, description: "The chosen theme" },
          words: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                pronunciation: { type: Type.STRING },
                chinese: { type: Type.STRING },
                example: { type: Type.STRING },
                exampleChinese: { type: Type.STRING },
              },
              required: ["word", "pronunciation", "chinese", "example", "exampleChinese"],
            },
          },
        },
        required: ["theme", "words"],
      },
    },
  });

  const data = JSON.parse(response.text || "{}");
  
  // Add IDs locally
  const wordsWithIds = (data.words || []).map((w: any) => ({
    ...w,
    id: crypto.randomUUID(),
  }));

  return {
    theme: data.theme || "Fun Words",
    words: wordsWithIds,
  };
};

// 2. Generate Image for a Word
export const generateWordImage = async (word: string, theme: string): Promise<string | undefined> => {
  try {
    const model = "gemini-2.5-flash-image";
    const prompt = `A cute, colorful, flat vector illustration of ${word} (theme: ${theme}) on a solid white background. No text. Suitable for children's flashcards. High quality.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error(`Failed to generate image for ${word}:`, error);
    return undefined; // Fallback will be handled by UI
  }
  return undefined;
};

// 3. Generate Speech (TTS)
export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const model = "gemini-2.5-flash-preview-tts";
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text }],
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Puck' or 'Kore' sound friendly
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};