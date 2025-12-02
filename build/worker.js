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
  if (!key) {
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
    return new Response(JSON.stringify({ theme: data.theme, words }), { headers: { "content-type": "application/json" } });
  }
  return new Response(JSON.stringify({ error: "Not implemented" }), { status: 501, headers: { "content-type": "application/json" } });
}

async function handleImage() {
  return new Response(JSON.stringify({ imageUrl: null }), { headers: { "content-type": "application/json" } });
}

async function handleTTS() {
  return new Response(JSON.stringify({ audio: null }), { headers: { "content-type": "application/json" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/generate" && request.method === "POST") {
      return handleGenerate(env);
    }
    if (url.pathname === "/api/image" && request.method === "POST") {
      return handleImage();
    }
    if (url.pathname === "/api/tts" && request.method === "POST") {
      return handleTTS();
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
