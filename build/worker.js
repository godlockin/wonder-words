async function json(req) {
  try {
    const body = await req.text();
    if (!body) return {};
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function id() {
  const s = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  return s;
}

async function handleGenerate(env) {
  const key = env.API_KEY;
  console.log('[api/generate] start', { hasKey: !!key });
  try {
    if (key) {
      const prompt = `Generate a random, fun kid-friendly theme and exactly 10 words with pronunciation, Chinese meaning, example and its Chinese translation.`;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
      const body = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      };
      console.log('[api/generate] request', { url });
      const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body) });
      console.log('[api/generate] response', { status: res.status });
      if (res.ok) {
        const out = await res.json();
        const cand = out?.candidates?.[0];
        console.log('[api/generate] meta', { finishReason: cand?.finishReason, safetyRatings: cand?.safetyRatings });
        const text = out?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        console.log('[api/generate] text length', { length: (text || '').length });
        const data = JSON.parse(text);
        console.log('[api/generate] parsed', { theme: data?.theme, words: Array.isArray(data?.words) ? data.words.length : 0 });
        const words = (data.words || []).map(w => ({ ...w, id: id() }));
        return new Response(JSON.stringify({ theme: data.theme || 'Fun Words', words }), { headers: { 'content-type': 'application/json' } });
      }
    }
  } catch (e) { console.log('[api/generate] error', e); }
  const data = {
    theme: "Fruits",
    words: [
      { word: "apple", pronunciation: "ˈæpəl", chinese: "苹果", example: "I eat an apple.", exampleChinese: "我吃一个苹果。" },
      { word: "banana", pronunciation: "bəˈnænə", chinese: "香蕉", example: "Bananas are yellow.", exampleChinese: "香蕉是黄色的。" },
      { word: "orange", pronunciation: "ˈɔːrɪndʒ", chinese: "橙子", example: "The orange is sweet.", exampleChinese: "橙子很甜。" },
      { word: "grape", pronunciation: "ɡreɪp", chinese: "葡萄", example: "Grapes grow in bunches.", exampleChinese: "葡萄成串生长。" },
      { word: "strawberry", pronunciation: "ˈstrɔːˌbɛri", chinese: "草莓", example: "She likes strawberry cake.", exampleChinese: "她喜欢草莓蛋糕。" },
      { word: "watermelon", pronunciation: "ˈwɔːtərˌmɛlən", chinese: "西瓜", example: "We share a watermelon.", exampleChinese: "我们分享一个西瓜。" },
      { word: "pineapple", pronunciation: "ˈpaɪˌnæpəl", chinese: "菠萝", example: "Pineapple is juicy.", exampleChinese: "菠萝很多汁。" },
      { word: "cherry", pronunciation: "ˈtʃɛri", chinese: "樱桃", example: "The cherry is small.", exampleChinese: "樱桃很小。" },
      { word: "mango", pronunciation: "ˈmæŋɡoʊ", chinese: "芒果", example: "He loves mango juice.", exampleChinese: "他喜欢芒果汁。" },
      { word: "peach", pronunciation: "piːtʃ", chinese: "桃子", example: "Peaches are soft.", exampleChinese: "桃子很柔软。" }
    ]
  };
  const words = data.words.map(w => ({ ...w, id: id() }));
  console.log('[api/generate] fallback fruits');
  return new Response(JSON.stringify({ theme: data.theme, words }), { headers: { "content-type": "application/json" } });
}

async function handleImage(req, env) {
  const key = env.API_KEY;
  try {
    const { word, theme } = await json(req);
    console.log('[api/image] start', { hasKey: !!key, word, theme });
    if (key && word) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`;
      const body = { contents: [{ parts: [{ text: `A cute, colorful, flat vector illustration of ${word} (theme: ${theme}) on a solid white background. No text.` }] }], generationConfig: { imageConfig: { aspectRatio: '1:1' } } };
      console.log('[api/image] request', { url });
      const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body) });
      console.log('[api/image] response', { status: res.status });
      if (res.ok) {
        const out = await res.json();
        const parts = out?.candidates?.[0]?.content?.parts || [];
        console.log('[api/image] parts', { count: parts.length });
        for (const p of parts) {
          if (p.inlineData?.data) {
            console.log('[api/image] inlineData', { size: p.inlineData.data.length });
            return new Response(JSON.stringify({ imageUrl: `data:image/png;base64,${p.inlineData.data}` }), { headers: { 'content-type': 'application/json' } });
          }
        }
      }
    }
  } catch (e) { console.log('[api/image] error', e); }
  console.log('[api/image] fallback null');
  return new Response(JSON.stringify({ imageUrl: null }), { headers: { "content-type": "application/json" } });
}

async function handleTTS(req, env) {
  const key = env.API_KEY;
  try {
    const { text } = await json(req);
    console.log('[api/tts] start', { hasKey: !!key, text });
    if (key && text) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent`;
      const body = { contents: [{ parts: [{ text }] }], generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } } };
      console.log('[api/tts] request', { url });
      const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body) });
      console.log('[api/tts] response', { status: res.status });
      if (res.ok) {
        const out = await res.json();
        const cand = out?.candidates?.[0];
        console.log('[api/tts] meta', { finishReason: cand?.finishReason, safetyRatings: cand?.safetyRatings });
        const audio = out?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
        console.log('[api/tts] audio length', { length: audio ? audio.length : 0 });
        return new Response(JSON.stringify({ audio }), { headers: { 'content-type': 'application/json' } });
      }
    }
  } catch (e) { console.log('[api/tts] error', e); }
  console.log('[api/tts] fallback null');
  return new Response(JSON.stringify({ audio: null }), { headers: { "content-type": "application/json" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/generate" && request.method === "POST") {
      return handleGenerate(env);
    }
    if (url.pathname === "/api/image" && request.method === "POST") {
      return handleImage(request, env);
    }
    if (url.pathname === "/api/tts" && request.method === "POST") {
      return handleTTS(request, env);
    }
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) {
      return asset;
    }
    if (!url.pathname.includes(".")) {
      const indexRequest = new Request(new URL("/index.html", request.url), request);
      return env.ASSETS.fetch(indexRequest);
    }
    return asset;
  }
}
