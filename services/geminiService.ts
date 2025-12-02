import { VocabularyWord } from "../types";

// 1. Generate Theme and Words (JSON)
export const generateVocabularySet = async (): Promise<{ theme: string; words: VocabularyWord[] }> => {
  try {
    const res = await fetch('/api/generate', { method: 'POST' });
    const data = await res.json();
    const wordsWithIds: VocabularyWord[] = (data.words || []).map((w: any) => ({ ...w, id: crypto.randomUUID() }));
    return { theme: data.theme || 'Fun Words', words: wordsWithIds };
  } catch {
    const fallback = {
      theme: 'Fruits',
      words: [
        { word: 'apple', pronunciation: 'ˈæpəl', chinese: '苹果', example: 'I eat an apple.', exampleChinese: '我吃一个苹果。' },
        { word: 'banana', pronunciation: 'bəˈnænə', chinese: '香蕉', example: 'Bananas are yellow.', exampleChinese: '香蕉是黄色的。' },
        { word: 'orange', pronunciation: 'ˈɔːrɪndʒ', chinese: '橙子', example: 'The orange is sweet.', exampleChinese: '橙子很甜。' },
        { word: 'grape', pronunciation: 'ɡreɪp', chinese: '葡萄', example: 'Grapes grow in bunches.', exampleChinese: '葡萄成串生长。' },
        { word: 'strawberry', pronunciation: 'ˈstrɔːˌbɛri', chinese: '草莓', example: 'She likes strawberry cake.', exampleChinese: '她喜欢草莓蛋糕。' },
        { word: 'watermelon', pronunciation: 'ˈwɔːtərˌmɛlən', chinese: '西瓜', example: 'We share a watermelon.', exampleChinese: '我们分享一个西瓜。' },
        { word: 'pineapple', pronunciation: 'ˈpaɪˌnæpəl', chinese: '菠萝', example: 'Pineapple is juicy.', exampleChinese: '菠萝很多汁。' },
        { word: 'cherry', pronunciation: 'ˈtʃɛri', chinese: '樱桃', example: 'The cherry is small.', exampleChinese: '樱桃很小。' },
        { word: 'mango', pronunciation: 'ˈmæŋɡoʊ', chinese: '芒果', example: 'He loves mango juice.', exampleChinese: '他喜欢芒果汁。' },
        { word: 'peach', pronunciation: 'piːtʃ', chinese: '桃子', example: 'Peaches are soft.', exampleChinese: '桃子很柔软。' }
      ]
    } as { theme: string; words: Omit<VocabularyWord, 'id'>[] };
    const wordsWithIds: VocabularyWord[] = fallback.words.map(w => ({ ...w, id: crypto.randomUUID() }));
    return { theme: fallback.theme, words: wordsWithIds };
  }
};

// 2. Generate Image for a Word
export const generateWordImage = async (word: string, theme: string): Promise<string | undefined> => {
  try {
    const res = await fetch('/api/image', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ word, theme }) });
    const data = await res.json();
    return data.imageUrl || undefined;
  } catch {
    return undefined;
  }
};
 
// 3. Generate Speech (TTS)
export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const res = await fetch('/api/tts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
    const data = await res.json();
    return data.audio || null;
  } catch {
    return null;
  }
};
