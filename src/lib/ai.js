import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);

export async function embedText(text) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const res = await model.embedContent(text);
  return res.embedding.values;
}

export function cosine(a, b) {
  let dot = 0,
    na = 0,
    nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

export async function chatWithGemini({
  system,
  history = [],
  user,
  generationConfig = {},
}) {
  // Modelo correcto
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    // Pasamos el system como systemInstruction (soportado por v1beta)
    systemInstruction: system || "",
  });

  // Mapear roles del historial: assistant -> model
  const mapped = (history || []).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.text }],
  }));

  const contents = [...mapped, { role: "user", parts: [{ text: user }] }];

  const r = await model.generateContent({
    contents,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2048,
      ...generationConfig,
    },
  });

  return r.response.text();
}
